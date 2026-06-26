<?php

namespace App\Modules\Invoice\Domain\Services;

use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\Notification\Domain\Services\NotificationService;
use App\Modules\User\Domain\Enums\Permission;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function __construct(
        private readonly WorkflowInstanceService $workflowInstanceService,
        private readonly NotificationService $notificationService,
    ) {}

    /** @return Collection<int, Invoice> */
    public function listByUser(int $userId): Collection
    {
        return Invoice::query()
            ->with('workflowInstance.currentStep')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @return Collection<int, Invoice> */
    public function listAllForUser(User $user): Collection
    {
        $query = Invoice::query()
            ->with(['user', 'workflowInstance.currentStep']);

        if ($user->hasPermission(Permission::InvoicesViewAll->value)) {
            return $query->orderBy('created_at', 'desc')->get();
        }

        $roleIds = $user->roles()->pluck('roles.id');

        $query->where(function ($q) use ($user, $roleIds) {
            // Own invoices
            $q->where('user_id', $user->id);

            // Subordinates' invoices
            $subordinateIds = User::query()
                ->where('manager_id', $user->id)
                ->pluck('id');

            if ($subordinateIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $subordinateIds);
            }

            // Invoices where user is responsible for a workflow step
            $q->orWhereHas('workflowInstance.currentStep', function ($stepQuery) use ($user, $roleIds) {
                $stepQuery->where('responsible_user_id', $user->id);

                if ($roleIds->isNotEmpty()) {
                    $stepQuery->orWhereIn('responsible_role_id', $roleIds);
                }
            });
        });

        return $query->orderBy('created_at', 'desc')->get();
    }

    /** @param  array{competence: string, invoice_number: string, amount: float|string, issue_date: string}  $data */
    public function store(User $user, UploadedFile $file, array $data): Invoice
    {
        $storedName = $file->store('invoices', 'local');

        $invoice = DB::transaction(function () use ($user, $file, $data, $storedName) {
            $invoice = Invoice::query()->create([
                'user_id' => $user->id,
                'competence' => $data['competence'],
                'invoice_number' => $data['invoice_number'],
                'amount' => $data['amount'],
                'issue_date' => $data['issue_date'],
                'status' => 'pending',
                'original_name' => $file->getClientOriginalName(),
                'stored_name' => $storedName,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            $title = "NF {$data['invoice_number']} — {$user->name} — {$data['competence']}";

            $instance = $this->workflowInstanceService->start($user, [
                'workflow_type' => 'invoice',
                'title' => $title,
                'subject_type' => Invoice::class,
                'subject_id' => $invoice->id,
            ]);

            $invoice->update(['workflow_instance_id' => $instance->id]);

            return $invoice->load(['user', 'workflowInstance.currentStep']);
        });

        // Notify uploader
        $this->notificationService->dispatch(
            'invoice_submitted',
            $user,
            "Nota fiscal enviada: NF {$data['invoice_number']}",
            "Sua nota fiscal nº {$data['invoice_number']} (competência {$data['competence']}) foi enviada e está aguardando aprovação.",
        );

        // Notify first step approvers
        $firstStep = $invoice->workflowInstance->currentStep;
        if ($firstStep) {
            $this->notifyApprovers($firstStep, $invoice);
        }

        return $invoice;
    }

    private function notifyApprovers(WorkflowStep $step, Invoice $invoice): void
    {
        $approvers = collect();

        if ($step->responsible_user_id) {
            $approvers->push(User::find($step->responsible_user_id));
        }

        if ($step->responsible_role_id) {
            $roleUsers = User::query()
                ->whereHas('roles', fn ($q) => $q->where('roles.id', $step->responsible_role_id))
                ->where('id', '!=', $invoice->user_id)
                ->get();
            $approvers = $approvers->concat($roleUsers);
        }

        foreach ($approvers->unique('id') as $approver) {
            $this->notificationService->dispatch(
                'invoice_pending_approval',
                $approver,
                "Nova nota fiscal para aprovar: NF {$invoice->invoice_number}",
                "{$invoice->user->name} enviou a nota fiscal nº {$invoice->invoice_number} ({$invoice->competence}) e ela está aguardando sua aprovação.",
            );
        }
    }

    public function delete(Invoice $invoice): void
    {
        Storage::disk('local')->delete($invoice->stored_name);
        $invoice->delete();
    }

    public function getDownloadPath(Invoice $invoice): string
    {
        return Storage::disk('local')->path($invoice->stored_name);
    }
}

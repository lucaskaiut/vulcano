<?php

namespace App\Modules\Invoice\Domain\Services;

use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function __construct(private readonly WorkflowInstanceService $workflowInstanceService) {}

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
    public function listAll(): Collection
    {
        return Invoice::query()
            ->with(['user', 'workflowInstance.currentStep'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @param  array{competence: string, invoice_number: string, amount: float|string, issue_date: string}  $data */
    public function store(User $user, UploadedFile $file, array $data): Invoice
    {
        $storedName = $file->store('invoices', 'local');

        return \DB::transaction(function () use ($user, $file, $data, $storedName) {
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

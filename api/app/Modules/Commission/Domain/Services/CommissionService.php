<?php

namespace App\Modules\Commission\Domain\Services;

use App\Modules\Commission\Domain\Enums\CommissionStatus;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Commission\Domain\Models\Enterprise;
use App\Modules\Commission\Domain\Models\Sale;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use App\Modules\Notification\Domain\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommissionService
{
    public function __construct(
        private readonly WorkflowInstanceService $workflowInstanceService,
        private readonly NotificationService $notificationService,
    ) {}

    /** @return Collection<int, Sale> */
    public function list(User $user): Collection
    {
        $query = Sale::query()
            ->with(['user', 'enterprise', 'commission.workflowInstance.currentStep.responsibleRole']);

        if ($user->hasPermission(PermissionEnum::CommissionsViewAll->value)) {
            return $query->orderByDesc('created_at')->get();
        }

        $query->where(function ($q) use ($user) {
            $q->where('user_id', $user->id);

            $subordinateIds = User::query()
                ->where('manager_id', $user->id)
                ->pluck('id');

            if ($subordinateIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $subordinateIds);
            }

            $roleIds = $user->roles()->pluck('roles.id');
            $q->orWhereHas('commission.workflowInstance.currentStep', function ($stepQuery) use ($user, $roleIds) {
                $stepQuery->where(function ($q) use ($user, $roleIds) {
                    $q->where('responsible_user_id', $user->id);

                    if ($roleIds->isNotEmpty()) {
                        $q->orWhereIn('responsible_role_id', $roleIds);
                    }
                });
            });
        });

        return $query->orderByDesc('created_at')->get();
    }

    /** @param  array{enterprise_id: int, unit: string, sale_date: string, sale_amount: float|string, percentage: float|string, notes?: string|null, invoice_number?: string|null}  $data */
    public function create(User $user, array $data, ?\Illuminate\Http\UploadedFile $invoiceFile = null): Sale
    {
        $saleAmount = (float) $data['sale_amount'];
        $percentage = (float) $data['percentage'];
        $commissionAmount = round($saleAmount * $percentage / 100, 2);
        $title = "Comissão de {$user->name} — R\$ " . number_format($commissionAmount, 2, ',', '.');

        $enterprise = Enterprise::query()->find($data['enterprise_id']);
        $enterpriseName = $enterprise?->name ?? '—';

        $sale = DB::transaction(function () use ($user, $data, $saleAmount, $percentage, $commissionAmount, $title, $invoiceFile) {
            $saleAttributes = [
                'user_id' => $user->id,
                'enterprise_id' => $data['enterprise_id'],
                'unit' => $data['unit'],
                'sale_date' => $data['sale_date'],
                'sale_amount' => $saleAmount,
                'percentage' => $percentage,
                'commission_amount' => $commissionAmount,
                'notes' => $data['notes'] ?? null,
                'invoice_number' => $data['invoice_number'] ?? null,
            ];

            if ($invoiceFile) {
                $saleAttributes['invoice_file_name'] = $invoiceFile->getClientOriginalName();
                $saleAttributes['invoice_file_path'] = $invoiceFile->store('invoices', 'local');
                $saleAttributes['invoice_file_mime'] = $invoiceFile->getMimeType();
                $saleAttributes['invoice_file_size'] = $invoiceFile->getSize();
            }

            $sale = Sale::query()->create($saleAttributes);

            $commission = Commission::query()->create([
                'sale_id' => $sale->id,
                'percentage' => $percentage,
                'commission_amount' => $commissionAmount,
                'status' => CommissionStatus::Pending,
            ]);

            $instance = $this->workflowInstanceService->start($user, [
                'workflow_type' => WorkflowType::Commission->value,
                'title' => $title,
                'subject_type' => Commission::class,
                'subject_id' => $commission->id,
            ]);

            $commission->update(['workflow_instance_id' => $instance->id]);

            return $sale->load(['user', 'enterprise', 'commission.workflowInstance.currentStep']);
        });

        $this->notificationService->dispatch(
            'commission_submitted',
            $user,
            "Venda registrada: {$enterpriseName}",
            "Sua venda {$enterpriseName}/{$data['unit']} foi registrada e a comissão está aguardando aprovação.",
        );

        return $sale;
    }

    public function markAsPaid(Commission $commission, User $payer): Commission
    {
        if ($commission->status !== CommissionStatus::Approved) {
            throw ValidationException::withMessages([
                'status' => 'Apenas comissões aprovadas podem ser marcadas como pagas.',
            ]);
        }

        $commission->update([
            'status' => CommissionStatus::Paid,
            'paid_at' => now(),
            'paid_by_user_id' => $payer->id,
        ]);

        return $commission->load(['sale.user', 'workflowInstance']);
    }
}

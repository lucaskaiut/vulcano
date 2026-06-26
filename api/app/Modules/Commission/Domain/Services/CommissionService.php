<?php

namespace App\Modules\Commission\Domain\Services;

use App\Modules\Commission\Domain\Enums\CommissionStatus;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Commission\Domain\Models\Sale;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommissionService
{
    public function __construct(
        private readonly WorkflowInstanceService $workflowInstanceService,
    ) {}

    /** @return Collection<int, Sale> */
    public function list(User $user): Collection
    {
        $query = Sale::query()
            ->with(['user', 'commission.workflowInstance.currentStep.responsibleRole']);

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
            $q->orWhereHas('commission.workflowInstance', function ($instanceQuery) use ($user, $roleIds) {
                $instanceQuery->whereExists(function ($existsQuery) use ($user, $roleIds) {
                    $existsQuery->selectRaw('1')
                        ->from('workflow_steps')
                        ->whereColumn('workflow_steps.workflow_type', 'workflow_instances.workflow_type')
                        ->where(function ($stepQuery) use ($user, $roleIds) {
                            $stepQuery->where('workflow_steps.responsible_user_id', $user->id);

                            if ($roleIds->isNotEmpty()) {
                                $stepQuery->orWhereIn('workflow_steps.responsible_role_id', $roleIds);
                            }
                        });
                });
            });
        });

        return $query->orderByDesc('created_at')->get();
    }

    /** @param  array{development_name: string, unit: string, sale_date: string, sale_amount: float|string, percentage: float|string, notes?: string|null}  $data */
    public function create(User $user, array $data): Sale
    {
        $saleAmount = (float) $data['sale_amount'];
        $percentage = (float) $data['percentage'];
        $commissionAmount = round($saleAmount * $percentage / 100, 2);

        return DB::transaction(function () use ($user, $data, $saleAmount, $percentage, $commissionAmount) {
            $sale = Sale::query()->create([
                'user_id' => $user->id,
                'development_name' => $data['development_name'],
                'unit' => $data['unit'],
                'sale_date' => $data['sale_date'],
                'sale_amount' => $saleAmount,
                'percentage' => $percentage,
                'commission_amount' => $commissionAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            $commission = Commission::query()->create([
                'sale_id' => $sale->id,
                'percentage' => $percentage,
                'commission_amount' => $commissionAmount,
                'status' => CommissionStatus::Pending,
            ]);

            $instance = $this->workflowInstanceService->start($user, [
                'workflow_type' => WorkflowType::Commission->value,
                'title' => "Comissão de {$user->name} — " . number_format($commissionAmount, 2, ',', '.') . ' (R$ ' . number_format($saleAmount, 2, ',', '.') . ')',
                'subject_type' => Commission::class,
                'subject_id' => $commission->id,
            ]);

            $commission->update(['workflow_instance_id' => $instance->id]);

            return $sale->load(['user', 'commission.workflowInstance.currentStep']);
        });
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

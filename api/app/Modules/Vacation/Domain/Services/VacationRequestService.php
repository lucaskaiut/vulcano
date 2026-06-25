<?php

namespace App\Modules\Vacation\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VacationRequestService
{
    public function __construct(
        private readonly WorkflowInstanceService $workflowInstanceService,
        private readonly VacationBalanceService $vacationBalanceService,
    ) {}

    /** @return Collection<int, VacationRequest> */
    public function list(?int $userId = null): Collection
    {
        return VacationRequest::query()
            ->with(['user', 'workflowInstance.workflow', 'workflowInstance.currentStep'])
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->orderByDesc('created_at')
            ->get();
    }

    public function find(int $id): VacationRequest
    {
        return VacationRequest::query()
            ->with(['user', 'workflowInstance.workflow', 'workflowInstance.currentStep', 'workflowInstance.histories.user'])
            ->findOrFail($id);
    }

    /** @param  array{user_id: int, workflow_id: int, start_date: string, end_date: string, requested_days: int, justification?: string|null}  $data */
    public function create(User $initiator, array $data): VacationRequest
    {
        if ($data['end_date'] < $data['start_date']) {
            throw ValidationException::withMessages([
                'end_date' => 'A data de término deve ser posterior à data de início.',
            ]);
        }

        $existingPending = VacationRequest::query()
            ->where('user_id', $data['user_id'])
            ->whereIn('status', [VacationRequestStatus::Pending])
            ->exists();

        if ($existingPending) {
            throw ValidationException::withMessages([
                'user_id' => 'Já existe uma solicitação de férias pendente para este colaborador.',
            ]);
        }

        return DB::transaction(function () use ($initiator, $data) {
            $request = VacationRequest::query()->create([
                'user_id' => $data['user_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'requested_days' => $data['requested_days'],
                'justification' => $data['justification'] ?? null,
                'status' => VacationRequestStatus::Pending,
            ]);

            $instance = $this->workflowInstanceService->start($initiator, [
                'workflow_id' => $data['workflow_id'],
                'title' => "Solicitação de férias — {$data['start_date']} a {$data['end_date']}",
                'subject_type' => VacationRequest::class,
                'subject_id' => $request->id,
            ]);

            $request->update(['workflow_instance_id' => $instance->id]);

            return $this->find($request->id);
        });
    }

    public function cancel(VacationRequest $request, User $canceller): VacationRequest
    {
        if ($request->status !== VacationRequestStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Apenas solicitações pendentes podem ser canceladas.',
            ]);
        }

        return DB::transaction(function () use ($request, $canceller) {
            $request->update(['status' => VacationRequestStatus::Cancelled]);

            if ($request->workflowInstance) {
                $this->workflowInstanceService->cancel($request->workflowInstance, $canceller);
            }

            return $this->find($request->id);
        });
    }

    /**
     * Called after a workflow instance is fully approved.
     * Debits the vacation balance.
     */
    public function handleWorkflowApproved(WorkflowInstance $instance): void
    {
        if ($instance->subject_type !== VacationRequest::class) {
            return;
        }

        $request = VacationRequest::query()->find($instance->subject_id);

        if (! $request || $request->status !== VacationRequestStatus::Pending) {
            return;
        }

        DB::transaction(function () use ($request) {
            $request->update(['status' => VacationRequestStatus::Approved]);

            $balance = VacationBalance::query()
                ->where('user_id', $request->user_id)
                ->first();

            if ($balance) {
                $this->vacationBalanceService->debitUsedDays($balance, $request->requested_days);
            }
        });
    }

    /**
     * Called after a workflow instance is rejected.
     */
    public function handleWorkflowRejected(WorkflowInstance $instance): void
    {
        if ($instance->subject_type !== VacationRequest::class) {
            return;
        }

        $request = VacationRequest::query()->find($instance->subject_id);

        if (! $request || $request->status !== VacationRequestStatus::Pending) {
            return;
        }

        $request->update(['status' => VacationRequestStatus::Rejected]);
    }
}

<?php

namespace App\Modules\Vacation\Domain\Services;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus as RequestStatus;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use App\Modules\Notification\Domain\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VacationRequestService
{
    public function __construct(
        private readonly WorkflowInstanceService $workflowInstanceService,
        private readonly NotificationService $notificationService,
    ) {}

    /** @return Collection<int, VacationRequest> */
    public function list(User $user): Collection
    {
        $query = VacationRequest::query()
            ->with(['user', 'workflowInstance.currentStep.responsibleRole', 'workflowInstance.currentStep.responsibleUser']);

        if ($user->hasPermission(PermissionEnum::VacationRequestsViewAll->value)) {
            return $query->orderByDesc('created_at')->get();
        }

        $roleIds = $user->roles()->pluck('roles.id');

        $query->where(function ($q) use ($user, $roleIds) {
            $q->where('user_id', $user->id);

            $subordinateIds = User::query()
                ->where('manager_id', $user->id)
                ->pluck('id');

            if ($subordinateIds->isNotEmpty()) {
                $q->orWhereIn('user_id', $subordinateIds);
            }

            $q->orWhereHas('workflowInstance.currentStep', function ($stepQuery) use ($user, $roleIds) {
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

    /** @param  array{start_date: string, end_date: string, justification?: string|null}  $data */
    public function create(User $user, array $data): VacationRequest
    {
        $startDate = \Carbon\Carbon::parse($data['start_date']);
        $endDate = \Carbon\Carbon::parse($data['end_date']);

        if ($startDate->gt($endDate)) {
            throw ValidationException::withMessages([
                'end_date' => 'A data de término deve ser posterior à data de início.',
            ]);
        }

        $requestedDays = $startDate->diffInDays($endDate) + 1;
        $title = "Férias de {$user->name} — " . $startDate->format('d/m') . ' a ' . $endDate->format('d/m/Y');

        $request = DB::transaction(function () use ($user, $data, $requestedDays, $startDate, $endDate, $title) {
            $request = VacationRequest::query()->create([
                'user_id' => $user->id,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'requested_days' => $requestedDays,
                'justification' => $data['justification'] ?? null,
                'status' => VacationRequestStatus::Pending,
            ]);

            $instance = $this->workflowInstanceService->start($user, [
                'workflow_type' => WorkflowType::VacationRequest->value,
                'title' => $title,
                'subject_type' => VacationRequest::class,
                'subject_id' => $request->id,
            ]);

            $request->update(['workflow_instance_id' => $instance->id]);

            return $request->load(['user', 'workflowInstance.currentStep']);
        });

        $this->notificationService->dispatch(
            'vacation_request_submitted',
            $user,
            "Solicitação de férias enviada: {$title}",
            "Sua solicitação de férias ({$startDate->format('d/m/Y')} a {$endDate->format('d/m/Y')}) foi enviada e está aguardando aprovação.",
        );

        return $request;
    }

    public function cancel(VacationRequest $request, User $user): VacationRequest
    {
        if ($request->user_id !== $user->id
            && ! $user->hasPermission(PermissionEnum::VacationRequestsViewAll->value)) {
            abort(403, 'Acesso negado.');
        }

        if ($request->status !== VacationRequestStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Apenas solicitações pendentes podem ser canceladas.',
            ]);
        }

        if ($request->workflow_instance_id) {
            $instance = $request->workflowInstance()->first();
            if ($instance) {
                $this->workflowInstanceService->cancel($instance, $user);
            }
        }

        $request->update(['status' => VacationRequestStatus::Cancelled]);

        return $request->load(['user', 'workflowInstance.currentStep']);
    }
}

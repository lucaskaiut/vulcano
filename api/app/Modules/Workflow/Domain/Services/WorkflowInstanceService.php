<?php

namespace App\Modules\Workflow\Domain\Services;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Vacation\Domain\Services\VacationGrantService;
use App\Modules\Workflow\Domain\Enums\WorkflowHistoryAction;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowInstanceHistory;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkflowInstanceService
{
    /** @return Collection<int, WorkflowInstance> */
    public function list(User $user): Collection
    {
        $query = WorkflowInstance::query()
            ->with(['currentStep', 'initiatedBy', 'histories.user']);

        if ($user->hasPermission(PermissionEnum::WorkflowInstancesViewAll->value)) {
            return $query->orderByDesc('created_at')->get();
        }

        $roleIds = $user->roles()->pluck('roles.id');

        $query->where(function ($q) use ($user, $roleIds) {
            $q->where('initiated_by_user_id', $user->id);

            $subordinateIds = User::query()
                ->where('manager_id', $user->id)
                ->pluck('id');

            if ($subordinateIds->isNotEmpty()) {
                $q->orWhere(function ($subQ) use ($subordinateIds) {
                    $subQ->whereIn('initiated_by_user_id', $subordinateIds)
                        ->whereHas('currentStep', function ($stepQuery) {
                            $stepQuery->whereJsonContains('visibility_rules', ['type' => 'manager']);
                        });
                });
            }

            if ($roleIds->isNotEmpty()) {
                $q->orWhereHas('currentStep', function ($stepQuery) use ($roleIds) {
                    $stepQuery->where(function ($sq) use ($roleIds) {
                        foreach ($roleIds as $roleId) {
                            $sq->orWhereJsonContains('visibility_rules', ['type' => 'role', 'id' => $roleId]);
                        }
                    });
                });
            }

            $q->orWhereHas('currentStep', function ($stepQuery) use ($user) {
                $stepQuery->whereJsonContains('visibility_rules', ['type' => 'user', 'id' => $user->id]);
            });
        });

        return $query->orderByDesc('created_at')->get();
    }

    /** @param  array{workflow_type: string, title: string, subject_type?: string|null, subject_id?: int|null}  $data */
    public function start(User $initiator, array $data): WorkflowInstance
    {
        $type = WorkflowType::from($data['workflow_type']);

        $steps = WorkflowStep::query()
            ->where('workflow_type', $type->value)
            ->orderBy('order')
            ->get();

        if ($steps->isEmpty()) {
            throw ValidationException::withMessages([
                'workflow_type' => 'O fluxo não possui etapas configuradas.',
            ]);
        }

        $firstStep = $steps->first();

        $instance = DB::transaction(function () use ($type, $initiator, $data, $firstStep) {
            $instance = WorkflowInstance::query()->create([
                'workflow_type' => $type->value,
                'title' => $data['title'],
                'status' => WorkflowInstanceStatus::InProgress,
                'current_step_id' => $firstStep->id,
                'initiated_by_user_id' => $initiator->id,
                'subject_type' => $data['subject_type'] ?? null,
                'subject_id' => $data['subject_id'] ?? null,
            ]);

            $this->recordHistory(
                $instance,
                $initiator,
                WorkflowHistoryAction::Started,
                null,
            );

            return $this->find($instance->id);
        });

        $this->notifyStepApprovers($firstStep, $instance);

        return $instance;
    }

    public function find(int $id): WorkflowInstance
    {
        return WorkflowInstance::query()
            ->with([
                'currentStep',
                'initiatedBy',
                'histories.user',
                'histories.step',
            ])
            ->findOrFail($id);
    }

    public function approve(WorkflowInstance $instance, User $approver, ?string $notes = null): WorkflowInstance
    {
        $this->assertInProgress($instance);
        $currentStep = $this->resolveCurrentStep($instance);
        $this->assertCanActOnStep($approver, $currentStep, $instance);

        $nextStep = null;

        $result = DB::transaction(function () use ($instance, $approver, $currentStep, $notes, &$nextStep) {
            $this->recordHistory(
                $instance,
                $approver,
                WorkflowHistoryAction::Approved,
                $currentStep,
                $notes,
            );

            $nextStep = WorkflowStep::query()
                ->where('workflow_type', $instance->workflow_type)
                ->where('order', '>', $currentStep->order)
                ->orderBy('order')
                ->first();

            if ($nextStep) {
                $instance->update(['current_step_id' => $nextStep->id]);

                return false;
            }

            $instance->update([
                'status' => WorkflowInstanceStatus::Approved,
                'current_step_id' => null,
            ]);

            return true;
        });

        if ($result === true) {
            $this->handleSubjectApproval($instance);
            $this->notifyApproval($instance);
        } elseif ($nextStep) {
            $this->notifyStepApprovers($nextStep, $instance);
        }

        return $this->find($instance->id);
    }

    public function reject(WorkflowInstance $instance, User $rejector, ?string $notes = null): WorkflowInstance
    {
        $this->assertInProgress($instance);
        $currentStep = $this->resolveCurrentStep($instance);
        $this->assertCanActOnStep($rejector, $currentStep, $instance);

        DB::transaction(function () use ($instance, $rejector, $currentStep, $notes) {
            $this->recordHistory(
                $instance,
                $rejector,
                WorkflowHistoryAction::Rejected,
                $currentStep,
                $notes,
            );

            $instance->update([
                'status' => WorkflowInstanceStatus::Rejected,
                'current_step_id' => null,
            ]);

            $this->handleSubjectRejection($instance);
        });

        $this->notifyRejection($instance, $rejector, $notes);

        return $this->find($instance->id);
    }

    public function cancel(WorkflowInstance $instance, User $canceller, ?string $notes = null): WorkflowInstance
    {
        $this->assertInProgress($instance);

        return DB::transaction(function () use ($instance, $canceller, $notes) {
            $this->recordHistory(
                $instance,
                $canceller,
                WorkflowHistoryAction::Cancelled,
                $instance->currentStep,
                $notes,
            );

            $instance->update([
                'status' => WorkflowInstanceStatus::Cancelled,
                'current_step_id' => null,
            ]);

            return $this->find($instance->id);
        });
    }

    private function assertInProgress(WorkflowInstance $instance): void
    {
        if ($instance->status !== WorkflowInstanceStatus::InProgress) {
            throw ValidationException::withMessages([
                'status' => 'Este processo não está em andamento.',
            ]);
        }
    }

    private function resolveCurrentStep(WorkflowInstance $instance): WorkflowStep
    {
        $step = $instance->currentStep;

        if (! $step) {
            throw ValidationException::withMessages([
                'current_step_id' => 'Não há etapa pendente neste processo.',
            ]);
        }

        return $step;
    }

    private function assertCanActOnStep(User $user, WorkflowStep $step, WorkflowInstance $instance): void
    {
        $rules = $step->approval_rules ?? [];

        foreach ($rules as $rule) {
            $type = $rule['type'] ?? null;

            if ($type === 'user' && ($rule['id'] ?? null) === $user->id) {
                return;
            }

            if ($type === 'role') {
                $hasRole = $user->roles()
                    ->where('roles.id', $rule['id'] ?? null)
                    ->exists();

                if ($hasRole) {
                    return;
                }
            }

            if ($type === 'manager') {
                if ($user->id === $instance->initiated_by_user_id) {
                    return;
                }

                $subordinateIds = \App\Modules\User\Domain\Models\User::query()
                    ->where('manager_id', $user->id)
                    ->pluck('id');

                if ($subordinateIds->contains($instance->initiated_by_user_id)) {
                    return;
                }
            }
        }

        throw ValidationException::withMessages([
            'approver' => 'Você não é o responsável pela etapa atual.',
        ]);
    }

    private function recordHistory(
        WorkflowInstance $instance,
        User $user,
        WorkflowHistoryAction $action,
        ?WorkflowStep $step,
        ?string $notes = null,
    ): void {
        WorkflowInstanceHistory::query()->create([
            'workflow_instance_id' => $instance->id,
            'user_id' => $user->id,
            'workflow_step_id' => $step?->id,
            'action' => $action,
            'notes' => $notes,
        ]);
    }

    private function handleSubjectApproval(WorkflowInstance $instance): void
    {
        if ($instance->subject_type === VacationRequest::class && $instance->subject_id) {
            $request = VacationRequest::query()->find($instance->subject_id);

            if (! $request) {
                return;
            }

            $request->update(['status' => \App\Modules\Vacation\Domain\Enums\VacationRequestStatus::Approved]);

            $balance = VacationBalance::query()
                ->where('user_id', $request->user_id)
                ->first();

            if (! $balance) {
                return;
            }

            app(VacationGrantService::class)->create([
                'user_id' => $request->user_id,
                'start_date' => $request->start_date->toDateString(),
                'end_date' => $request->end_date->toDateString(),
                'days_used' => $request->requested_days,
            ]);

            return;
        }

        if ($instance->subject_type === \App\Modules\Invoice\Domain\Models\Invoice::class && $instance->subject_id) {
            $invoice = \App\Modules\Invoice\Domain\Models\Invoice::query()->find($instance->subject_id);

            if ($invoice) {
                $invoice->update(['status' => 'approved']);
            }
        }
    }

    private function handleSubjectRejection(WorkflowInstance $instance): void
    {
        if ($instance->subject_type === \App\Modules\Invoice\Domain\Models\Invoice::class && $instance->subject_id) {
            $invoice = \App\Modules\Invoice\Domain\Models\Invoice::query()->find($instance->subject_id);

            if ($invoice) {
                $invoice->update(['status' => 'rejected']);
            }
        }
    }

    private function notifyApproval(WorkflowInstance $instance): void
    {
        $initiator = $instance->initiatedBy;
        if (! $initiator) return;

        $title = "Processo aprovado: {$instance->title}";
        $body = "Seu processo \"{$instance->title}\" foi totalmente aprovado.";

        app(\App\Modules\Notification\Domain\Services\NotificationService::class)
            ->dispatch('workflow_approved', $initiator, $title, $body);
    }

    private function notifyRejection(WorkflowInstance $instance, User $rejector, ?string $notes = null): void
    {
        $initiator = $instance->initiatedBy;
        if (! $initiator) return;

        $title = "Processo reprovado: {$instance->title}";
        $body = "Seu processo \"{$instance->title}\" foi reprovado por {$rejector->name}.";
        if ($notes) {
            $body .= " Motivo: {$notes}";
        }

        app(\App\Modules\Notification\Domain\Services\NotificationService::class)
            ->dispatch('workflow_rejected', $initiator, $title, $body);
    }

    private function notifyStepApprovers(WorkflowStep $step, WorkflowInstance $instance): void
    {
        $initiatorId = $instance->initiated_by_user_id;
        $notificationService = app(\App\Modules\Notification\Domain\Services\NotificationService::class);

        $approvers = collect();

        foreach (($step->approval_rules ?? []) as $rule) {
            $type = $rule['type'] ?? null;

            if ($type === 'user' && ($rule['id'] ?? null) !== $initiatorId) {
                $approvers->push(\App\Modules\User\Domain\Models\User::find($rule['id']));
            }

            if ($type === 'role') {
                $roleUsers = \App\Modules\User\Domain\Models\User::query()
                    ->whereHas('roles', fn ($q) => $q->where('roles.id', $rule['id'] ?? null))
                    ->where('id', '!=', $initiatorId)
                    ->get();
                $approvers = $approvers->concat($roleUsers);
            }

            if ($type === 'manager') {
                $managerId = User::find($initiatorId)?->manager_id;

                if ($managerId && $managerId !== $initiatorId) {
                    $approvers->push(\App\Modules\User\Domain\Models\User::find($managerId));
                }
            }
        }

        foreach ($approvers->unique('id') as $approver) {
            $notificationService->dispatch(
                'step_pending_approval',
                $approver,
                "Nova etapa para aprovar: {$instance->title}",
                "O processo \"{$instance->title}\" chegou na etapa \"{$step->name}\" e está aguardando sua aprovação.",
            );
        }
    }
}

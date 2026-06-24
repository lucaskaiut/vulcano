<?php

namespace App\Modules\Workflow\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowHistoryAction;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowInstanceHistory;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkflowInstanceService
{
    /** @param  array{workflow_id: int, title: string, subject_type?: string|null, subject_id?: int|null}  $data */
    public function start(User $initiator, array $data): WorkflowInstance
    {
        $workflow = Workflow::query()->with('steps')->findOrFail($data['workflow_id']);

        if (! $workflow->is_active) {
            throw ValidationException::withMessages([
                'workflow_id' => 'Este fluxo está inativo e não pode iniciar novos processos.',
            ]);
        }

        $firstStep = $workflow->steps->sortBy('order')->first();

        if (! $firstStep) {
            throw ValidationException::withMessages([
                'workflow_id' => 'O fluxo não possui etapas configuradas.',
            ]);
        }

        return DB::transaction(function () use ($workflow, $initiator, $data, $firstStep) {
            $instance = WorkflowInstance::query()->create([
                'workflow_id' => $workflow->id,
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
    }

    public function find(int $id): WorkflowInstance
    {
        return WorkflowInstance::query()
            ->with([
                'workflow.steps.responsibleRole',
                'currentStep.responsibleRole',
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
        $this->assertCanActOnStep($approver, $currentStep);

        return DB::transaction(function () use ($instance, $approver, $currentStep, $notes) {
            $this->recordHistory(
                $instance,
                $approver,
                WorkflowHistoryAction::Approved,
                $currentStep,
                $notes,
            );

            $nextStep = WorkflowStep::query()
                ->where('workflow_id', $instance->workflow_id)
                ->where('order', '>', $currentStep->order)
                ->orderBy('order')
                ->first();

            if ($nextStep) {
                $instance->update(['current_step_id' => $nextStep->id]);
            } else {
                $instance->update([
                    'status' => WorkflowInstanceStatus::Approved,
                    'current_step_id' => null,
                ]);
            }

            return $this->find($instance->id);
        });
    }

    public function reject(WorkflowInstance $instance, User $rejector, ?string $notes = null): WorkflowInstance
    {
        $this->assertInProgress($instance);
        $currentStep = $this->resolveCurrentStep($instance);
        $this->assertCanActOnStep($rejector, $currentStep);

        return DB::transaction(function () use ($instance, $rejector, $currentStep, $notes) {
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

            return $this->find($instance->id);
        });
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

    private function assertCanActOnStep(User $user, WorkflowStep $step): void
    {
        if ($step->responsible_user_id && $step->responsible_user_id === $user->id) {
            return;
        }

        if ($step->responsible_role_id) {
            $hasRole = $user->roles()
                ->where('roles.id', $step->responsible_role_id)
                ->exists();

            if ($hasRole) {
                return;
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
}

<?php

namespace App\Modules\Workflow\Domain\Services;

use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkflowStepService
{
    /** @return Collection<int, WorkflowStep> */
    public function listByType(WorkflowType $type): Collection
    {
        return WorkflowStep::query()
            ->where('workflow_type', $type->value)
            ->orderBy('order')
            ->with(['responsibleRole', 'responsibleUser'])
            ->get();
    }

    /** @param  array{name: string, order?: int, responsible_role_id?: int|null, responsible_user_id?: int|null}  $data */
    public function create(WorkflowType $type, array $data): WorkflowStep
    {
        $order = $data['order'] ?? ($this->maxOrder($type) + 1);

        return WorkflowStep::query()->create([
            'workflow_type' => $type->value,
            'name' => $data['name'],
            'order' => $order,
            'responsible_role_id' => $data['responsible_role_id'] ?? null,
            'responsible_user_id' => $data['responsible_user_id'] ?? null,
        ])->load(['responsibleRole', 'responsibleUser']);
    }

    /** @param  array{name?: string, order?: int, responsible_role_id?: int|null, responsible_user_id?: int|null}  $data */
    public function update(WorkflowStep $step, array $data): WorkflowStep
    {
        return DB::transaction(function () use ($step, $data) {
            if (array_key_exists('order', $data) && (int) $data['order'] !== $step->order) {
                $this->reorder($step, (int) $data['order']);
            }

            $attributes = [];

            foreach (['name', 'responsible_role_id', 'responsible_user_id'] as $field) {
                if (array_key_exists($field, $data)) {
                    $attributes[$field] = $data[$field];
                }
            }

            if ($attributes !== []) {
                $step->update($attributes);
            }

            return $step->fresh(['responsibleRole', 'responsibleUser']);
        });
    }

    public function delete(WorkflowStep $step): void
    {
        DB::transaction(function () use ($step) {
            $type = $step->workflow_type;
            $deletedOrder = $step->order;

            $this->reassignInstancesBeforeDelete($step, $type);

            $step->delete();

            WorkflowStep::query()
                ->where('workflow_type', $type)
                ->where('order', '>', $deletedOrder)
                ->decrement('order');
        });
    }

    public function reorder(WorkflowStep $step, int $newOrder): void
    {
        if ($newOrder < 1) {
            throw ValidationException::withMessages([
                'order' => 'A ordem da etapa deve ser maior que zero.',
            ]);
        }

        $maxOrder = $this->maxOrder(WorkflowType::from($step->workflow_type));

        if ($newOrder > $maxOrder) {
            $newOrder = $maxOrder;
        }

        $currentOrder = $step->order;

        if ($newOrder === $currentOrder) {
            return;
        }

        $tempOrder = $maxOrder + 1;

        $step->update(['order' => $tempOrder]);

        if ($newOrder < $currentOrder) {
            WorkflowStep::query()
                ->where('workflow_type', $step->workflow_type)
                ->whereBetween('order', [$newOrder, $currentOrder - 1])
                ->orderByDesc('order')
                ->get()
                ->each(fn (WorkflowStep $workflowStep) => $workflowStep->update([
                    'order' => $workflowStep->order + 1,
                ]));
        } else {
            WorkflowStep::query()
                ->where('workflow_type', $step->workflow_type)
                ->whereBetween('order', [$currentOrder + 1, $newOrder])
                ->orderBy('order')
                ->get()
                ->each(fn (WorkflowStep $workflowStep) => $workflowStep->update([
                    'order' => $workflowStep->order - 1,
                ]));
        }

        $step->update(['order' => $newOrder]);
    }

    private function maxOrder(WorkflowType $type): int
    {
        return (int) (WorkflowStep::query()
            ->where('workflow_type', $type->value)
            ->max('order') ?? 0);
    }

    private function reassignInstancesBeforeDelete(WorkflowStep $step, string $type): void
    {
        $instanceIds = WorkflowInstance::query()
            ->where('workflow_type', $type)
            ->where('status', WorkflowInstanceStatus::InProgress)
            ->where('current_step_id', $step->id)
            ->pluck('id');

        if ($instanceIds->isEmpty()) {
            return;
        }

        $nextStep = WorkflowStep::query()
            ->where('workflow_type', $type)
            ->where('order', '>', $step->order)
            ->orderBy('order')
            ->first();

        if ($nextStep) {
            WorkflowInstance::query()
                ->whereIn('id', $instanceIds)
                ->update(['current_step_id' => $nextStep->id]);

            return;
        }

        $firstStep = WorkflowStep::query()
            ->where('workflow_type', $type)
            ->where('id', '!=', $step->id)
            ->orderBy('order')
            ->first();

        if ($firstStep) {
            WorkflowInstance::query()
                ->whereIn('id', $instanceIds)
                ->update(['current_step_id' => $firstStep->id]);

            return;
        }

        WorkflowInstance::query()
            ->whereIn('id', $instanceIds)
            ->update([
                'status' => WorkflowInstanceStatus::Cancelled,
                'current_step_id' => null,
            ]);
    }
}

<?php

namespace App\Modules\Workflow\Domain\Services;

use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkflowStepService
{
    /** @param  array{name: string, order?: int, responsible_role_id?: int|null, responsible_user_id?: int|null}  $data */
    public function create(Workflow $workflow, array $data): WorkflowStep
    {
        $order = $data['order'] ?? (($workflow->steps()->max('order') ?? 0) + 1);

        return WorkflowStep::query()->create([
            'workflow_id' => $workflow->id,
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
            if (array_key_exists('order', $data) && $data['order'] !== $step->order) {
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
            $workflowId = $step->workflow_id;
            $deletedOrder = $step->order;

            $step->delete();

            WorkflowStep::query()
                ->where('workflow_id', $workflowId)
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

        $maxOrder = WorkflowStep::query()
            ->where('workflow_id', $step->workflow_id)
            ->count();

        if ($newOrder > $maxOrder) {
            $newOrder = $maxOrder;
        }

        $currentOrder = $step->order;

        if ($newOrder === $currentOrder) {
            return;
        }

        $tempOrder = WorkflowStep::query()
            ->where('workflow_id', $step->workflow_id)
            ->max('order') + 1;

        $step->update(['order' => $tempOrder]);

        if ($newOrder < $currentOrder) {
            WorkflowStep::query()
                ->where('workflow_id', $step->workflow_id)
                ->whereBetween('order', [$newOrder, $currentOrder - 1])
                ->orderByDesc('order')
                ->get()
                ->each(fn (WorkflowStep $workflowStep) => $workflowStep->update([
                    'order' => $workflowStep->order + 1,
                ]));
        } else {
            WorkflowStep::query()
                ->where('workflow_id', $step->workflow_id)
                ->whereBetween('order', [$currentOrder + 1, $newOrder])
                ->orderBy('order')
                ->get()
                ->each(fn (WorkflowStep $workflowStep) => $workflowStep->update([
                    'order' => $workflowStep->order - 1,
                ]));
        }

        $step->update(['order' => $newOrder]);
    }
}

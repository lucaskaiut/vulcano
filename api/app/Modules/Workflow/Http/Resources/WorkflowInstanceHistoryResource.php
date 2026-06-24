<?php

namespace App\Modules\Workflow\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Workflow\Domain\Models\WorkflowInstanceHistory */
class WorkflowInstanceHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $stepName = $this->step?->name;
        $actionLabel = $this->action->label();

        return [
            'id' => $this->id,
            'action' => $this->action->value,
            'action_label' => $this->action->label(),
            'description' => $stepName
                ? "{$stepName} {$actionLabel}"
                : $actionLabel,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'step' => $this->whenLoaded('step', fn () => $this->step ? [
                'id' => $this->step->id,
                'name' => $this->step->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Modules\Workflow\Http\Resources;

use App\Modules\User\Http\Resources\UserSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Workflow\Domain\Models\WorkflowInstance */
class WorkflowInstanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'workflow' => $this->whenLoaded('workflow', fn () => [
                'id' => $this->workflow->id,
                'name' => $this->workflow->name,
            ]),
            'current_step' => $this->when(
                $this->relationLoaded('currentStep') && $this->currentStep,
                fn () => new WorkflowStepResource($this->currentStep),
            ),
            'initiated_by' => new UserSummaryResource($this->whenLoaded('initiatedBy')),
            'histories' => WorkflowInstanceHistoryResource::collection($this->whenLoaded('histories')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

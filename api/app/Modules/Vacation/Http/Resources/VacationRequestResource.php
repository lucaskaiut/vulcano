<?php

namespace App\Modules\Vacation\Http\Resources;

use App\Modules\User\Http\Resources\UserSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Vacation\Domain\Models\VacationRequest */
class VacationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date->toDateString(),
            'requested_days' => $this->requested_days,
            'justification' => $this->justification,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'user' => new UserSummaryResource($this->whenLoaded('user')),
            'workflow_instance_id' => $this->workflow_instance_id,
            'workflow_instance' => $this->whenLoaded('workflowInstance', fn () => [
                'id' => $this->workflowInstance->id,
                'status' => $this->workflowInstance->status->value,
                'status_label' => $this->workflowInstance->status->label(),
                'current_step' => $this->workflowInstance->relationLoaded('currentStep') && $this->workflowInstance->currentStep
                    ? [
                        'id' => $this->workflowInstance->currentStep->id,
                        'name' => $this->workflowInstance->currentStep->name,
                        'order' => $this->workflowInstance->currentStep->order,
                        'responsible_role' => $this->workflowInstance->currentStep->relationLoaded('responsibleRole') && $this->workflowInstance->currentStep->responsibleRole
                            ? [
                                'id' => $this->workflowInstance->currentStep->responsibleRole->id,
                                'name' => $this->workflowInstance->currentStep->responsibleRole->name,
                            ]
                            : null,
                        'responsible_user' => $this->workflowInstance->currentStep->relationLoaded('responsibleUser') && $this->workflowInstance->currentStep->responsibleUser
                            ? [
                                'id' => $this->workflowInstance->currentStep->responsibleUser->id,
                                'name' => $this->workflowInstance->currentStep->responsibleUser->name,
                            ]
                            : null,
                    ]
                    : null,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

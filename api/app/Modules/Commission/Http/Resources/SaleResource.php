<?php

namespace App\Modules\Commission\Http\Resources;

use App\Modules\User\Http\Resources\UserSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Commission\Domain\Models\Sale */
class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'enterprise_id' => $this->enterprise_id,
            'enterprise' => new EnterpriseResource($this->whenLoaded('enterprise')),
            'unit' => $this->unit,
            'sale_date' => $this->sale_date->toDateString(),
            'sale_amount' => $this->sale_amount,
            'percentage' => $this->percentage,
            'commission_amount' => $this->commission_amount,
            'notes' => $this->notes,
            'invoice_number' => $this->invoice_number,
            'invoice_file_name' => $this->invoice_file_name,
            'user' => new UserSummaryResource($this->whenLoaded('user')),
            'commission' => $this->whenLoaded('commission', fn () => [
                'id' => $this->commission->id,
                'status' => $this->commission->status->value,
                'status_label' => $this->commission->status->label(),
                'paid_at' => $this->commission->paid_at?->toIso8601String(),
                'workflow_instance' => $this->commission->relationLoaded('workflowInstance') && $this->commission->workflowInstance
                    ? [
                        'id' => $this->commission->workflowInstance->id,
                        'status' => $this->commission->workflowInstance->status->value,
                        'status_label' => $this->commission->workflowInstance->status->label(),
                        'current_step' => $this->commission->workflowInstance->relationLoaded('currentStep') && $this->commission->workflowInstance->currentStep
                            ? [
                                'id' => $this->commission->workflowInstance->currentStep->id,
                                'name' => $this->commission->workflowInstance->currentStep->name,
                                'order' => $this->commission->workflowInstance->currentStep->order,
                                'visibility_rules' => $this->commission->workflowInstance->currentStep->visibility_rules ?? [],
                                'approval_rules' => $this->commission->workflowInstance->currentStep->approval_rules ?? [],
                            ]
                            : null,
                    ]
                    : null,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

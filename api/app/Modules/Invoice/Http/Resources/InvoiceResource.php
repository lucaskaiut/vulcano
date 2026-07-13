<?php

namespace App\Modules\Invoice\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Invoice\Domain\Models\Invoice */
class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'competence' => $this->competence,
            'invoice_number' => $this->invoice_number,
            'amount' => $this->amount,
            'issue_date' => $this->issue_date->format('Y-m-d'),
            'status' => $this->status,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'workflow_instance' => $this->whenLoaded('workflowInstance', fn () => [
                'id' => $this->workflowInstance->id,
                'status' => $this->workflowInstance->status,
                'status_label' => $this->workflowInstance->status_label,
                'current_step' => $this->when($this->workflowInstance->relationLoaded('currentStep') && $this->workflowInstance->currentStep, function () {
                    return [
                        'id' => $this->workflowInstance->currentStep->id,
                        'name' => $this->workflowInstance->currentStep->name,
                        'order' => $this->workflowInstance->currentStep->order,
                        'visibility_rules' => $this->workflowInstance->currentStep->visibility_rules ?? [],
                        'approval_rules' => $this->workflowInstance->currentStep->approval_rules ?? [],
                    ];
                }),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

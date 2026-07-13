<?php

namespace App\Modules\Workflow\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Workflow\Domain\Models\WorkflowStep */
class WorkflowStepResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflow_type' => $this->workflow_type,
            'name' => $this->name,
            'order' => $this->order,
            'visibility_rules' => $this->visibility_rules ?? [],
            'approval_rules' => $this->approval_rules ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

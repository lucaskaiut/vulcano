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
            'workflow_id' => $this->workflow_id,
            'name' => $this->name,
            'order' => $this->order,
            'responsible_role_id' => $this->responsible_role_id,
            'responsible_user_id' => $this->responsible_user_id,
            'responsible_role' => $this->whenLoaded('responsibleRole', fn () => $this->responsibleRole ? [
                'id' => $this->responsibleRole->id,
                'name' => $this->responsibleRole->name,
            ] : null),
            'responsible_user' => $this->whenLoaded('responsibleUser', fn () => $this->responsibleUser ? [
                'id' => $this->responsibleUser->id,
                'name' => $this->responsibleUser->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

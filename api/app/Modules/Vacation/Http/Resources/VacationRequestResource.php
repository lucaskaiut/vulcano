<?php

namespace App\Modules\Vacation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Vacation\Domain\Models\VacationRequest */
class VacationRequestResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'job_title' => $this->user->job_title,
            ]),
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date->toDateString(),
            'requested_days' => $this->requested_days,
            'justification' => $this->justification,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'workflow_instance_id' => $this->workflow_instance_id,
            'workflow_instance' => $this->whenLoaded('workflowInstance'),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}

<?php

namespace App\Modules\User\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\User\Domain\Models\SalaryHistory */
class SalaryHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'previous_salary' => $this->previous_salary,
            'new_salary' => $this->new_salary,
            'effective_date' => $this->effective_date?->toDateString(),
            'notes' => $this->notes,
            'changed_by' => new UserSummaryResource($this->whenLoaded('changedBy')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

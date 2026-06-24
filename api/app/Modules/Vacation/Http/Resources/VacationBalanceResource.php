<?php

namespace App\Modules\Vacation\Http\Resources;

use App\Modules\User\Http\Resources\UserSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Vacation\Domain\Models\VacationBalance */
class VacationBalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserSummaryResource($this->whenLoaded('user')),
            'available_days' => $this->available_days,
            'accrued_days' => $this->accrued_days,
            'used_days' => $this->used_days,
            'additional_days' => $this->additional_days,
            'grants' => VacationGrantResource::collection($this->whenLoaded('grants')),
            'periods' => VacationPeriodResource::collection($this->whenLoaded('periods')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Modules\Cost\Http\Resources;

use App\Modules\User\Http\Resources\UserSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Cost\Domain\Models\CollaboratorCost */
class CollaboratorCostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserSummaryResource($this->whenLoaded('user')),
            'amount' => $this->amount,
            'recurring' => $this->recurring,
            'reference_month' => $this->reference_month,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'type' => $this->category->type,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

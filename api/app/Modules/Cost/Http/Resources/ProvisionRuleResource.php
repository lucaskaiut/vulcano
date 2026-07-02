<?php

namespace App\Modules\Cost\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Cost\Domain\Models\ProvisionRule */
class ProvisionRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'percentage' => $this->percentage,
            'active' => $this->active,
        ];
    }
}

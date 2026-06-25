<?php

namespace App\Modules\User\Http\Resources;

use App\Modules\User\Domain\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Role */
class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'permission_slugs' => $this->permissions ?? [],
        ];
    }
}

<?php

namespace App\Modules\User\Http\Resources;

use App\Modules\User\Domain\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'job_title' => $this->job_title,
            'hired_at' => $this->hired_at?->toDateString(),
            'manager_id' => $this->manager_id,
            'manager' => new UserSummaryResource($this->whenLoaded('manager')),
            'salary' => $this->salary,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permissions' => PermissionResource::collection(
                $this->when(
                    $this->relationLoaded('roles'),
                    fn () => $this->resource->getAllPermissions(),
                ),
            ),
            'preferences' => $this->when(
                $this->relationLoaded('preference'),
                fn () => $this->resource->getPreferences(),
            ),
        ];
    }
}

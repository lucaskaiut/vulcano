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
            'sector_id' => $this->sector_id,
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'salary' => $this->salary,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'company_name' => $this->company_name,
            'cnpj' => $this->cnpj,
            'cpf' => $this->cpf,
            'rg' => $this->rg,
            'birth_date' => $this->birth_date?->toDateString(),
            'phone' => $this->phone,
            'zip_code' => $this->zip_code,
            'street' => $this->street,
            'number' => $this->number,
            'neighborhood' => $this->neighborhood,
            'city' => $this->city,
            'state' => $this->state,
            'contract_type' => $this->contract_type,
            'contracting_company' => $this->contracting_company,
            'emergency_contacts' => $this->emergency_contacts,
            'bank_details' => $this->bank_details,
            'observations' => $this->observations,
            'benefits' => BenefitResource::collection($this->whenLoaded('benefits')),
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permission_slugs' => $this->when(
                $this->relationLoaded('roles'),
                fn () => $this->resource->getAllPermissionSlugs()->values()->all(),
            ),
            'preferences' => $this->when(
                $this->relationLoaded('preference'),
                fn () => $this->resource->getPreferences(),
            ),
        ];
    }
}

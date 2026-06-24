<?php

namespace App\Modules\User\Http\Requests;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role');

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($roleId)],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'permission_ids' => ['sometimes', 'array'],
            'permission_ids.*' => [
                'integer',
                Rule::exists('permissions', 'id')->where(
                    fn ($query) => $query->whereIn('slug', PermissionEnum::values()),
                ),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Já existe um perfil com este nome.',
        ];
    }
}

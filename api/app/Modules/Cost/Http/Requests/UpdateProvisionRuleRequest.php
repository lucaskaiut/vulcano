<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProvisionRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('provision_rule')->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('provision_rules')->ignore($id)],
            'percentage' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}

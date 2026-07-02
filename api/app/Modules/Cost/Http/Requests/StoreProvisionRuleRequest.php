<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProvisionRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('provision_rules')],
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da provisão.',
            'name.unique' => 'Já existe uma provisão com este nome.',
            'percentage.required' => 'Informe o percentual.',
            'percentage.max' => 'O percentual não pode ser maior que 100.',
        ];
    }
}

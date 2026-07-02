<?php

namespace App\Modules\Commission\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnterpriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('enterprises')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do empreendimento.',
            'name.unique' => 'Já existe um empreendimento com este nome.',
        ];
    }
}

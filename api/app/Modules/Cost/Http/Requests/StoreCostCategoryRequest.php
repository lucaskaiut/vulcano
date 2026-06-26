<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCostCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('cost_categories')],
            'type' => ['required', 'string', 'max:50'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da categoria.',
            'name.unique' => 'Já existe uma categoria com este nome.',
            'type.required' => 'Informe o tipo da categoria.',
        ];
    }
}

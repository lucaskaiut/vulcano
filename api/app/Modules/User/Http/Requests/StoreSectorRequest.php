<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('sectors')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do setor.',
            'name.unique' => 'Já existe um setor com este nome.',
        ];
    }
}

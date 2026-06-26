<?php

namespace App\Modules\Document\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:document_types,name'],
            'expiration_required' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do tipo de documento.',
            'name.unique' => 'Já existe um tipo de documento com este nome.',
        ];
    }
}

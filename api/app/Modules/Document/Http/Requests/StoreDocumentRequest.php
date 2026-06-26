<?php

namespace App\Modules\Document\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type_id' => ['required', 'integer', 'exists:document_types,id'],
            'file' => ['required', 'file', 'max:10240'],
            'expiration_date' => ['sometimes', 'nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_type_id.required' => 'Selecione o tipo de documento.',
            'file.required' => 'Selecione o arquivo.',
            'file.max' => 'O arquivo deve ter no máximo 10 MB.',
        ];
    }
}

<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaryHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_salary' => ['sometimes', 'numeric', 'min:0'],
            'effective_date' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'new_salary.numeric' => 'Informe um salário válido.',
            'new_salary.min' => 'O salário deve ser maior ou igual a zero.',
            'effective_date.date' => 'Informe uma data de vigência válida.',
            'notes.max' => 'A observação deve ter no máximo 1000 caracteres.',
        ];
    }
}

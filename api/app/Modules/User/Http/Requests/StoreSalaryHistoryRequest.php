<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalaryHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_salary' => ['required', 'numeric', 'min:0'],
            'effective_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'new_salary.required' => 'Informe o novo salário.',
            'new_salary.numeric' => 'Informe um salário válido.',
            'new_salary.min' => 'O salário deve ser maior ou igual a zero.',
            'effective_date.required' => 'Informe a data de vigência.',
            'effective_date.date' => 'Informe uma data de vigência válida.',
            'notes.max' => 'A observação deve ter no máximo 1000 caracteres.',
        ];
    }
}

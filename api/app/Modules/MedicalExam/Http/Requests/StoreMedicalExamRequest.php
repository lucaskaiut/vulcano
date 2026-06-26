<?php

namespace App\Modules\MedicalExam\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_type' => ['required', 'string', 'max:255'],
            'execution_date' => ['required', 'date'],
            'expiration_date' => ['required', 'date', 'after_or_equal:execution_date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'exam_type.required' => 'Informe o tipo de exame.',
            'execution_date.required' => 'Informe a data de realização.',
            'expiration_date.required' => 'Informe a data de vencimento.',
            'expiration_date.after_or_equal' => 'O vencimento deve ser igual ou posterior à data de realização.',
        ];
    }
}

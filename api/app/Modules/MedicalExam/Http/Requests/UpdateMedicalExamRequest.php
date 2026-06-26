<?php

namespace App\Modules\MedicalExam\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_type' => ['sometimes', 'string', 'max:255'],
            'execution_date' => ['sometimes', 'date'],
            'expiration_date' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}

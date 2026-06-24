<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseVacationPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'end_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.required' => 'Informe a data de encerramento do período.',
        ];
    }
}

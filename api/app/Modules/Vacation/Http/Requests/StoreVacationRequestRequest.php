<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVacationRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'justification' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'Informe a data de início.',
            'start_date.after_or_equal' => 'A data de início deve ser hoje ou uma data futura.',
            'end_date.required' => 'Informe a data de término.',
            'end_date.after' => 'A data de término deve ser posterior à data de início.',
        ];
    }
}

<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVacationGrantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'days_used' => ['sometimes', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.date' => 'Informe uma data de início válida.',
            'end_date.date' => 'Informe uma data de término válida.',
            'days_used.integer' => 'A quantidade de dias deve ser um número inteiro.',
            'days_used.min' => 'A concessão deve ter pelo menos 1 dia.',
        ];
    }
}

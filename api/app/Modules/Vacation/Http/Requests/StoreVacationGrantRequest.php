<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVacationGrantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'days_used' => ['required', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Informe o colaborador.',
            'start_date.required' => 'Informe a data de início das férias.',
            'end_date.required' => 'Informe a data de término das férias.',
            'days_used.required' => 'Informe a quantidade de dias utilizados.',
            'days_used.min' => 'A concessão deve ter pelo menos 1 dia.',
        ];
    }
}

<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVacationPeriodRequest extends FormRequest
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
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Informe o colaborador.',
            'start_date.required' => 'Informe a data de início do período.',
        ];
    }
}

<?php

namespace App\Modules\Vacation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVacationBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'additional_days' => ['sometimes', 'integer', 'min:0'],
            'additional_days_entries' => ['sometimes', 'array'],
            'additional_days_entries.*.description' => ['required', 'string', 'max:255'],
            'additional_days_entries.*.days' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'additional_days_entries.*.description.required' => 'Informe a descrição.',
            'additional_days_entries.*.days.required' => 'Informe a quantidade de dias.',
            'additional_days_entries.*.days.min' => 'A quantidade de dias deve ser pelo menos 1.',
        ];
    }
}

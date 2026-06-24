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
            'additional_days' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'additional_days.required' => 'Informe os dias adicionais.',
        ];
    }
}

<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'cost_category_id' => ['required', 'integer', 'exists:cost_categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'recurring' => ['sometimes', 'boolean'],
            'reference_month' => ['sometimes', 'nullable', 'string', 'regex:/^\d{4}-\d{2}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Selecione o colaborador.',
            'cost_category_id.required' => 'Selecione a categoria.',
            'amount.required' => 'Informe o valor.',
        ];
    }
}

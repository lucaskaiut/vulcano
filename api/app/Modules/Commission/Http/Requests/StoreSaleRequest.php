<?php

namespace App\Modules\Commission\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'development_name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:255'],
            'sale_date' => ['required', 'date'],
            'sale_amount' => ['required', 'numeric', 'min:0.01'],
            'percentage' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'development_name.required' => 'Informe o nome do empreendimento.',
            'unit.required' => 'Informe a unidade.',
            'sale_date.required' => 'Informe a data da venda.',
            'sale_amount.required' => 'Informe o valor da venda.',
            'percentage.required' => 'Informe o percentual de comissão.',
            'percentage.max' => 'O percentual não pode ser maior que 100.',
        ];
    }
}

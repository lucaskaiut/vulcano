<?php

namespace App\Modules\Commission\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enterprise_id' => ['required', 'integer', Rule::exists('enterprises', 'id')],
            'unit' => ['required', 'string', 'max:255'],
            'sale_date' => ['required', 'date'],
            'sale_amount' => ['required', 'numeric', 'min:0.01'],
            'percentage' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
            'invoice_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'invoice_file' => ['sometimes', 'nullable', 'file', 'max:10240', 'mimes:pdf,png,jpg,jpeg'],
        ];
    }

    public function messages(): array
    {
        return [
            'enterprise_id.required' => 'Selecione o empreendimento.',
            'enterprise_id.exists' => 'O empreendimento selecionado não foi encontrado.',
            'unit.required' => 'Informe a unidade.',
            'sale_date.required' => 'Informe a data da venda.',
            'sale_amount.required' => 'Informe o valor da venda.',
            'percentage.required' => 'Informe o percentual de comissão.',
            'percentage.max' => 'O percentual não pode ser maior que 100.',
        ];
    }
}

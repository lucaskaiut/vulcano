<?php

namespace App\Modules\Invoice\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'competence' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'invoice_number' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'issue_date' => ['required', 'date'],
            'file' => ['required', 'file', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'competence.required' => 'Informe a competência.',
            'invoice_number.required' => 'Informe o número da nota.',
            'amount.required' => 'Informe o valor.',
            'issue_date.required' => 'Informe a data de emissão.',
            'file.required' => 'Selecione o arquivo.',
            'file.max' => 'O arquivo deve ter no máximo 10 MB.',
        ];
    }
}

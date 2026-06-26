<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'recurring' => ['sometimes', 'boolean'],
        ];
    }
}

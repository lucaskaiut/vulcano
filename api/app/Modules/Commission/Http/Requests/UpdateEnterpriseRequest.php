<?php

namespace App\Modules\Commission\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnterpriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('enterprise')->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('enterprises')->ignore($id)],
        ];
    }
}

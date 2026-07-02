<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('sector')->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('sectors')->ignore($id)],
        ];
    }
}

<?php

namespace App\Modules\Cost\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCostCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('cost_category')->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('cost_categories')->ignore($id)],
            'type' => ['sometimes', 'string', 'max:50'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}

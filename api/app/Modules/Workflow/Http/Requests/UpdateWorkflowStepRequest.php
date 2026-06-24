<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkflowStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'order' => ['sometimes', 'integer', 'min:1'],
            'responsible_role_id' => ['sometimes', 'nullable', 'integer', 'exists:roles,id'],
            'responsible_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [];
    }
}

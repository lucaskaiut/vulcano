<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkflowStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $workflowType = $this->route('type');

        return [
            'name' => ['required', 'string', 'max:255'],
            'order' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('workflow_steps', 'order')->where('workflow_type', $workflowType),
            ],
            'responsible_role_id' => ['sometimes', 'nullable', 'integer', 'exists:roles,id'],
            'responsible_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da etapa.',
            'order.unique' => 'Já existe uma etapa com esta ordem neste fluxo.',
        ];
    }
}

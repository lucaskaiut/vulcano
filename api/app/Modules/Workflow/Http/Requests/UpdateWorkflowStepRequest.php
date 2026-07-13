<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkflowStepRequest extends FormRequest
{
    use ValidatesWorkflowRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'order' => ['sometimes', 'integer', 'min:1'],
            'visibility_rules' => ['sometimes', 'nullable', 'array'],
            'approval_rules' => ['sometimes', 'nullable', 'array'],
            'visibility_rules.*.type' => ['sometimes', 'string'],
            'visibility_rules.*.id' => ['sometimes', 'nullable', 'integer'],
            'approval_rules.*.type' => ['sometimes', 'string'],
            'approval_rules.*.id' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validateWorkflowRules($validator);
    }

    public function messages(): array
    {
        return [
            'approval_rules.*.id.required' => 'Selecione um perfil ou usuário para esta regra.',
            'visibility_rules.*.id.required' => 'Selecione um perfil ou usuário para esta regra.',
        ];
    }
}

<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkflowStepRequest extends FormRequest
{
    use ValidatesWorkflowRules;

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
            'name.required' => 'Informe o nome da etapa.',
            'order.unique' => 'Já existe uma etapa com esta ordem neste fluxo.',
        ];
    }
}

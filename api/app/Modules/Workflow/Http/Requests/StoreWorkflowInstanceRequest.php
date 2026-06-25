<?php

namespace App\Modules\Workflow\Http\Requests;

use App\Modules\Workflow\Domain\Enums\WorkflowType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkflowInstanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workflow_type' => ['required', 'string', Rule::in(WorkflowType::values())],
            'title' => ['required', 'string', 'max:255'],
            'subject_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'subject_id' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'workflow_type.required' => 'Informe o tipo de fluxo.',
            'workflow_type.in' => 'Tipo de fluxo inválido.',
            'title.required' => 'Informe o título da solicitação.',
        ];
    }
}

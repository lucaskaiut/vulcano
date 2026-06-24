<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $workflowId = $this->route('workflow')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('workflows', 'name')->ignore($workflowId)],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Já existe um fluxo com este nome.',
        ];
    }
}

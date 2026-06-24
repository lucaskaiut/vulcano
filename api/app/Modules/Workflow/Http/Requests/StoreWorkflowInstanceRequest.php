<?php

namespace App\Modules\Workflow\Http\Requests;

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
            'workflow_id' => ['required', 'integer', Rule::exists('workflows', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'subject_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'subject_id' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'workflow_id.required' => 'Informe o fluxo do processo.',
            'title.required' => 'Informe o título da solicitação.',
        ];
    }
}

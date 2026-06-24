<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkflowActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}

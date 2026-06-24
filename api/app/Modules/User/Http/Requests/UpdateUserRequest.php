<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends UserRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            ...$this->collaboratorRules(requireAll: false, includeSalary: false),
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role_ids' => ['sometimes', 'array'],
            'role_ids.*' => ['integer', Rule::exists('roles', 'id')],
        ];
    }

    public function withValidator($validator): void
    {
        $this->withCollaboratorValidation($validator);
    }

    public function messages(): array
    {
        return [
            'job_title.required' => 'Informe o cargo.',
            'hired_at.required' => 'Informe a data de contratação.',
            'hired_at.date' => 'Informe uma data de contratação válida.',
            'salary.required' => 'Informe a remuneração.',
            'salary.numeric' => 'Informe uma remuneração válida.',
            'salary.min' => 'A remuneração deve ser maior ou igual a zero.',
            'manager_id.exists' => 'Selecione um gestor válido.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está em uso.',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
        ];
    }
}

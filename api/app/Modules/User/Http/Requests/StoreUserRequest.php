<?php

namespace App\Modules\User\Http\Requests;

use Illuminate\Validation\Rule;

class StoreUserRequest extends UserRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            ...$this->collaboratorRules(requireAll: true),
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
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
            'name.required' => 'Informe o nome.',
            'job_title.required' => 'Informe o cargo.',
            'hired_at.required' => 'Informe a data de contratação.',
            'hired_at.date' => 'Informe uma data de contratação válida.',
            'salary.required' => 'Informe a remuneração.',
            'salary.numeric' => 'Informe uma remuneração válida.',
            'salary.min' => 'A remuneração deve ser maior ou igual a zero.',
            'manager_id.exists' => 'Selecione um gestor válido.',
            'email.required' => 'Informe o e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está em uso.',
            'password.required' => 'Informe a senha.',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
        ];
    }
}

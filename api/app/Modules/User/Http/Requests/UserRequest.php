<?php

namespace App\Modules\User\Http\Requests;

use App\Modules\User\Domain\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class UserRequest extends FormRequest
{
    /** @return array<string, mixed> */
    protected function collaboratorRules(bool $requireAll = false, bool $includeSalary = true): array
    {
        $required = $requireAll ? 'required' : 'sometimes';

        $rules = [
            'job_title' => [$required, 'string', 'max:255'],
            'hired_at' => [$required, 'date'],
            'manager_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'sector_id' => ['nullable', 'integer', Rule::exists('sectors', 'id')],
        ];

        if ($includeSalary) {
            $rules['salary'] = [$required, 'numeric', 'min:0'];
        }

        return $rules;
    }

    protected function withCollaboratorValidation(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $managerId = $this->input('manager_id');
            $routeUser = $this->route('user');
            $userId = $routeUser instanceof User ? $routeUser->id : $routeUser;

            if ($managerId !== null && $userId !== null && (int) $managerId === (int) $userId) {
                $validator->errors()->add('manager_id', 'O colaborador não pode ser gestor de si mesmo.');
            }
        });
    }
}

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
            'company_name' => ['nullable', 'string', 'max:255'],
            'cnpj' => ['nullable', 'string', 'max:18'],
            'cpf' => ['nullable', 'string', 'max:14'],
            'rg' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:20'],
            'zip_code' => ['nullable', 'string', 'max:9'],
            'street' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'string', 'max:20'],
            'neighborhood' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:2'],
            'contract_type' => ['nullable', 'string', 'in:clt,pj,hybrid,other'],
            'contracting_company' => ['nullable', 'string', 'max:255'],
            'invoice_due_day' => ['nullable', 'integer', 'min:1', 'max:28'],
            'emergency_contacts' => ['nullable', 'string'],
            'bank_details' => ['nullable', 'string'],
            'observations' => ['nullable', 'string'],
        ];

        if ($includeSalary) {
            $rules['salary'] = [$required, 'numeric', 'min:0'];
        }

        return $rules;
    }

    protected function collaboratorMessages(): array
    {
        return [
            'contract_type.in' => 'A modalidade de contrato deve ser CLT, PJ, Híbrido ou Outros.',
        ];
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

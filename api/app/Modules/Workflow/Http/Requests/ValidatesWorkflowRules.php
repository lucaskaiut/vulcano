<?php

namespace App\Modules\Workflow\Http\Requests;

use Illuminate\Validation\Validator;

trait ValidatesWorkflowRules
{
    protected function validateWorkflowRules(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateRuleList(
                $validator,
                'visibility_rules',
                ['requester', 'manager', 'role', 'user'],
            );

            $this->validateRuleList(
                $validator,
                'approval_rules',
                ['manager', 'role', 'user'],
            );
        });
    }

    /**
     * @param  list<string>  $allowedTypes
     */
    private function validateRuleList(Validator $validator, string $field, array $allowedTypes): void
    {
        if (! $this->exists($field) || $this->input($field) === null) {
            return;
        }

        $rules = $this->input($field);

        if (! is_array($rules)) {
            $validator->errors()->add($field, 'As regras devem ser um array.');

            return;
        }

        foreach ($rules as $index => $rule) {
            if (! is_array($rule)) {
                $validator->errors()->add("{$field}.{$index}", 'Regra inválida.');

                continue;
            }

            $type = $rule['type'] ?? null;

            if (! is_string($type) || ! in_array($type, $allowedTypes, true)) {
                $validator->errors()->add(
                    "{$field}.{$index}.type",
                    'Tipo de regra inválido.',
                );

                continue;
            }

            if (in_array($type, ['role', 'user'], true)) {
                $id = $rule['id'] ?? null;

                if (! is_int($id) && ! (is_string($id) && ctype_digit($id))) {
                    $validator->errors()->add(
                        "{$field}.{$index}.id",
                        $type === 'role'
                            ? 'Selecione um perfil para esta regra.'
                            : 'Selecione um usuário para esta regra.',
                    );
                }
            }
        }
    }
}

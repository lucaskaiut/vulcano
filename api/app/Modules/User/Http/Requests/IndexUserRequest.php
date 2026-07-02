<?php

namespace App\Modules\User\Http\Requests;

use App\Modules\User\Domain\Support\FilterQuery;
use App\Modules\User\Domain\Support\UserFilterRegistry;
use Illuminate\Foundation\Http\FormRequest;

class IndexUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return FilterQuery::rulesFor(UserFilterRegistry::definitions());
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            FilterQuery::validateRanges($validator, UserFilterRegistry::rangePairs(), $this->all());
        });
    }

    public function messages(): array
    {
        return [
            'hired_from.date' => 'Informe uma data de contratação inicial válida.',
            'hired_to.date' => 'Informe uma data de contratação final válida.',
            'created_from.date' => 'Informe uma data de criação inicial válida.',
            'created_to.date' => 'Informe uma data de criação final válida.',
            'salary_min.numeric' => 'Informe um valor mínimo de remuneração válido.',
            'salary_max.numeric' => 'Informe um valor máximo de remuneração válido.',
            'salary_min.min' => 'A remuneração mínima deve ser maior ou igual a zero.',
            'salary_max.min' => 'A remuneração máxima deve ser maior ou igual a zero.',
            'sector_id.integer' => 'Informe um setor válido.',
            'sector_id.exists' => 'O setor informado não foi encontrado.',
        ];
    }
}

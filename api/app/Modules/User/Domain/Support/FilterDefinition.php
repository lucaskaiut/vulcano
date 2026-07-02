<?php

namespace App\Modules\User\Domain\Support;

class FilterDefinition
{
    /**
     * @param  string|list<string>  $columns
     * @param  list<string|mixed>  $rules
     */
    public function __construct(
        public readonly string $param,
        public readonly FilterType $type,
        public readonly string|array $columns,
        public readonly array $rules = [],
    ) {}

    /** @return array<string, list<string|mixed>> */
    public function validationRules(): array
    {
        if ($this->rules !== []) {
            return [$this->param => $this->rules];
        }

        return match ($this->type) {
            FilterType::Like, FilterType::Search => [$this->param => ['nullable', 'string', 'max:255']],
            FilterType::DateGreaterThanOrEqual, FilterType::DateLessThanOrEqual => [$this->param => ['nullable', 'date']],
            FilterType::NumericGreaterThanOrEqual, FilterType::NumericLessThanOrEqual => [$this->param => ['nullable', 'numeric', 'min:0']],
            FilterType::NotEqual => [$this->param => ['nullable', 'integer']],
            FilterType::Equals => [$this->param => ['nullable', 'integer']],
        };
    }
}

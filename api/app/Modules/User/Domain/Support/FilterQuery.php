<?php

namespace App\Modules\User\Domain\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class FilterQuery
{
    /**
     * @param  list<FilterDefinition>  $definitions
     * @param  array<string, mixed>  $values
     */
    public function __construct(
        private readonly array $definitions,
        private readonly array $values,
    ) {}

    /**
     * @param  list<FilterDefinition>  $definitions
     * @return array<string, list<string|mixed>>
     */
    public static function rulesFor(array $definitions): array
    {
        $rules = [];

        foreach ($definitions as $definition) {
            $rules = array_merge($rules, $definition->validationRules());
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $values
     * @param  list<FilterDefinition>  $definitions
     */
    public static function fromValues(array $values, array $definitions): self
    {
        $activeValues = [];

        foreach ($definitions as $definition) {
            if (! array_key_exists($definition->param, $values)) {
                continue;
            }

            $value = $values[$definition->param];

            if ($value === null || $value === '') {
                continue;
            }

            $activeValues[$definition->param] = $value;
        }

        return new self($definitions, $activeValues);
    }

    /** @param  Builder<\Illuminate\Database\Eloquent\Model>  $query */
    public function apply(Builder $query): void
    {
        foreach ($this->definitions as $definition) {
            if (! array_key_exists($definition->param, $this->values)) {
                continue;
            }

            $value = $this->values[$definition->param];
            $columns = (array) $definition->columns;

            match ($definition->type) {
                FilterType::Like => $query->where(
                    $columns[0],
                    'like',
                    '%'.$this->escapeLike((string) $value).'%',
                ),
                FilterType::Search => $query->where(function (Builder $searchQuery) use ($columns, $value): void {
                    foreach ($columns as $column) {
                        $searchQuery->orWhere(
                            $column,
                            'like',
                            '%'.$this->escapeLike((string) $value).'%',
                        );
                    }
                }),
                FilterType::DateGreaterThanOrEqual => $query->whereDate($columns[0], '>=', $value),
                FilterType::DateLessThanOrEqual => $query->whereDate($columns[0], '<=', $value),
                FilterType::NumericGreaterThanOrEqual => $query->where($columns[0], '>=', $value),
                FilterType::NumericLessThanOrEqual => $query->where($columns[0], '<=', $value),
                FilterType::NotEqual => $query->where($columns[0], '!=', $value),
                FilterType::Equals => $query->where($columns[0], '=', $value),
            };
        }
    }

    /** @return array<string, mixed> */
    public function toMeta(): array
    {
        return $this->values;
    }

    /**
     * @param  list<array{from: string, to: string, type: 'date'|'numeric'}>  $ranges
     * @param  array<string, mixed>  $input
     */
    public static function validateRanges(Validator $validator, array $ranges, array $input): void
    {
        foreach ($ranges as $range) {
            $from = $input[$range['from']] ?? null;
            $to = $input[$range['to']] ?? null;

            if ($from === null || $from === '' || $to === null || $to === '') {
                continue;
            }

            $isInvalid = match ($range['type']) {
                'date' => (string) $from > (string) $to,
                'numeric' => (float) $from > (float) $to,
            };

            if (! $isInvalid) {
                continue;
            }

            $validator->errors()->add(
                $range['from'],
                'O valor inicial não pode ser maior que o final.',
            );
            $validator->errors()->add(
                $range['to'],
                'O valor final não pode ser menor que o inicial.',
            );
        }
    }

    private function escapeLike(string $value): string
    {
        return Str::of($value)
            ->replace('\\', '\\\\')
            ->replace('%', '\\%')
            ->replace('_', '\\_')
            ->toString();
    }
}

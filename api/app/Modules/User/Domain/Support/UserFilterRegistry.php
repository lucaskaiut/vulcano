<?php

namespace App\Modules\User\Domain\Support;

class UserFilterRegistry
{
    /** @return list<FilterDefinition> */
    public static function definitions(): array
    {
        return [
            new FilterDefinition(
                param: 'search',
                type: FilterType::Search,
                columns: ['name', 'job_title', 'email'],
            ),
            new FilterDefinition(
                param: 'email',
                type: FilterType::Like,
                columns: 'email',
            ),
            new FilterDefinition(
                param: 'hired_from',
                type: FilterType::DateGreaterThanOrEqual,
                columns: 'hired_at',
            ),
            new FilterDefinition(
                param: 'hired_to',
                type: FilterType::DateLessThanOrEqual,
                columns: 'hired_at',
            ),
            new FilterDefinition(
                param: 'created_from',
                type: FilterType::DateGreaterThanOrEqual,
                columns: 'created_at',
            ),
            new FilterDefinition(
                param: 'created_to',
                type: FilterType::DateLessThanOrEqual,
                columns: 'created_at',
            ),
            new FilterDefinition(
                param: 'salary_min',
                type: FilterType::NumericGreaterThanOrEqual,
                columns: 'salary',
            ),
            new FilterDefinition(
                param: 'salary_max',
                type: FilterType::NumericLessThanOrEqual,
                columns: 'salary',
            ),
            new FilterDefinition(
                param: 'exclude_id',
                type: FilterType::NotEqual,
                columns: 'id',
                rules: ['nullable', 'integer', 'exists:users,id'],
            ),
        ];
    }

    /** @return list<array{from: string, to: string, type: 'date'|'numeric'}> */
    public static function rangePairs(): array
    {
        return [
            ['from' => 'hired_from', 'to' => 'hired_to', 'type' => 'date'],
            ['from' => 'created_from', 'to' => 'created_to', 'type' => 'date'],
            ['from' => 'salary_min', 'to' => 'salary_max', 'type' => 'numeric'],
        ];
    }
}

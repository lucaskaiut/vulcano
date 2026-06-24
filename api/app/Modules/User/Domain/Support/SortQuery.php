<?php

namespace App\Modules\User\Domain\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SortQuery
{
    /**
     * @param  list<array{column: string, direction: string}>  $sorts
     * @param  list<string>  $allowedColumns
     */
    public function __construct(
        public readonly array $sorts,
        public readonly array $allowedColumns,
    ) {}

    /** @param  list<string>  $allowedColumns */
    public static function fromRequest(
        Request $request,
        array $allowedColumns,
        string $defaultColumn = 'name',
        string $defaultDirection = 'asc',
    ): self {
        $sorts = self::parseSortParameter(
            $request->query('sort'),
            $allowedColumns,
        );

        if ($sorts === [] && $request->has('direction') && ! str_contains((string) $request->query('sort'), ':')) {
            $sorts = self::parseLegacySort(
                (string) $request->query('sort', $defaultColumn),
                (string) $request->query('direction', $defaultDirection),
                $allowedColumns,
            );
        }

        if ($sorts === []) {
            $sorts = [[
                'column' => in_array($defaultColumn, $allowedColumns, true) ? $defaultColumn : $allowedColumns[0],
                'direction' => in_array($defaultDirection, ['asc', 'desc'], true) ? $defaultDirection : 'asc',
            ]];
        }

        return new self($sorts, $allowedColumns);
    }

    /**
     * @param  list<string>  $allowedColumns
     * @return list<array{column: string, direction: string}>
     */
    public static function parseSortParameter(?string $sortParameter, array $allowedColumns): array
    {
        if ($sortParameter === null || trim($sortParameter) === '') {
            return [];
        }

        $sorts = [];

        foreach (explode(',', $sortParameter) as $segment) {
            $segment = trim($segment);

            if ($segment === '') {
                continue;
            }

            if (! str_contains($segment, ':')) {
                continue;
            }

            [$column, $direction] = explode(':', $segment, 2);
            $column = trim($column);
            $direction = strtolower(trim($direction));

            if (! in_array($column, $allowedColumns, true)) {
                continue;
            }

            if (! in_array($direction, ['asc', 'desc'], true)) {
                continue;
            }

            $sorts[] = [
                'column' => $column,
                'direction' => $direction,
            ];
        }

        return $sorts;
    }

    /**
     * @param  list<string>  $allowedColumns
     * @return list<array{column: string, direction: string}>
     */
    private static function parseLegacySort(string $column, string $direction, array $allowedColumns): array
    {
        $direction = strtolower($direction);

        if (! in_array($column, $allowedColumns, true)) {
            return [];
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            return [];
        }

        return [[
            'column' => $column,
            'direction' => $direction,
        ]];
    }

    /** @param  Builder<\Illuminate\Database\Eloquent\Model>  $query */
    public function apply(Builder $query): void
    {
        foreach ($this->sorts as $sort) {
            $query->orderBy($sort['column'], $sort['direction']);
        }
    }

    /** @return array{sort: string, sorts: list<array{column: string, direction: string}>} */
    public function toMeta(): array
    {
        return [
            'sort' => collect($this->sorts)
                ->map(fn (array $sort) => "{$sort['column']}:{$sort['direction']}")
                ->implode(','),
            'sorts' => $this->sorts,
        ];
    }
}

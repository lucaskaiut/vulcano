<?php

namespace App\Modules\User\Http\Support;

use App\Modules\User\Domain\Support\FilterQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaginationMeta
{
    /** @param  LengthAwarePaginator<mixed>  $paginator */
    public static function build(
        LengthAwarePaginator $paginator,
        SortQuery $sort,
        ?FilterQuery $filters = null,
    ): array {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            ...$sort->toMeta(),
            'filters' => $filters?->toMeta() ?? [],
        ];
    }
}

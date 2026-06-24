<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\Permission;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PermissionService
{
    /** @var list<string> */
    public const SORTABLE_COLUMNS = ['name', 'slug', 'created_at'];

    /** @return LengthAwarePaginator<int, Permission> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = Permission::query()->system();
        $sort->apply($query);

        return $query->paginate(
            $pagination->perPage,
            ['*'],
            'page',
            $pagination->page,
        );
    }
}

<?php

namespace App\Modules\Commission\Domain\Services;

use App\Modules\Commission\Domain\Models\Enterprise;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EnterpriseService
{
    public const SORTABLE_COLUMNS = ['name', 'created_at'];

    /** @return LengthAwarePaginator<int, Enterprise> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = Enterprise::query();
        $sort->apply($query);

        return $query->paginate($pagination->perPage, ['*'], 'page', $pagination->page);
    }

    public function find(int $id): Enterprise
    {
        return Enterprise::query()->findOrFail($id);
    }

    public function list(): Collection
    {
        return Enterprise::query()->orderBy('name')->get();
    }

    /** @param  array{name: string}  $data */
    public function create(array $data): Enterprise
    {
        return Enterprise::query()->create([
            'name' => $data['name'],
        ]);
    }

    /** @param  array{name?: string}  $data */
    public function update(Enterprise $enterprise, array $data): Enterprise
    {
        $enterprise->update(array_intersect_key($data, array_flip(['name'])));

        return $enterprise->fresh();
    }
}

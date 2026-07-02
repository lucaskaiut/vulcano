<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\Sector;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SectorService
{
    public const SORTABLE_COLUMNS = ['name', 'created_at'];

    /** @return LengthAwarePaginator<int, Sector> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = Sector::query();
        $sort->apply($query);

        return $query->paginate($pagination->perPage, ['*'], 'page', $pagination->page);
    }

    public function find(int $id): Sector
    {
        return Sector::query()->findOrFail($id);
    }

    public function list(): Collection
    {
        return Sector::query()->orderBy('name')->get();
    }

    /** @param  array{name: string}  $data */
    public function create(array $data): Sector
    {
        return Sector::query()->create([
            'name' => $data['name'],
        ]);
    }

    /** @param  array{name?: string}  $data */
    public function update(Sector $sector, array $data): Sector
    {
        $sector->update(array_intersect_key($data, array_flip(['name'])));

        return $sector->fresh();
    }
}

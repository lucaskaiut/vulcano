<?php

namespace App\Modules\Cost\Domain\Services;

use App\Modules\Cost\Domain\Models\ProvisionRule;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProvisionRuleService
{
    public const SORTABLE_COLUMNS = ['name', 'percentage', 'created_at'];

    /** @return LengthAwarePaginator<int, ProvisionRule> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = ProvisionRule::query();
        $sort->apply($query);

        return $query->paginate($pagination->perPage, ['*'], 'page', $pagination->page);
    }

    public function find(int $id): ProvisionRule
    {
        return ProvisionRule::query()->findOrFail($id);
    }

    public function list(): Collection
    {
        return ProvisionRule::query()->orderBy('name')->get();
    }

    /** @return Collection<int, ProvisionRule> */
    public function listActive(): Collection
    {
        return ProvisionRule::query()->where('active', true)->orderBy('name')->get();
    }

    /** @param  array{name: string, percentage: float|string, active?: bool}  $data */
    public function create(array $data): ProvisionRule
    {
        return ProvisionRule::query()->create([
            'name' => $data['name'],
            'percentage' => $data['percentage'],
            'active' => $data['active'] ?? true,
        ]);
    }

    /** @param  array{name?: string, percentage?: float|string, active?: bool}  $data */
    public function update(ProvisionRule $provisionRule, array $data): ProvisionRule
    {
        $provisionRule->update(array_intersect_key($data, array_flip(['name', 'percentage', 'active'])));

        return $provisionRule->fresh();
    }
}

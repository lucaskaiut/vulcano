<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RoleService
{
    /** @var list<string> */
    public const SORTABLE_COLUMNS = ['name', 'description', 'created_at'];

    /** @return LengthAwarePaginator<int, Role> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = Role::query();
        $sort->apply($query);

        return $query->paginate(
            $pagination->perPage,
            ['*'],
            'page',
            $pagination->page,
        );
    }

    public function find(int $id): Role
    {
        return Role::query()->findOrFail($id);
    }

    /** @param  array{name: string, description?: string|null, permission_slugs?: list<string>}  $data */
    public function create(array $data): Role
    {
        return Role::query()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'permissions' => $data['permission_slugs'] ?? null,
        ]);
    }

    /** @param  array{name?: string, description?: string|null, permission_slugs?: list<string>}  $data */
    public function update(Role $role, array $data): Role
    {
        $attributes = [];

        if (array_key_exists('name', $data)) {
            $attributes['name'] = $data['name'];
        }

        if (array_key_exists('description', $data)) {
            $attributes['description'] = $data['description'];
        }

        if (array_key_exists('permission_slugs', $data)) {
            $attributes['permissions'] = $data['permission_slugs'];
        }

        if ($attributes !== []) {
            $role->update($attributes);
        }

        return $role->fresh();
    }

    public function delete(Role $role): void
    {
        $role->users()->detach();
        $role->delete();
    }
}

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
        $query = Role::query()->with(['permissions' => fn ($query) => $query->system()]);
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
        return Role::query()
            ->with(['permissions' => fn ($query) => $query->system()])
            ->findOrFail($id);
    }

    /** @param  array{name: string, description?: string|null, permission_ids?: list<int>}  $data */
    public function create(array $data): Role
    {
        $role = Role::query()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        if (! empty($data['permission_ids'])) {
            $role->permissions()->sync($data['permission_ids']);
        }

        return $role->load('permissions');
    }

    /** @param  array{name?: string, description?: string|null, permission_ids?: list<int>}  $data */
    public function update(Role $role, array $data): Role
    {
        $attributes = [];

        if (array_key_exists('name', $data)) {
            $attributes['name'] = $data['name'];
        }

        if (array_key_exists('description', $data)) {
            $attributes['description'] = $data['description'];
        }

        if ($attributes !== []) {
            $role->update($attributes);
        }

        if (array_key_exists('permission_ids', $data)) {
            $role->permissions()->sync($data['permission_ids']);
        }

        return $role->load('permissions');
    }

    public function delete(Role $role): void
    {
        $role->users()->detach();
        $role->permissions()->detach();
        $role->delete();
    }
}

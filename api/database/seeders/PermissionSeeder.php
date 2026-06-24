<?php

namespace Database\Seeders;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (PermissionEnum::seedDefinitions() as $permission) {
            Permission::query()->updateOrCreate(
                ['slug' => $permission['slug']],
                [
                    'name' => $permission['name'],
                    'description' => $permission['description'],
                ],
            );
        }

        Permission::query()
            ->whereNotIn('slug', PermissionEnum::values())
            ->each(function (Permission $permission): void {
                $permission->roles()->detach();
                $permission->delete();
            });
    }
}

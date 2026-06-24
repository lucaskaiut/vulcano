<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

function seedAcl(): void
{
    (new PermissionSeeder)->run();
    (new RoleSeeder)->run();
}

function createUserWithRole(string $roleName = 'Administrador', array $attributes = []): User
{
    seedAcl();

    $user = User::factory()->create($attributes);
    $role = Role::query()->where('name', $roleName)->firstOrFail();
    $user->roles()->attach($role);

    return $user->fresh(['roles.permissions']);
}

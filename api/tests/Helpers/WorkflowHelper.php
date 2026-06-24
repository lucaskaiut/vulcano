<?php

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\Permission;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;

function grantWorkflowPermissionsToRole(string $roleName, array $permissionSlugs): void
{
    $role = Role::query()->where('name', $roleName)->firstOrFail();
    $permissionIds = Permission::query()
        ->whereIn('slug', $permissionSlugs)
        ->pluck('id');

    $role->permissions()->syncWithoutDetaching($permissionIds);
}

function createWorkflowActor(string $roleName, array $attributes = []): User
{
    grantWorkflowPermissionsToRole($roleName, [
        PermissionEnum::WorkflowInstancesApprove->value,
        PermissionEnum::WorkflowInstancesReject->value,
    ]);

    $user = User::factory()->create($attributes);
    $role = Role::query()->where('name', $roleName)->firstOrFail();
    $user->roles()->attach($role);

    return $user->fresh(['roles.permissions']);
}

function createWorkflowInitiator(array $attributes = []): User
{
    seedAcl();

    grantWorkflowPermissionsToRole('Colaborador', [
        PermissionEnum::WorkflowInstancesCreate->value,
        PermissionEnum::WorkflowInstancesView->value,
        PermissionEnum::WorkflowInstancesCancel->value,
    ]);

    $user = User::factory()->create($attributes);
    $role = Role::query()->where('name', 'Colaborador')->firstOrFail();
    $user->roles()->attach($role);

    return $user->fresh(['roles.permissions']);
}

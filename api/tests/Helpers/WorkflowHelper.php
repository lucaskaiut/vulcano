<?php

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\Permission;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowStep;

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
        PermissionEnum::WorkflowInstancesView->value,
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

function createWorkflowStepsForType(WorkflowType $type): void
{
    $gestor = Role::query()->where('name', 'Gestor')->firstOrFail();
    $controlador = Role::query()->where('name', 'Controlador')->firstOrFail();

    WorkflowStep::factory()->create([
        'workflow_type' => $type->value,
        'name' => 'Gestora',
        'order' => 1,
        'responsible_role_id' => $gestor->id,
    ]);
    WorkflowStep::factory()->create([
        'workflow_type' => $type->value,
        'name' => 'Controlador',
        'order' => 2,
        'responsible_role_id' => $controlador->id,
    ]);
}

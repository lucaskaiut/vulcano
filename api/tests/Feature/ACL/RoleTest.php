<?php

use App\Modules\User\Domain\Models\Permission;
use App\Modules\User\Domain\Models\Role;

describe('roles index', function () {
    it('lists roles for authorized user', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->getJson('/api/roles');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'permissions']],
                'meta' => ['total'],
            ])
            ->assertJsonPath('meta.total', 6);
    });

    it('denies access without permission', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->getJson('/api/roles')
            ->assertForbidden();
    });
});

describe('roles store', function () {
    it('creates a role with permissions', function () {
        $admin = createUserWithRole();
        $permission = Permission::query()->first();

        $response = $this->actingAs($admin)->postJson('/api/roles', [
            'name' => 'Auditor',
            'description' => 'Perfil de auditoria',
            'permission_ids' => [$permission->id],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Auditor');

        $role = Role::query()->where('name', 'Auditor')->first();

        expect($role)->not->toBeNull()
            ->and($role->permissions)->toHaveCount(1);
    });
});

describe('roles update', function () {
    it('updates role and permissions', function () {
        $admin = createUserWithRole();
        $role = Role::query()->where('name', 'Colaborador')->firstOrFail();
        $permissions = Permission::query()->limit(2)->pluck('id')->all();

        $response = $this->actingAs($admin)->putJson("/api/roles/{$role->id}", [
            'name' => 'Colaborador Atualizado',
            'permission_ids' => $permissions,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Colaborador Atualizado');

        $role->refresh();

        expect($role->permissions)->toHaveCount(2);
    });
});

describe('roles destroy', function () {
    it('deletes a role', function () {
        $admin = createUserWithRole();
        $role = Role::query()->create([
            'name' => 'Temporário',
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/roles/{$role->id}")
            ->assertOk();

        expect(Role::query()->find($role->id))->toBeNull();
    });
});

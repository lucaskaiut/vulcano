<?php

use App\Modules\User\Domain\Models\Role;

describe('roles index', function () {
    it('lists roles for authorized user', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->getJson('/api/roles');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'permission_slugs']],
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
    it('creates a role with permission slugs', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->postJson('/api/roles', [
            'name' => 'Auditor',
            'description' => 'Perfil de auditoria',
            'permission_slugs' => ['users.view'],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Auditor')
            ->assertJsonPath('data.permission_slugs', ['users.view']);

        $role = Role::query()->where('name', 'Auditor')->first();

        expect($role)->not->toBeNull()
            ->and($role->permissions)->toBe(['users.view']);
    });

    it('validates permission slugs are from enum', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->postJson('/api/roles', [
                'name' => 'Auditor',
                'permission_slugs' => ['invalid.permission'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['permission_slugs.0']);
    });
});

describe('roles update', function () {
    it('updates role and permission slugs', function () {
        $admin = createUserWithRole();
        $role = Role::query()->where('name', 'Colaborador')->firstOrFail();

        $response = $this->actingAs($admin)->putJson("/api/roles/{$role->id}", [
            'name' => 'Colaborador Atualizado',
            'permission_slugs' => ['users.view', 'users.create'],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Colaborador Atualizado')
            ->assertJsonPath('data.permission_slugs', ['users.view', 'users.create']);

        $role->refresh();

        expect($role->permissions)->toBe(['users.view', 'users.create']);
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

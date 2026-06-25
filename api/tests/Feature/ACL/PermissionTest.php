<?php

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;

describe('permissions index', function () {
    it('lists permissions from enum for authorized user', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->getJson('/api/permissions');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'slug']],
                'meta' => ['total'],
            ])
            ->assertJsonPath('meta.total', count(PermissionEnum::cases()));

        $slugs = collect($response->json('data'))->pluck('slug')->sort()->values()->all();

        expect($slugs)->toEqual(collect(PermissionEnum::values())->sort()->values()->all());
    });

    it('denies access without permission', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->getJson('/api/permissions')
            ->assertForbidden();
    });

    it('does not allow creating permissions', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->postJson('/api/permissions', [
                'name' => 'Exportar Relatórios',
                'slug' => 'reports.export',
            ])
            ->assertMethodNotAllowed();
    });
});

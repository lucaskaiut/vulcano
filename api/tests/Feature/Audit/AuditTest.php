<?php

use App\Modules\Audit\Domain\Models\AuditLog;

describe('audit logs', function () {
    it('captures created event on auditable models', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)->postJson('/api/cost-categories', [
            'name' => 'Test Category',
            'type' => 'benefit',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'created',
            'entity' => 'App\Modules\Cost\Domain\Models\CostCategory',
        ]);
    });

    it('captures updated event on auditable models', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin);

        $user = \App\Modules\User\Domain\Models\User::factory()->create([
            'email' => 'update-test@audit.com',
        ]);

        $this->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Name',
            'job_title' => $user->job_title,
            'hired_at' => $user->hired_at->format('Y-m-d'),
            'email' => $user->email,
            'manager_id' => null,
            'role_ids' => [],
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'updated',
            'entity' => 'App\Modules\User\Domain\Models\User',
            'entity_id' => $user->id,
        ]);
    });

    it('lists audit logs with filters', function () {
        $admin = createUserWithRole();

        AuditLog::query()->create([
            'user_id' => $admin->id,
            'action' => 'created',
            'entity' => 'TestEntity',
            'entity_id' => 999,
            'new_data' => ['name' => 'Test'],
        ]);

        $response = $this->actingAs($admin)->getJson('/api/audit-logs?entity=TestEntity&per_page=10');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.action', 'created');
    });

    it('denies access without permission', function () {
        $colaborador = createUserWithRole('Colaborador');

        $this->actingAs($colaborador)
            ->getJson('/api/audit-logs')
            ->assertForbidden();
    });
});

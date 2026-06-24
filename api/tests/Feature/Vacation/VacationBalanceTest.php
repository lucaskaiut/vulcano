<?php

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;

describe('vacation balances store', function () {
    it('cria saldo inicial para colaborador', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/vacation-balances', [
            'user_id' => $collaborator->id,
            'additional_days' => 5,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user_id', $collaborator->id)
            ->assertJsonPath('data.available_days', 5)
            ->assertJsonPath('data.additional_days', 5);

        $this->assertDatabaseHas('vacation_balances', [
            'user_id' => $collaborator->id,
            'available_days' => 5,
            'accrued_days' => 0,
            'used_days' => 0,
        ]);
    });

    it('impede criar saldo duplicado', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationBalance::factory()->create(['user_id' => $collaborator->id]);

        $this->actingAs($admin)
            ->postJson('/api/vacation-balances', ['user_id' => $collaborator->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    });
});

describe('vacation balances update', function () {
    it('atualiza dias adicionais e recalcula saldo disponível', function () {
        $admin = createUserWithRole();
        $balance = VacationBalance::factory()->create([
            'accrued_days' => 20,
            'used_days' => 5,
            'additional_days' => 0,
            'available_days' => 15,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/vacation-balances/{$balance->id}", ['additional_days' => 3])
            ->assertOk()
            ->assertJsonPath('data.additional_days', 3)
            ->assertJsonPath('data.available_days', 18);

        expect($balance->fresh()->available_days)->toBe(18);
    });
});

describe('vacation balances show', function () {
    it('consulta saldo com histórico de concessões e períodos', function () {
        $admin = createUserWithRole();
        $balance = VacationBalance::factory()->create([
            'accrued_days' => 30,
            'available_days' => 30,
        ]);

        $this->actingAs($admin)
            ->getJson("/api/vacation-balances/{$balance->id}")
            ->assertOk()
            ->assertJsonPath('data.accrued_days', 30)
            ->assertJsonStructure([
                'data' => ['id', 'available_days', 'grants', 'periods', 'user'],
            ]);
    });
});

describe('vacation balances index', function () {
    it('lista saldos de férias', function () {
        $admin = createUserWithRole();
        VacationBalance::factory()->count(2)->create();

        $this->actingAs($admin)
            ->getJson('/api/vacation-balances')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('nega acesso sem permissão', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->getJson('/api/vacation-balances')
            ->assertForbidden();
    });
});

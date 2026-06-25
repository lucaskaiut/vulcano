<?php

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;

describe('vacation balances store', function () {
    it('cria saldo inicial para colaborador', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create(['hired_at' => '2024-01-15']);

        $response = $this->actingAs($admin)->postJson('/api/vacation-balances', [
            'user_id' => $collaborator->id,
            'additional_days' => 5,
        ]);

        $expectedAccrued = round(VacationEntitlementCalculator::calculateAccruedDays('2024-01-15'), 1);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user_id', $collaborator->id)
            ->assertJsonPath('data.additional_days', 5)
            ->assertJsonPath('data.accrued_days', $expectedAccrued);
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
        $user = User::factory()->create(['hired_at' => '2024-01-01']);
        $balance = VacationBalance::factory()->create([
            'user_id' => $user->id,
            'accrued_days' => 0,
            'used_days' => 5,
            'additional_days' => 0,
            'available_days' => 0,
        ]);

        $expectedAccrued = round(VacationEntitlementCalculator::calculateAccruedDays('2024-01-01'), 1);
        $expectedAvailable = max(0, $expectedAccrued + 3 - 5);

        $this->actingAs($admin)
            ->putJson("/api/vacation-balances/{$balance->id}", ['additional_days' => 3])
            ->assertOk()
            ->assertJsonPath('data.additional_days', 3)
            ->assertJsonPath('data.available_days', $expectedAvailable);
    });
});

describe('vacation balances show', function () {
    it('consulta saldo com histórico de concessões e períodos', function () {
        $admin = createUserWithRole();
        $user = User::factory()->create(['hired_at' => '2023-06-01']);
        $balance = VacationBalance::factory()->create([
            'user_id' => $user->id,
            'accrued_days' => 0,
            'available_days' => 0,
        ]);

        $this->actingAs($admin)
            ->getJson("/api/vacation-balances/{$balance->id}")
            ->assertOk()
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

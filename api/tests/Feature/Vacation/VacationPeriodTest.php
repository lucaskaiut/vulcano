<?php

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationPeriodStatus;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationPeriod;

describe('vacation periods store', function () {
    it('cria período aquisitivo em andamento', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/vacation-periods', [
            'user_id' => $collaborator->id,
            'start_date' => '2024-01-15',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', VacationPeriodStatus::Open->value)
            ->assertJsonPath('data.start_date', '2024-01-15')
            ->assertJsonPath('data.end_date', null);

        $this->assertDatabaseHas('vacation_balances', ['user_id' => $collaborator->id]);
    });
});

describe('vacation periods close', function () {
    it('encerra período e calcula dias adquiridos', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        $balance = VacationBalance::factory()->create(['user_id' => $collaborator->id]);
        $period = VacationPeriod::factory()->create([
            'user_id' => $collaborator->id,
            'start_date' => '2024-01-01',
            'status' => VacationPeriodStatus::Open,
        ]);

        $this->actingAs($admin)
            ->postJson("/api/vacation-periods/{$period->id}/close", [
                'end_date' => '2024-12-31',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', VacationPeriodStatus::Closed->value)
            ->assertJsonPath('data.entitled_days', 30);

        expect($balance->fresh()->accrued_days)->toBe(30)
            ->and($balance->fresh()->available_days)->toBe(30);
    });

    it('calcula dias adquiridos proporcionalmente em período parcial', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationBalance::factory()->create(['user_id' => $collaborator->id]);
        $period = VacationPeriod::factory()->create([
            'user_id' => $collaborator->id,
            'start_date' => '2024-01-01',
        ]);

        $this->actingAs($admin)
            ->postJson("/api/vacation-periods/{$period->id}/close", [
                'end_date' => '2024-06-30',
            ])
            ->assertOk()
            ->assertJsonPath('data.entitled_days', 15);
    });
});

describe('vacation periods index', function () {
    it('lista períodos aquisitivos filtrados por colaborador', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationPeriod::factory()->create(['user_id' => $collaborator->id]);
        VacationPeriod::factory()->create();

        $this->actingAs($admin)
            ->getJson("/api/vacation-periods?user_id={$collaborator->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });
});

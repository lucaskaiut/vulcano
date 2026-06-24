<?php

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationGrant;

describe('vacation grants store', function () {
    it('registra férias concedidas e debita saldo', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationBalance::factory()->create([
            'user_id' => $collaborator->id,
            'accrued_days' => 30,
            'available_days' => 30,
            'used_days' => 0,
        ]);

        $response = $this->actingAs($admin)->postJson('/api/vacation-grants', [
            'user_id' => $collaborator->id,
            'start_date' => '2025-01-10',
            'end_date' => '2025-01-24',
            'days_used' => 10,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.days_used', 10);

        $this->assertDatabaseHas('vacation_grants', [
            'user_id' => $collaborator->id,
            'days_used' => 10,
        ]);

        $this->assertDatabaseHas('vacation_balances', [
            'user_id' => $collaborator->id,
            'used_days' => 10,
            'available_days' => 20,
        ]);
    });

    it('impede concessão com saldo insuficiente', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationBalance::factory()->create([
            'user_id' => $collaborator->id,
            'available_days' => 5,
            'accrued_days' => 5,
        ]);

        $this->actingAs($admin)
            ->postJson('/api/vacation-grants', [
                'user_id' => $collaborator->id,
                'start_date' => '2025-02-01',
                'end_date' => '2025-02-20',
                'days_used' => 10,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['days_used']);
    });
});

describe('vacation grants index', function () {
    it('lista férias concedidas do colaborador', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        VacationGrant::factory()->create(['user_id' => $collaborator->id]);

        $this->actingAs($admin)
            ->getJson("/api/vacation-grants?user_id={$collaborator->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });
});

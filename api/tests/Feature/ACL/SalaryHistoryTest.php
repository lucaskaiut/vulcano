<?php

use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;

function salaryHistoryPayload(array $overrides = []): array
{
    return array_merge([
        'new_salary' => 9800,
        'effective_date' => '2024-06-01',
        'notes' => 'Reajuste anual',
    ], $overrides);
}

describe('salary histories index', function () {
    it('lists salary history for a collaborator', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create(['salary' => 8500]);

        SalaryHistory::factory()->initial(8500)->create([
            'user_id' => $collaborator->id,
            'effective_date' => '2024-01-15',
            'changed_by_user_id' => $admin->id,
        ]);

        SalaryHistory::factory()->create([
            'user_id' => $collaborator->id,
            'previous_salary' => 8500,
            'new_salary' => 9800,
            'effective_date' => '2024-06-01',
            'changed_by_user_id' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->getJson("/api/users/{$collaborator->id}/salary-histories")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.new_salary', '9800.00')
            ->assertJsonPath('data.1.previous_salary', null)
            ->assertJsonPath('data.1.new_salary', '8500.00')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'previous_salary',
                    'new_salary',
                    'effective_date',
                    'notes',
                    'changed_by' => ['id', 'name'],
                ]],
            ]);
    });

    it('denies access without permission', function () {
        $user = createUserWithRole('Colaborador');
        $collaborator = User::factory()->create();

        $this->actingAs($user)
            ->getJson("/api/users/{$collaborator->id}/salary-histories")
            ->assertForbidden();
    });
});

describe('salary histories store', function () {
    it('registers a salary adjustment and updates current salary', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create(['salary' => 8500]);

        SalaryHistory::factory()->initial(8500)->create([
            'user_id' => $collaborator->id,
            'effective_date' => '2024-01-15',
            'changed_by_user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->postJson(
            "/api/users/{$collaborator->id}/salary-histories",
            salaryHistoryPayload(),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.previous_salary', '8500.00')
            ->assertJsonPath('data.new_salary', '9800.00')
            ->assertJsonPath('data.effective_date', '2024-06-01')
            ->assertJsonPath('data.changed_by.id', $admin->id);

        expect($collaborator->fresh()->salary)->toBe('9800.00');

        $this->assertDatabaseHas('salary_histories', [
            'user_id' => $collaborator->id,
            'new_salary' => 9800,
            'changed_by_user_id' => $admin->id,
        ]);
    });

    it('validates required fields', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();

        $this->actingAs($admin)
            ->postJson("/api/users/{$collaborator->id}/salary-histories", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['new_salary', 'effective_date']);
    });
});

describe('salary histories update', function () {
    it('updates a salary history record and recalculates current salary', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create(['salary' => 9800]);

        $initial = SalaryHistory::factory()->initial(8500)->create([
            'user_id' => $collaborator->id,
            'effective_date' => '2024-01-15',
            'changed_by_user_id' => $admin->id,
        ]);

        $adjustment = SalaryHistory::factory()->create([
            'user_id' => $collaborator->id,
            'previous_salary' => 8500,
            'new_salary' => 9800,
            'effective_date' => '2024-06-01',
            'changed_by_user_id' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/users/{$collaborator->id}/salary-histories/{$adjustment->id}", [
                'new_salary' => 10500,
                'notes' => 'Correção de reajuste',
            ])
            ->assertOk()
            ->assertJsonPath('data.new_salary', '10500.00')
            ->assertJsonPath('data.notes', 'Correção de reajuste');

        expect($collaborator->fresh()->salary)->toBe('10500.00');
        expect($initial->fresh()->new_salary)->toBe('8500.00');
    });

    it('returns not found when history does not belong to collaborator', function () {
        $admin = createUserWithRole();
        $collaborator = User::factory()->create();
        $other = User::factory()->create();

        $history = SalaryHistory::factory()->initial()->create([
            'user_id' => $other->id,
            'changed_by_user_id' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/users/{$collaborator->id}/salary-histories/{$history->id}", [
                'new_salary' => 9000,
            ])
            ->assertNotFound();
    });
});

describe('salary histories on user create', function () {
    it('creates initial salary history when collaborator is created', function () {
        $admin = createUserWithRole();
        $role = $admin->roles->first();

        $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Novo Colaborador',
            'email' => 'novo@example.com',
            'password' => 'password123',
            'role_ids' => [$role->id],
            'job_title' => 'Analista',
            'hired_at' => '2024-03-01',
            'salary' => 7500,
        ])->assertCreated();

        $user = User::query()->where('email', 'novo@example.com')->firstOrFail();

        $user = User::query()->where('email', 'novo@example.com')->with('salaryHistories')->firstOrFail();
        $history = $user->salaryHistories->first();

        expect($history)->not->toBeNull()
            ->and($history->previous_salary)->toBeNull()
            ->and((float) $history->new_salary)->toBe(7500.0)
            ->and($history->effective_date->toDateString())->toBe('2024-03-01')
            ->and($history->changed_by_user_id)->toBe($admin->id);
    });
});

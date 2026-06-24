<?php

use App\Modules\User\Domain\Models\User;
use Illuminate\Support\Facades\Hash;

function collaboratorPayload(array $overrides = []): array
{
    return array_merge([
        'job_title' => 'Analista',
        'hired_at' => '2024-01-15',
        'salary' => 8500,
    ], $overrides);
}

describe('users index', function () {
    it('lists users for authorized user', function () {
        $admin = createUserWithRole();
        User::factory()->count(2)->create();

        $response = $this->actingAs($admin)->getJson('/api/users');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'job_title', 'hired_at', 'salary', 'email', 'roles']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 3);
    });

    it('denies access without permission', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->getJson('/api/users')
            ->assertForbidden();
    });
});

describe('users show', function () {
    it('returns collaborator details', function () {
        $admin = createUserWithRole();
        $manager = User::factory()->create(['name' => 'Gestor Principal']);
        $user = User::factory()->create([
            'manager_id' => $manager->id,
            'job_title' => 'Desenvolvedor',
            'hired_at' => '2023-06-01',
            'salary' => 12000,
        ]);

        $this->actingAs($admin)
            ->getJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('data.name', $user->name)
            ->assertJsonPath('data.job_title', 'Desenvolvedor')
            ->assertJsonPath('data.hired_at', '2023-06-01')
            ->assertJsonPath('data.salary', '12000.00')
            ->assertJsonPath('data.manager.name', 'Gestor Principal');
    });
});

describe('users pagination', function () {
    it('paginates users by page and per_page', function () {
        $admin = createUserWithRole();
        User::factory()->count(15)->create();

        $response = $this->actingAs($admin)->getJson('/api/users?page=2&per_page=10');

        $response
            ->assertOk()
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 16)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonCount(6, 'data');
    });

    it('falls back to default per_page when invalid', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->getJson('/api/users?per_page=999')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 15);
    });
});

describe('users store', function () {
    it('creates a user with roles and collaborator data', function () {
        $admin = createUserWithRole();
        $role = $admin->roles->first();
        $manager = User::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Novo Colaborador',
            'email' => 'novo@example.com',
            'password' => 'password123',
            'role_ids' => [$role->id],
            ...collaboratorPayload([
                'manager_id' => $manager->id,
                'job_title' => 'Product Manager',
                'salary' => 15000.50,
            ]),
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'novo@example.com')
            ->assertJsonPath('data.job_title', 'Product Manager')
            ->assertJsonPath('data.manager.name', $manager->name)
            ->assertJsonPath('message', 'Colaborador criado com sucesso.');

        $createdUser = User::query()->where('email', 'novo@example.com')->first();

        expect($createdUser)->not->toBeNull()
            ->and(Hash::check('password123', $createdUser->password))->toBeTrue()
            ->and($createdUser->roles)->toHaveCount(1)
            ->and($createdUser->manager_id)->toBe($manager->id)
            ->and((float) $createdUser->salary)->toBe(15000.50);
    });

    it('validates required fields', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->postJson('/api/users', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'job_title', 'hired_at', 'salary', 'email', 'password']);
    });
});

describe('users update', function () {
    it('updates user data, collaborator fields and roles', function () {
        $admin = createUserWithRole();
        $manager = User::factory()->create(['name' => 'Novo Gestor']);
        $user = User::factory()->create(['name' => 'Antigo Nome']);
        $role = $admin->roles->first();

        $response = $this->actingAs($admin)->putJson("/api/users/{$user->id}", [
            'name' => 'Nome Atualizado',
            'job_title' => 'Coordenador',
            'hired_at' => '2022-03-10',
            'manager_id' => $manager->id,
            'salary' => 9800,
            'role_ids' => [$role->id],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Nome Atualizado')
            ->assertJsonPath('data.job_title', 'Coordenador')
            ->assertJsonPath('data.manager.name', 'Novo Gestor');

        $user->refresh();

        expect($user->name)->toBe('Nome Atualizado')
            ->and($user->job_title)->toBe('Coordenador')
            ->and($user->manager_id)->toBe($manager->id)
            ->and($user->roles)->toHaveCount(1);
    });

    it('prevents selecting self as manager', function () {
        $admin = createUserWithRole();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->putJson("/api/users/{$user->id}", [
                'manager_id' => $user->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['manager_id']);
    });
});

describe('users filters', function () {
    it('filters by partial email', function () {
        $admin = createUserWithRole();
        User::factory()->create(['email' => 'alpha@example.com']);
        User::factory()->create(['email' => 'beta@example.com']);

        $this->actingAs($admin)
            ->getJson('/api/users?email=alpha@')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'alpha@example.com')
            ->assertJsonPath('meta.filters.email', 'alpha@');
    });

    it('filters hired_at with only start date', function () {
        $admin = createUserWithRole();
        $early = User::factory()->create(['hired_at' => '2024-01-01']);
        $late = User::factory()->create(['hired_at' => '2024-06-01']);

        $response = $this->actingAs($admin)->getJson('/api/users?hired_from=2024-03-01');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        expect($ids)->toContain($late->id)->not->toContain($early->id);
    });

    it('filters hired_at with only end date', function () {
        $admin = createUserWithRole();
        $early = User::factory()->create(['hired_at' => '2024-01-01']);
        $late = User::factory()->create(['hired_at' => '2024-06-01']);

        $response = $this->actingAs($admin)->getJson('/api/users?hired_to=2024-03-01');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        expect($ids)->toContain($early->id)->not->toContain($late->id);
    });

    it('filters created_at by range', function () {
        $admin = createUserWithRole();
        $older = User::factory()->create();
        $older->forceFill(['created_at' => '2024-01-10 10:00:00'])->save();

        $newer = User::factory()->create();
        $newer->forceFill(['created_at' => '2024-05-10 10:00:00'])->save();

        $this->actingAs($admin)
            ->getJson('/api/users?created_from=2024-03-01&created_to=2024-06-01')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $newer->id);
    });

    it('filters salary with only minimum', function () {
        $admin = createUserWithRole();
        $low = User::factory()->create(['salary' => 5000]);
        $high = User::factory()->create(['salary' => 12000]);

        $response = $this->actingAs($admin)->getJson('/api/users?salary_min=8000');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        expect($ids)->toContain($high->id)->not->toContain($low->id);
    });

    it('filters salary with only maximum', function () {
        $admin = createUserWithRole();
        $low = User::factory()->create(['salary' => 5000]);
        $high = User::factory()->create(['salary' => 12000]);

        $response = $this->actingAs($admin)->getJson('/api/users?salary_max=8000');

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        expect($ids)->toContain($low->id)->not->toContain($high->id);
    });

    it('searches collaborators by name', function () {
        $admin = createUserWithRole();
        User::factory()->create(['name' => 'Maria Silva']);
        User::factory()->create(['name' => 'João Souza']);

        $this->actingAs($admin)
            ->getJson('/api/users?search=Maria')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Maria Silva');
    });

    it('excludes a collaborator by id', function () {
        $admin = createUserWithRole();
        $excluded = User::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/users?exclude_id={$excluded->id}");

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        expect($ids)->not->toContain($excluded->id);
    });

    it('rejects hired_at range when start is after end', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->getJson('/api/users?hired_from=2024-06-01&hired_to=2024-01-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['hired_from', 'hired_to']);
    });

    it('rejects created_at range when start is after end', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->getJson('/api/users?created_from=2024-06-01&created_to=2024-01-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['created_from', 'created_to']);
    });

    it('rejects salary range when minimum is greater than maximum', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->getJson('/api/users?salary_min=12000&salary_max=5000')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['salary_min', 'salary_max']);
    });
});

describe('users destroy', function () {
    it('deletes another user', function () {
        $admin = createUserWithRole();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Colaborador excluído com sucesso.');

        expect(User::query()->find($user->id))->toBeNull();
    });

    it('prevents self deletion', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->deleteJson("/api/users/{$admin->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Você não pode excluir sua própria conta.');
    });
});

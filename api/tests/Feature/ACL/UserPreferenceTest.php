<?php

use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Models\UserPreference;

describe('show preferences', function () {
    it('returns empty preferences for new user', function () {
        $user = createUserWithRole();

        $response = $this->actingAs($user)->getJson('/api/me/preferences');

        $response
            ->assertOk()
            ->assertJsonPath('data', []);
    });

    it('returns saved preferences', function () {
        $user = createUserWithRole();

        UserPreference::query()->create([
            'user_id' => $user->id,
            'data' => ['tables' => ['users' => ['sort' => ['column' => 'email', 'direction' => 'desc']]]],
        ]);

        $response = $this->actingAs($user)->getJson('/api/me/preferences');

        $response
            ->assertOk()
            ->assertJsonPath('data.tables.users.sort.column', 'email')
            ->assertJsonPath('data.tables.users.sort.direction', 'desc');
    });
});

describe('update preferences', function () {
    it('merges preferences without overwriting unrelated keys', function () {
        $user = createUserWithRole();

        UserPreference::query()->create([
            'user_id' => $user->id,
            'data' => ['theme' => 'dark'],
        ]);

        $response = $this->actingAs($user)->patchJson('/api/me/preferences', [
            'tables' => [
                'users' => [
                    'sort' => ['column' => 'name', 'direction' => 'asc'],
                ],
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.theme', 'dark')
            ->assertJsonPath('data.tables.users.sort.column', 'name');

        $preference = UserPreference::query()->where('user_id', $user->id)->first();

        expect($preference->data['theme'])->toBe('dark')
            ->and($preference->data['tables']['users']['sort']['column'])->toBe('name');
    });

    it('includes preferences in me endpoint', function () {
        $user = createUserWithRole();

        UserPreference::query()->create([
            'user_id' => $user->id,
            'data' => ['tables' => ['roles' => ['sorts' => [['column' => 'description', 'direction' => 'asc']]]]],
        ]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('data.preferences.tables.roles.sorts.0.column', 'description');
    });

    it('persists pagination per_page preference', function () {
        $user = createUserWithRole();

        $this->actingAs($user)
            ->patchJson('/api/me/preferences', [
                'pagination' => ['perPage' => 25],
            ])
            ->assertOk()
            ->assertJsonPath('data.pagination.perPage', 25);

        $this->actingAs($user)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.preferences.pagination.perPage', 25);
    });

    it('replaces table filters instead of merging when clearing', function () {
        $user = createUserWithRole();

        UserPreference::query()->create([
            'user_id' => $user->id,
            'data' => [
                'tables' => [
                    'users' => [
                        'filters' => [
                            'email' => 'alpha@example.com',
                            'salary_min' => '5000',
                        ],
                    ],
                ],
            ],
        ]);

        $this->actingAs($user)
            ->patchJson('/api/me/preferences', [
                'tables' => [
                    'users' => [
                        'filters' => [],
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.tables.users.filters', []);

        $preference = UserPreference::query()->where('user_id', $user->id)->first();

        expect($preference->data['tables']['users']['filters'])->toBe([]);
    });
});

describe('users sorting', function () {
    it('sorts users by column and direction', function () {
        $admin = createUserWithRole();

        User::factory()->create(['name' => 'Bravo', 'email' => 'b@example.com']);
        User::factory()->create(['name' => 'Alpha', 'email' => 'a@example.com']);

        $response = $this->actingAs($admin)->getJson('/api/users?sort=name:asc');

        $response
            ->assertOk()
            ->assertJsonPath('meta.sort', 'name:asc')
            ->assertJsonPath('meta.sorts.0.column', 'name')
            ->assertJsonPath('meta.sorts.0.direction', 'asc');

        $names = collect($response->json('data'))->pluck('name');

        expect($names->search('Alpha'))->toBeLessThan($names->search('Bravo'));
    });

    it('sorts users by multiple columns incrementally', function () {
        $admin = createUserWithRole();

        User::factory()->create(['name' => 'Alpha', 'email' => 'z@example.com']);
        User::factory()->create(['name' => 'Alpha', 'email' => 'a@example.com']);
        User::factory()->create(['name' => 'Bravo', 'email' => 'b@example.com']);

        $response = $this->actingAs($admin)->getJson('/api/users?sort=name:asc,email:asc');

        $response
            ->assertOk()
            ->assertJsonPath('meta.sort', 'name:asc,email:asc');

        $emails = collect($response->json('data'))
            ->where('name', 'Alpha')
            ->pluck('email')
            ->values();

        expect($emails->first())->toBe('a@example.com')
            ->and($emails->last())->toBe('z@example.com');
    });

    it('falls back to default when sort parameter is empty', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->getJson('/api/users');

        $response
            ->assertOk()
            ->assertJsonPath('meta.sort', 'name:asc');
    });

    it('ignores invalid sort segments', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->getJson('/api/users?sort=invalid:asc,name:asc');

        $response
            ->assertOk()
            ->assertJsonPath('meta.sort', 'name:asc');
    });
});

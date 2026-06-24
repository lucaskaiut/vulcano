<?php

use Database\Seeders\TestUserSeeder;

beforeEach(function () {
    $this->withHeaders([
        'Origin' => 'http://localhost:5173',
        'Referer' => 'http://localhost:5173/',
    ])->withCredentials();
});

describe('seeded test user', function () {
    it('exists after running TestUserSeeder', function () {
        $this->seed(TestUserSeeder::class);

        expect(App\Modules\User\Domain\Models\User::query()
            ->where('email', TestUserSeeder::EMAIL)
            ->exists()
        )->toBeTrue();
    });

    it('allows login with documented credentials', function () {
        $this->seed(TestUserSeeder::class);

        $response = $this->postJson('/api/login', [
            'email' => TestUserSeeder::EMAIL,
            'password' => TestUserSeeder::PASSWORD,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.email', TestUserSeeder::EMAIL);

        $this->assertAuthenticated();
    });

    it('can run TestUserSeeder multiple times without error', function () {
        $this->seed(TestUserSeeder::class);
        $this->seed(TestUserSeeder::class);

        expect(App\Modules\User\Domain\Models\User::query()
            ->where('email', TestUserSeeder::EMAIL)
            ->count()
        )->toBe(1);
    });

    it('assigns administrador role when ACL seeders ran first', function () {
        $this->seed([
            Database\Seeders\PermissionSeeder::class,
            Database\Seeders\RoleSeeder::class,
            TestUserSeeder::class,
        ]);

        $user = App\Modules\User\Domain\Models\User::query()
            ->where('email', TestUserSeeder::EMAIL)
            ->first();

        expect($user)->not->toBeNull()
            ->and($user->hasPermission('users.view'))->toBeTrue();
    });
});

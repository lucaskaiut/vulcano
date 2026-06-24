<?php

use App\Modules\User\Domain\Messages\AuthMessages;
use App\Modules\User\Domain\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

beforeEach(function () {
    $this->withHeaders([
        'Origin' => 'http://localhost:5173',
        'Referer' => 'http://localhost:5173/',
    ])->withCredentials();
});

describe('login', function () {
    it('authenticates with valid credentials', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.name', $user->name);

        $this->assertAuthenticatedAs($user);
    });

    it('rejects invalid credentials', function () {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', AuthMessages::INVALID_CREDENTIALS);

        $this->assertGuest();
    });
});

describe('logout', function () {
    it('logs out authenticated user', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logout realizado com sucesso.');

        $this->assertGuest('web');
    });
});

describe('me', function () {
    it('returns authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    });

    it('rejects unauthenticated request', function () {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
    });
});

describe('forgot password', function () {
    it('sends password reset link for existing user', function () {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertOk();

        Notification::assertSentTo($user, App\Modules\User\Notifications\ResetPasswordNotification::class);
    });

    it('rejects invalid email format', function () {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'invalid-email',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });
});

describe('reset password', function () {
    it('resets password with valid token', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'old-password',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'token' => $token,
        ]);

        $response->assertOk();

        $user->refresh();

        expect(Hash::check('new-password', $user->password))->toBeTrue();
    });

    it('rejects reset with invalid token', function () {
        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'token' => 'invalid-token',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });
});

<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Messages\AuthMessages;
use App\Modules\User\Domain\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $email, string $password, bool $remember = false): User
    {
        if (! Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
            throw ValidationException::withMessages([
                'email' => [AuthMessages::INVALID_CREDENTIALS],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();

        if (request()->hasSession()) {
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [AuthMessages::forPasswordStatus($status)],
            ]);
        }

        return AuthMessages::RESET_LINK_SENT;
    }

    public function resetPassword(array $credentials): string
    {
        $status = Password::reset(
            $credentials,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [AuthMessages::forPasswordStatus($status)],
            ]);
        }

        return AuthMessages::PASSWORD_RESET;
    }
}

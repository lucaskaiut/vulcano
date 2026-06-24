<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Services\AuthService;
use App\Modules\User\Http\Requests\ForgotPasswordRequest;
use App\Modules\User\Http\Requests\LoginRequest;
use App\Modules\User\Http\Requests\ResetPasswordRequest;
use App\Modules\User\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
            $request->boolean('remember'),
        );

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'roles.permissions' => fn ($query) => $query->system(),
            'preference',
        ]);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->sendPasswordResetLink($request->validated('email'));

        return response()->json([
            'message' => $message,
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->resetPassword($request->validated());

        return response()->json([
            'message' => $message,
        ]);
    }
}

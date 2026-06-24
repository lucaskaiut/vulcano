<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Services\UserPreferenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserPreferenceController extends Controller
{
    public function __construct(private readonly UserPreferenceService $preferenceService) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->preferenceService->get($request->user()),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->json()->all();

        if (! is_array($payload)) {
            throw ValidationException::withMessages([
                'body' => 'Envie um objeto JSON válido.',
            ]);
        }

        $preferences = $this->preferenceService->merge($request->user(), $payload);

        return response()->json([
            'data' => $preferences,
            'message' => 'Preferências atualizadas com sucesso.',
        ]);
    }
}

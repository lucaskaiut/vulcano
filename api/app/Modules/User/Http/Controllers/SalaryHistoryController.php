<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Services\SalaryHistoryService;
use App\Modules\User\Http\Requests\StoreSalaryHistoryRequest;
use App\Modules\User\Http\Requests\UpdateSalaryHistoryRequest;
use App\Modules\User\Http\Resources\SalaryHistoryResource;
use Illuminate\Http\JsonResponse;

class SalaryHistoryController extends Controller
{
    public function __construct(private readonly SalaryHistoryService $salaryHistoryService) {}

    public function index(User $user): JsonResponse
    {
        $histories = $this->salaryHistoryService->listForUser($user);

        return response()->json([
            'data' => SalaryHistoryResource::collection($histories),
        ]);
    }

    public function store(StoreSalaryHistoryRequest $request, User $user): JsonResponse
    {
        $history = $this->salaryHistoryService->create(
            $user,
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'data' => new SalaryHistoryResource($history),
            'message' => 'Reajuste registrado com sucesso.',
        ], 201);
    }

    public function update(
        UpdateSalaryHistoryRequest $request,
        User $user,
        SalaryHistory $salaryHistory,
    ): JsonResponse {
        abort_unless($salaryHistory->user_id === $user->id, 404);

        $history = $this->salaryHistoryService->update($salaryHistory, $request->validated());

        return response()->json([
            'data' => new SalaryHistoryResource($history),
            'message' => 'Registro salarial atualizado com sucesso.',
        ]);
    }
}

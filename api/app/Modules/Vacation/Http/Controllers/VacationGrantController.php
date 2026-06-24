<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vacation\Domain\Services\VacationGrantService;
use App\Modules\Vacation\Http\Requests\StoreVacationGrantRequest;
use App\Modules\Vacation\Http\Resources\VacationGrantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VacationGrantController extends Controller
{
    public function __construct(private readonly VacationGrantService $vacationGrantService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        abort_unless($userId, 422, 'Informe o colaborador.');

        return response()->json([
            'data' => VacationGrantResource::collection(
                $this->vacationGrantService->listForUser((int) $userId),
            ),
        ]);
    }

    public function store(StoreVacationGrantRequest $request): JsonResponse
    {
        $grant = $this->vacationGrantService->create($request->validated());

        return response()->json([
            'data' => new VacationGrantResource($grant),
            'message' => 'Férias concedidas registradas com sucesso.',
        ], 201);
    }
}

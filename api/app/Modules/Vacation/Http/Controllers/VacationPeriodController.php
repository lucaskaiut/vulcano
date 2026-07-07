<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vacation\Domain\Models\VacationPeriod;
use App\Modules\Vacation\Domain\Services\VacationPeriodService;
use App\Modules\Vacation\Http\Requests\CloseVacationPeriodRequest;
use App\Modules\Vacation\Http\Requests\StoreVacationPeriodRequest;
use App\Modules\Vacation\Http\Resources\VacationPeriodResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VacationPeriodController extends Controller
{
    public function __construct(private readonly VacationPeriodService $vacationPeriodService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        return response()->json([
            'data' => VacationPeriodResource::collection(
                $this->vacationPeriodService->list($request->user(), $userId ? (int) $userId : null),
            ),
        ]);
    }

    public function store(StoreVacationPeriodRequest $request): JsonResponse
    {
        $period = $this->vacationPeriodService->create($request->validated());

        return response()->json([
            'data' => new VacationPeriodResource($period),
            'message' => 'Período aquisitivo criado com sucesso.',
        ], 201);
    }

    public function close(CloseVacationPeriodRequest $request, VacationPeriod $vacationPeriod): JsonResponse
    {
        $period = $this->vacationPeriodService->close($vacationPeriod, $request->validated());

        return response()->json([
            'data' => new VacationPeriodResource($period),
            'message' => 'Período aquisitivo encerrado com sucesso.',
        ]);
    }
}

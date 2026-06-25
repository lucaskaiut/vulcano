<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Vacation\Domain\Services\VacationRequestService;
use App\Modules\Vacation\Http\Requests\StoreVacationRequestRequest;
use App\Modules\Vacation\Http\Resources\VacationRequestResource;
use Illuminate\Http\JsonResponse;

class VacationRequestController extends Controller
{
    public function __construct(
        private readonly VacationRequestService $vacationRequestService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => VacationRequestResource::collection(
                $this->vacationRequestService->list(request()->user()),
            ),
        ]);
    }

    public function store(StoreVacationRequestRequest $request): JsonResponse
    {
        $vacationRequest = $this->vacationRequestService->create(
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'data' => new VacationRequestResource($vacationRequest),
            'message' => 'Solicitação de férias criada com sucesso.',
        ], 201);
    }

    public function cancel(VacationRequest $vacationRequest): JsonResponse
    {
        $vacationRequest = $this->vacationRequestService->cancel(
            $vacationRequest,
            request()->user(),
        );

        return response()->json([
            'data' => new VacationRequestResource($vacationRequest),
            'message' => 'Solicitação de férias cancelada.',
        ]);
    }
}

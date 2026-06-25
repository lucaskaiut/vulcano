<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Vacation\Domain\Services\VacationRequestService;
use App\Modules\Vacation\Http\Requests\StoreVacationRequestRequest;
use App\Modules\Vacation\Http\Resources\VacationRequestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VacationRequestController extends Controller
{
    public function __construct(private readonly VacationRequestService $vacationRequestService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->query('user_id') ? (int) $request->query('user_id') : null;

        return VacationRequestResource::collection(
            $this->vacationRequestService->list($userId),
        );
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

    public function show(VacationRequest $vacationRequest): JsonResponse
    {
        return response()->json([
            'data' => new VacationRequestResource(
                $this->vacationRequestService->find($vacationRequest->id),
            ),
        ]);
    }

    public function cancel(VacationRequest $vacationRequest): JsonResponse
    {
        $result = $this->vacationRequestService->cancel(
            $vacationRequest,
            request()->user(),
        );

        return response()->json([
            'data' => new VacationRequestResource($result),
            'message' => 'Solicitação de férias cancelada.',
        ]);
    }
}

<?php

namespace App\Modules\Commission\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Commission\Domain\Services\CommissionService;
use App\Modules\Commission\Http\Requests\StoreSaleRequest;
use App\Modules\Commission\Http\Resources\SaleResource;
use Illuminate\Http\JsonResponse;

class CommissionController extends Controller
{
    public function __construct(private readonly CommissionService $commissionService) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => SaleResource::collection(
                $this->commissionService->list(request()->user()),
            ),
        ]);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->commissionService->create($request->user(), $request->validated());

        return response()->json([
            'data' => new SaleResource($sale),
            'message' => 'Venda registrada e comissão gerada com sucesso.',
        ], 201);
    }

    public function pay(Commission $commission): JsonResponse
    {
        $commission = $this->commissionService->markAsPaid($commission, request()->user());

        return response()->json([
            'data' => ['id' => $commission->id, 'status' => $commission->status->value],
            'message' => 'Comissão marcada como paga.',
        ]);
    }
}

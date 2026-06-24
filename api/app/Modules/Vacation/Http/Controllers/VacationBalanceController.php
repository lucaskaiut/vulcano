<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Support\PaginationMeta;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Services\VacationBalanceService;
use App\Modules\Vacation\Http\Requests\StoreVacationBalanceRequest;
use App\Modules\Vacation\Http\Requests\UpdateVacationBalanceRequest;
use App\Modules\Vacation\Http\Resources\VacationBalanceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VacationBalanceController extends Controller
{
    public function __construct(private readonly VacationBalanceService $vacationBalanceService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, VacationBalanceService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $userId = $request->query('user_id');
        $balances = $this->vacationBalanceService->paginate(
            $sort,
            $pagination,
            $userId ? (int) $userId : null,
        );

        return response()->json([
            'data' => VacationBalanceResource::collection($balances->items()),
            'meta' => PaginationMeta::build($balances, $sort),
        ]);
    }

    public function store(StoreVacationBalanceRequest $request): JsonResponse
    {
        $balance = $this->vacationBalanceService->createInitial($request->validated());

        return response()->json([
            'data' => new VacationBalanceResource($balance),
            'message' => 'Saldo de férias criado com sucesso.',
        ], 201);
    }

    public function show(VacationBalance $vacationBalance): JsonResponse
    {
        return response()->json([
            'data' => new VacationBalanceResource(
                $this->vacationBalanceService->find($vacationBalance->id),
            ),
        ]);
    }

    public function update(UpdateVacationBalanceRequest $request, VacationBalance $vacationBalance): JsonResponse
    {
        $balance = $this->vacationBalanceService->update($vacationBalance, $request->validated());

        return response()->json([
            'data' => new VacationBalanceResource($balance),
            'message' => 'Saldo de férias atualizado com sucesso.',
        ]);
    }
}

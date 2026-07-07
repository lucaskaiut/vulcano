<?php

namespace App\Modules\Invoice\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\Invoice\Domain\Services\InvoiceService;
use App\Modules\Invoice\Http\Requests\StoreInvoiceRequest;
use App\Modules\Invoice\Http\Resources\InvoiceResource;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService) {}

    public function indexAll(Request $request): JsonResponse
    {
        return response()->json([
            'data' => InvoiceResource::collection($this->invoiceService->listAllForUser($request->user())),
        ]);
    }

    public function indexByUser(Request $request, User $user): JsonResponse
    {
        $this->ensureCanAccessUser($request->user(), $user, PermissionEnum::InvoicesViewAll->value);

        return response()->json([
            'data' => InvoiceResource::collection($this->invoiceService->listByUser($user->id)),
        ]);
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $user = $request->user();

        $invoice = $this->invoiceService->store($user, $request->file('file'), $request->validated());

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Nota fiscal enviada com sucesso.',
        ], 201);
    }

    public function download(Invoice $invoice): BinaryFileResponse
    {
        return response()->download(
            $this->invoiceService->getDownloadPath($invoice),
            $invoice->original_name,
        );
    }

    private function ensureCanAccessUser(User $authUser, User $targetUser, string $viewAllPermission): void
    {
        if ($authUser->id === $targetUser->id) {
            return;
        }

        if ($authUser->hasPermission($viewAllPermission)) {
            return;
        }

        $isSubordinate = User::query()
            ->where('id', $targetUser->id)
            ->where('manager_id', $authUser->id)
            ->exists();

        abort_unless($isSubordinate, 403, 'Acesso negado.');
    }
}

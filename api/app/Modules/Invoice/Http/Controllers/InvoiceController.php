<?php

namespace App\Modules\Invoice\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\Invoice\Domain\Services\InvoiceService;
use App\Modules\Invoice\Http\Requests\StoreInvoiceRequest;
use App\Modules\Invoice\Http\Resources\InvoiceResource;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService) {}

    public function indexAll(): JsonResponse
    {
        return response()->json([
            'data' => InvoiceResource::collection($this->invoiceService->listAllForUser(request()->user())),
        ]);
    }

    /** @param  \App\Modules\User\Domain\Models\User  $user */
    public function indexByUser($user): JsonResponse
    {
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
}

<?php

namespace App\Modules\Document\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Document\Domain\Models\Document;
use App\Modules\Document\Domain\Models\DocumentType;
use App\Modules\Document\Domain\Services\DocumentService;
use App\Modules\Document\Http\Requests\StoreDocumentRequest;
use App\Modules\Document\Http\Requests\StoreDocumentTypeRequest;
use App\Modules\Document\Http\Requests\UpdateDocumentTypeRequest;
use App\Modules\Document\Http\Resources\DocumentResource;
use App\Modules\Document\Http\Resources\DocumentTypeResource;
use App\Modules\User\Domain\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function __construct(private readonly DocumentService $documentService) {}

    public function listTypes(): JsonResponse
    {
        return response()->json([
            'data' => DocumentTypeResource::collection($this->documentService->listTypes()),
        ]);
    }

    public function storeType(StoreDocumentTypeRequest $request): JsonResponse
    {
        $type = $this->documentService->createType($request->validated());

        return response()->json([
            'data' => new DocumentTypeResource($type),
            'message' => 'Tipo de documento criado com sucesso.',
        ], 201);
    }

    public function updateType(UpdateDocumentTypeRequest $request, DocumentType $documentType): JsonResponse
    {
        $type = $this->documentService->updateType($documentType, $request->validated());

        return response()->json([
            'data' => new DocumentTypeResource($type),
            'message' => 'Tipo de documento atualizado com sucesso.',
        ]);
    }

    public function destroyType(DocumentType $documentType): JsonResponse
    {
        $this->documentService->deleteType($documentType);

        return response()->json(['message' => 'Tipo de documento removido com sucesso.']);
    }

    public function index(Request $request, User $user): JsonResponse
    {
        $this->ensureCanAccessUser($request->user(), $user, PermissionEnum::DocumentsViewAll->value);

        return response()->json([
            'data' => DocumentResource::collection($this->documentService->listByUser($user->id)),
        ]);
    }

    public function indexAll(Request $request): JsonResponse
    {
        return response()->json([
            'data' => DocumentResource::collection($this->documentService->listAll($request->user())),
        ]);
    }

    public function store(StoreDocumentRequest $request, User $user): JsonResponse
    {
        $this->ensureCanAccessUser($request->user(), $user, PermissionEnum::DocumentsViewAll->value);

        $document = $this->documentService->store($user->id, $request->file('file'), $request->validated());

        return response()->json([
            'data' => new DocumentResource($document),
            'message' => 'Documento enviado com sucesso.',
        ], 201);
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->documentService->delete($document);

        return response()->json(['message' => 'Documento removido com sucesso.']);
    }

    public function download(Document $document): BinaryFileResponse
    {
        return response()->download(
            $this->documentService->getDownloadPath($document),
            $this->documentService->getDownloadName($document),
        );
    }

    public function preview(Document $document): BinaryFileResponse
    {
        return response()->file(
            $this->documentService->getDownloadPath($document),
            ['Content-Type' => $document->mime_type ?? 'application/octet-stream'],
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

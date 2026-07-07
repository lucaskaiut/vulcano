<?php

namespace App\Modules\Document\Domain\Services;

use App\Modules\Document\Domain\Models\Document;
use App\Modules\Document\Domain\Models\DocumentType;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    /** @return Collection<int, DocumentType> */
    public function listTypes(): Collection
    {
        return DocumentType::query()->orderBy('name')->get();
    }

    /** @param  array{name: string, expiration_required?: bool}  $data */
    public function createType(array $data): DocumentType
    {
        return DocumentType::query()->create([
            'name' => $data['name'],
            'expiration_required' => $data['expiration_required'] ?? false,
        ]);
    }

    /** @param  array{name?: string, expiration_required?: bool}  $data */
    public function updateType(DocumentType $type, array $data): DocumentType
    {
        $type->update(array_intersect_key($data, array_flip(['name', 'expiration_required'])));

        return $type->fresh();
    }

    public function deleteType(DocumentType $type): void
    {
        $type->delete();
    }

    /** @return Collection<int, Document> */
    public function listByUser(int $userId): Collection
    {
        return Document::query()
            ->with('documentType')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @return Collection<int, Document> */
    public function listAll(User $user): Collection
    {
        $query = Document::query()
            ->with(['documentType', 'user'])
            ->orderBy('created_at', 'desc');

        if (! $user->hasPermission(PermissionEnum::DocumentsViewAll->value)) {
            $subordinateIds = User::query()->where('manager_id', $user->id)->pluck('id');
            $ids = $subordinateIds->push($user->id)->unique();
            $query->whereIn('user_id', $ids);
        }

        return $query->get();
    }

    /** @param  array{document_type_id: int, expiration_date?: string|null}  $data */
    public function store(int $userId, UploadedFile $file, array $data): Document
    {
        $storedName = $file->store('documents', 'local');

        return Document::query()->create([
            'user_id' => $userId,
            'document_type_id' => $data['document_type_id'],
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => $storedName,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'expiration_date' => $data['expiration_date'] ?? null,
        ])->load('documentType');
    }

    public function delete(Document $document): void
    {
        Storage::disk('local')->delete($document->stored_name);
        $document->delete();
    }

    public function getDownloadPath(Document $document): string
    {
        return Storage::disk('local')->path($document->stored_name);
    }

    public function getDownloadName(Document $document): string
    {
        return $document->original_name;
    }
}

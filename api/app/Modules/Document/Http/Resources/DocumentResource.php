<?php

namespace App\Modules\Document\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Document\Domain\Models\Document */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'expiration_date' => $this->expiration_date?->format('Y-m-d'),
            'document_type' => $this->whenLoaded('documentType', fn () => [
                'id' => $this->documentType->id,
                'name' => $this->documentType->name,
                'expiration_required' => $this->documentType->expiration_required,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

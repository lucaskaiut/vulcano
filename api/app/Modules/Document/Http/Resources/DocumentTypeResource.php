<?php

namespace App\Modules\Document\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Document\Domain\Models\DocumentType */
class DocumentTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expiration_required' => $this->expiration_required,
        ];
    }
}

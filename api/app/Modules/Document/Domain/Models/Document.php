<?php

namespace App\Modules\Document\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'document_type_id', 'original_name', 'stored_name', 'mime_type', 'size', 'expiration_date'])]
class Document extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    protected function casts(): array
    {
        return [
            'expiration_date' => 'date',
            'size' => 'integer',
        ];
    }
}

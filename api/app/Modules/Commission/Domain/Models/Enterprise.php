<?php

namespace App\Modules\Commission\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Enterprise extends Model
{
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}

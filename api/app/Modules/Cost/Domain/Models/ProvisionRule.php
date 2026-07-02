<?php

namespace App\Modules\Cost\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'percentage', 'active'])]
class ProvisionRule extends Model
{
    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:4',
            'active' => 'boolean',
        ];
    }
}

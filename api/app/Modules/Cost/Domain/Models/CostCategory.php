<?php

namespace App\Modules\Cost\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\Audit\Domain\Traits\Auditable;

#[Fillable(['name', 'type', 'active'])]
class CostCategory extends Model
{
    use Auditable;
    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function costs(): HasMany
    {
        return $this->hasMany(CollaboratorCost::class, 'cost_category_id');
    }
}

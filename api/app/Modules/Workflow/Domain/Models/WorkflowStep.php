<?php

namespace App\Modules\Workflow\Domain\Models;

use Database\Factories\WorkflowStepFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'workflow_type',
    'name',
    'order',
    'visibility_rules',
    'approval_rules',
])]
class WorkflowStep extends Model
{
    /** @use HasFactory<WorkflowStepFactory> */
    use HasFactory;

    /**
     * Decodifica JSON de regras, tolerando valores legado double-encoded
     * (quando o seeder usava json_encode() com cast array).
     *
     * @return array<int, array{type: string, id?: int}>|null
     */
    public static function normalizeRules(mixed $value): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return array_values($value);
        }

        if (! is_string($value)) {
            return null;
        }

        $decoded = json_decode($value, true);

        // Double-encoded: JSON string wrapping another JSON array
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }

        return is_array($decoded) ? array_values($decoded) : null;
    }

    protected function visibilityRules(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value): ?array => self::normalizeRules($value),
            set: fn (mixed $value): ?string => self::encodeRules($value),
        );
    }

    protected function approvalRules(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value): ?array => self::normalizeRules($value),
            set: fn (mixed $value): ?string => self::encodeRules($value),
        );
    }

    private static function encodeRules(mixed $value): ?string
    {
        $normalized = self::normalizeRules($value);

        return $normalized === null ? null : json_encode($normalized);
    }

    protected static function newFactory(): WorkflowStepFactory
    {
        return WorkflowStepFactory::new();
    }
}

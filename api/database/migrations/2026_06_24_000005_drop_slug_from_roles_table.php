<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('roles', 'slug')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            });
        }

        if (! $this->hasUniqueIndexOnName()) {
            Schema::table('roles', function (Blueprint $table) {
                $table->unique('name');
            });
        }
    }

    public function down(): void
    {
        if ($this->hasUniqueIndexOnName()) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropUnique(['name']);
            });
        }

        if (! Schema::hasColumn('roles', 'slug')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name');
            });
        }
    }

    private function hasUniqueIndexOnName(): bool
    {
        return collect(Schema::getIndexes('roles'))
            ->contains(fn (array $index) => $index['unique'] && $index['columns'] === ['name']);
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'development_name')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->dropColumn('development_name');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('sales', 'development_name')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('development_name')->after('user_id');
            });
        }
    }
};

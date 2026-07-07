<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vacation_grants', function (Blueprint $table) {
            $table->string('reason')->nullable()->after('days_used');
        });
    }

    public function down(): void
    {
        Schema::table('vacation_grants', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }
};

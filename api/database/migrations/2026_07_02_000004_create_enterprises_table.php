<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enterprises', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('enterprise_id')->nullable()->after('user_id')->constrained('enterprises')->nullOnDelete();
            $table->dropColumn('development_name');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('development_name')->after('user_id');
            $table->dropForeign(['enterprise_id']);
            $table->dropColumn('enterprise_id');
        });

        Schema::dropIfExists('enterprises');
    }
};

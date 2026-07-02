<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provision_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('percentage', 8, 4)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        DB::table('provision_rules')->insert([
            ['name' => 'Provisão 13º', 'percentage' => 8.3333, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Provisão Férias', 'percentage' => 8.3333, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Provisão 1/3 Férias', 'percentage' => 2.7778, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('provision_rules');
    }
};

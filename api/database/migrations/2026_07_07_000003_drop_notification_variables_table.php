<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('notification_variables');
    }

    public function down(): void
    {
        // Re-created by the original migration if needed
        Schema::create('notification_variables', function ($table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->string('source');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }
};

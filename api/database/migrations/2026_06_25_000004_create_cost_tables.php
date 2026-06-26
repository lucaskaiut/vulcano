<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cost_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type'); // fixed, provisioned, benefit, commission
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('collaborator_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cost_category_id')->constrained('cost_categories')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->boolean('recurring')->default(true);
            $table->string('reference_month')->nullable(); // YYYY-MM for non-recurring costs
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaborator_costs');
        Schema::dropIfExists('cost_categories');
    }
};

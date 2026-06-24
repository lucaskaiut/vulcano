<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('previous_salary', 12, 2)->nullable();
            $table->decimal('new_salary', 12, 2);
            $table->date('effective_date');
            $table->text('notes')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'effective_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_histories');
    }
};

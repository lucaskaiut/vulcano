<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('development_name');
            $table->string('unit');
            $table->date('sale_date');
            $table->decimal('sale_amount', 12, 2);
            $table->decimal('percentage', 5, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('percentage', 5, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->string('status');
            $table->foreignId('workflow_instance_id')->nullable()->constrained('workflow_instances')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
        Schema::dropIfExists('sales');
    }
};

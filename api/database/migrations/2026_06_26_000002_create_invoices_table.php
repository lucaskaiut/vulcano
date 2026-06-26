<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('competence'); // YYYY-MM
            $table->string('invoice_number');
            $table->decimal('amount', 12, 2);
            $table->date('issue_date');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('original_name');
            $table->string('stored_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->foreignId('workflow_instance_id')->nullable()->constrained('workflow_instances')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};

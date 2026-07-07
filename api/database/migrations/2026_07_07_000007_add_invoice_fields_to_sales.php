<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->after('notes');
            $table->string('invoice_file_name')->nullable()->after('invoice_number');
            $table->string('invoice_file_path')->nullable()->after('invoice_file_name');
            $table->string('invoice_file_mime')->nullable()->after('invoice_file_path');
            $table->unsignedBigInteger('invoice_file_size')->nullable()->after('invoice_file_mime');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['invoice_number', 'invoice_file_name', 'invoice_file_path', 'invoice_file_mime', 'invoice_file_size']);
        });
    }
};

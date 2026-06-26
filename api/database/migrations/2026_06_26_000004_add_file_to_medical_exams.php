<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medical_exams', function (Blueprint $table) {
            $table->string('original_name')->nullable()->after('notes');
            $table->string('stored_name')->nullable()->after('original_name');
            $table->string('mime_type')->nullable()->after('stored_name');
            $table->unsignedBigInteger('size')->nullable()->after('mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('medical_exams', function (Blueprint $table) {
            $table->dropColumn(['original_name', 'stored_name', 'mime_type', 'size']);
        });
    }
};

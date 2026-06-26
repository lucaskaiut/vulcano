<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_channels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // email, sms, push
            $table->string('label');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('notification_channel_id')->constrained('notification_channels');
            $table->string('type'); // workflow_approved, workflow_rejected, invoice_submitted, exam_expiring, document_expiring
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable(); // contexto extra
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // Seed the email channel
        \Illuminate\Support\Facades\DB::table('notification_channels')->insert([
            'name' => 'email',
            'label' => 'E-mail',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notification_channels');
    }
};

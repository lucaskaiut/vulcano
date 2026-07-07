<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new event column
        Schema::table('notification_rules', function (Blueprint $table) {
            $table->string('event')->nullable()->after('description');
        });

        // Migrate existing data: event_id → event name
        DB::statement('
            UPDATE notification_rules r
            INNER JOIN notification_events e ON e.id = r.event_id
            SET r.event = e.name
        ');

        // Drop FK and old column
        Schema::table('notification_rules', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn('event_id');
            $table->string('event')->nullable(false)->change();
        });

        // Drop events table
        Schema::dropIfExists('notification_events');
    }

    public function down(): void
    {
        Schema::create('notification_events', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->json('available_variables')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('notification_rules', function (Blueprint $table) {
            $table->unsignedBigInteger('event_id')->nullable()->after('description');
        });

        // Can't reliably reverse the data migration

        Schema::table('notification_rules', function (Blueprint $table) {
            $table->dropColumn('event');
        });
    }
};

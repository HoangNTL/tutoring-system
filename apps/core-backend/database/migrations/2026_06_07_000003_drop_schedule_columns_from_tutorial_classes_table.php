<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->dropColumn([
                'room_id',
                'room_code',
                'room_name',
                'room_capacity',
                'day_of_week',
                'start_period',
                'end_period',
                'scheduled_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->unsignedBigInteger('room_id')->nullable()->after('lecturer_name');
            $table->string('room_code', 100)->nullable()->after('room_id');
            $table->string('room_name')->nullable()->after('room_code');
            $table->unsignedInteger('room_capacity')->nullable()->after('room_name');
            $table->unsignedTinyInteger('day_of_week')->nullable()->after('room_capacity');
            $table->unsignedTinyInteger('start_period')->nullable()->after('day_of_week');
            $table->unsignedTinyInteger('end_period')->nullable()->after('start_period');
            $table->timestamp('scheduled_at')->nullable()->after('assigned_at');
        });
    }
};

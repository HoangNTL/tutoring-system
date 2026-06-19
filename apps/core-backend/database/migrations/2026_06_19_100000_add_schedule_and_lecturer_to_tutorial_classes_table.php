<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->unsignedBigInteger('lecturer_id')->nullable()->after('created_by');
            $table->string('lecturer_name')->nullable()->after('lecturer_id');
            $table->unsignedTinyInteger('day_of_week')->nullable()->after('lecturer_name');
            $table->unsignedTinyInteger('start_period')->nullable()->after('day_of_week');
            $table->string('room', 50)->nullable()->after('start_period');
        });
    }

    public function down(): void
    {
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->dropColumn(['lecturer_id', 'lecturer_name', 'day_of_week', 'start_period', 'room']);
        });
    }
};

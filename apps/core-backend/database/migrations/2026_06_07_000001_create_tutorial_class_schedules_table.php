<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutorial_class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_class_id')->constrained('tutorial_classes')->cascadeOnDelete();
            $table->unsignedBigInteger('room_id');
            $table->string('room_code', 100)->nullable();
            $table->string('room_name')->nullable();
            $table->unsignedInteger('room_capacity')->nullable();
            $table->unsignedTinyInteger('day_of_week');
            $table->unsignedTinyInteger('start_period');
            $table->unsignedTinyInteger('end_period');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutorial_class_schedules');
    }
};

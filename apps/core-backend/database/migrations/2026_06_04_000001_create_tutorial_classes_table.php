<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutorial_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_period_id')->constrained('tutorial_periods')->cascadeOnDelete();
            $table->string('course_code', 100);
            $table->string('course_name');
            $table->unsignedInteger('credits')->default(0);
            $table->unsignedInteger('total_sessions');
            $table->unsignedInteger('periods_per_session');
            $table->unsignedInteger('total_periods');
            $table->unsignedBigInteger('lecturer_id')->nullable();
            $table->string('lecturer_code', 100)->nullable();
            $table->string('lecturer_name')->nullable();
            $table->string('status', 20);
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(
                ['tutorial_period_id', 'course_code'],
                'tutorial_classes_period_course_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutorial_classes');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tutorial_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_period_id')->constrained('tutorial_periods')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('course_code', 100);
            $table->string('course_name');
            $table->unsignedInteger('credits')->default(0);
            $table->string('status', 20);
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['tutorial_period_id', 'user_id', 'course_code'],
                'tutorial_registrations_period_user_course_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutorial_registrations');
    }
};

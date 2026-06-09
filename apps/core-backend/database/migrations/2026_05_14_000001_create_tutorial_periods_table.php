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
        Schema::create('tutorial_periods', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('academic_period_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('registration_start_at');
            $table->dateTime('registration_end_at');
            $table->dateTime('study_start_at');
            $table->dateTime('study_end_at');
            $table->unsignedTinyInteger('status')->default(0);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('academic_period_id');
            $table->index('status');
            $table->index(['registration_start_at', 'registration_end_at']);
            $table->index(['study_start_at', 'study_end_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutorial_periods');
    }
};

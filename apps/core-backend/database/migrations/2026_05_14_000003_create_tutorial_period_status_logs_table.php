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
        Schema::create('tutorial_period_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_period_id')->constrained('tutorial_periods')->cascadeOnDelete();
            $table->unsignedTinyInteger('old_status');
            $table->unsignedTinyInteger('new_status');
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('tutorial_period_id');
            $table->index(['tutorial_period_id', 'created_at']);
            $table->index(['old_status', 'new_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutorial_period_status_logs');
    }
};

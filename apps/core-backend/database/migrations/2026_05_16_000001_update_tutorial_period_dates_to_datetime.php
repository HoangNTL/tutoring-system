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
        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->dateTime('start_reg_date')->change();
            $table->dateTime('end_reg_date')->change();
            $table->dateTime('start_study_date')->change();
            $table->dateTime('end_study_date')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->date('start_reg_date')->change();
            $table->date('end_reg_date')->change();
            $table->date('start_study_date')->change();
            $table->date('end_study_date')->change();
        });
    }
};

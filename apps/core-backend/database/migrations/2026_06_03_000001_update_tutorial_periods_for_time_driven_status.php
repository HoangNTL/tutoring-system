<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->dropIndex(['start_reg_date', 'end_reg_date']);
            $table->dropIndex(['start_study_date', 'end_study_date']);
        });

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->renameColumn('start_reg_date', 'registration_start_at');
            $table->renameColumn('end_reg_date', 'registration_end_at');
            $table->renameColumn('start_study_date', 'study_start_at');
            $table->renameColumn('end_study_date', 'study_end_at');
        });

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->unsignedBigInteger('academic_period_id')->nullable()->after('id');
            $table->text('description')->nullable()->change();
            $table->dropColumn(['opened_at', 'assigned_at', 'started_at', 'closed_at']);
        });

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->index('academic_period_id');
            $table->index(['registration_start_at', 'registration_end_at']);
            $table->index(['study_start_at', 'study_end_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->dropIndex(['academic_period_id']);
            $table->dropIndex(['registration_start_at', 'registration_end_at']);
            $table->dropIndex(['study_start_at', 'study_end_at']);
        });

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->renameColumn('registration_start_at', 'start_reg_date');
            $table->renameColumn('registration_end_at', 'end_reg_date');
            $table->renameColumn('study_start_at', 'start_study_date');
            $table->renameColumn('study_end_at', 'end_study_date');
        });

        DB::table('tutorial_periods')
            ->whereNull('description')
            ->update(['description' => '']);

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('description')->nullable(false)->change();
            $table->dropColumn('academic_period_id');
        });

        Schema::table('tutorial_periods', function (Blueprint $table): void {
            $table->index(['start_reg_date', 'end_reg_date']);
            $table->index(['start_study_date', 'end_study_date']);
        });
    }
};

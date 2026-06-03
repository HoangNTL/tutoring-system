<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        DB::table('tutorial_periods')
            ->where('status', 2)
            ->update(['status' => 5]);

        DB::table('tutorial_periods')
            ->where('status', 1)
            ->whereNotNull('study_end_at')
            ->where('study_end_at', '<', $now)
            ->update(['status' => 4]);

        DB::table('tutorial_periods')
            ->where('status', 1)
            ->whereNotNull('study_start_at')
            ->where('study_start_at', '<=', $now)
            ->update(['status' => 3]);

        DB::table('tutorial_periods')
            ->where('status', 1)
            ->whereNotNull('registration_end_at')
            ->where('registration_end_at', '<', $now)
            ->update(['status' => 2]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tutorial_periods')
            ->whereIn('status', [1, 2, 3, 4])
            ->update(['status' => 1]);

        DB::table('tutorial_periods')
            ->where('status', 5)
            ->update(['status' => 2]);
    }
};

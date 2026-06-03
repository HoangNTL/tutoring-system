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
        DB::table('tutorial_periods')
            ->whereIn('status', [1, 2, 3, 4])
            ->update(['status' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Legacy workflow statuses are intentionally collapsed into ACTIVE.
    }
};

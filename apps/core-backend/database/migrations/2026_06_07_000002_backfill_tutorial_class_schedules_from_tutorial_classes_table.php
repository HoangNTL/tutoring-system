<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tutorial_classes')
            ->select([
                'id',
                'room_id',
                'room_code',
                'room_name',
                'room_capacity',
                'day_of_week',
                'start_period',
                'end_period',
                'scheduled_at',
                'created_at',
                'updated_at',
            ])
            ->whereNotNull('room_id')
            ->whereNotNull('day_of_week')
            ->whereNotNull('start_period')
            ->whereNotNull('end_period')
            ->orderBy('id')
            ->chunk(100, function ($classes): void {
                $rows = [];

                foreach ($classes as $tutorialClass) {
                    $timestamp = $tutorialClass->scheduled_at
                        ?? $tutorialClass->updated_at
                        ?? $tutorialClass->created_at
                        ?? now();

                    $rows[] = [
                        'tutorial_class_id' => $tutorialClass->id,
                        'room_id' => $tutorialClass->room_id,
                        'room_code' => $tutorialClass->room_code,
                        'room_name' => $tutorialClass->room_name,
                        'room_capacity' => $tutorialClass->room_capacity,
                        'day_of_week' => $tutorialClass->day_of_week,
                        'start_period' => $tutorialClass->start_period,
                        'end_period' => $tutorialClass->end_period,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }

                if ($rows !== []) {
                    DB::table('tutorial_class_schedules')->insert($rows);
                }
            });
    }

    public function down(): void
    {
        // Backfilled rows cannot be distinguished safely from rows created later.
    }
};

<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tutorial_class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_class_id')->constrained('tutorial_classes')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->unsignedTinyInteger('start_period');
            $table->string('room');
            $table->timestamps();
        });

        // Migrate existing schedule data
        $existingClasses = DB::table('tutorial_classes')
            ->whereNotNull('day_of_week')
            ->whereNotNull('start_period')
            ->whereNotNull('room')
            ->get();

        foreach ($existingClasses as $class) {
            DB::table('tutorial_class_schedules')->insert([
                'tutorial_class_id' => $class->id,
                'day_of_week' => $class->day_of_week,
                'start_period' => $class->start_period,
                'room' => $class->room,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Drop columns from tutorial_classes
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->dropColumn(['day_of_week', 'start_period', 'room']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add the columns back to tutorial_classes
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->unsignedTinyInteger('day_of_week')->nullable()->after('lecturer_name');
            $table->unsignedTinyInteger('start_period')->nullable()->after('day_of_week');
            $table->string('room')->nullable()->after('start_period');
        });

        // Restore first schedule from schedules back to classes
        $existingSchedules = DB::table('tutorial_class_schedules')
            ->orderBy('id')
            ->get()
            ->groupBy('tutorial_class_id');

        foreach ($existingSchedules as $classId => $schedules) {
            $firstSchedule = $schedules->first();
            DB::table('tutorial_classes')
                ->where('id', $classId)
                ->update([
                    'day_of_week' => $firstSchedule->day_of_week,
                    'start_period' => $firstSchedule->start_period,
                    'room' => $firstSchedule->room,
                ]);
        }

        // Drop schedules table
        Schema::dropIfExists('tutorial_class_schedules');
    }
};

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
        Schema::table('tutorial_registrations', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('user_id');
            $table->index('department_id');
        });

        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('course_code');
            $table->index('department_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorial_classes', function (Blueprint $table) {
            $table->dropIndex(['department_id']);
            $table->dropColumn('department_id');
        });

        Schema::table('tutorial_registrations', function (Blueprint $table) {
            $table->dropIndex(['department_id']);
            $table->dropColumn('department_id');
        });
    }
};

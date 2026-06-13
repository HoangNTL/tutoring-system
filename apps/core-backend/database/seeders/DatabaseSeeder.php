<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Enums\UserRole;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::updateOrCreate(
            [
                'username' => 'admin'
            ],
            [
                'password_hash' => '123456',
                'role' => UserRole::ADMIN,
            ]
        );

        User::updateOrCreate(
            [
                'username' => 'superadmin'
            ],
            [
                'password_hash' => '123456',
                'role' => UserRole::ADMIN,
            ]
        );

        User::updateOrCreate(
            [
                'username' => 'department_demo'
            ],
            [
                'password_hash' => '123456',
                'role' => UserRole::DEPARTMENT,
                'department_id' => 1,
            ]
        );

        User::updateOrCreate(
            [
                'username' => 'lecturer_demo'
            ],
            [
                'password_hash' => '123456',
                'role' => UserRole::LECTURER,
                'lecturer_id' => 1,
            ]
        );

        User::updateOrCreate(
            [
                'username' => 'student_demo'
            ],
            [
                'password_hash' => '123456',
                'role' => UserRole::STUDENT,
                'student_id' => 1,
            ]
        );
    }
}

<?php

namespace Tests\Feature\Users;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserPasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_password_for_lecturer_student_and_department(): void
    {
        $admin = User::create([
            'username' => 'admin_user',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $lecturer = User::create([
            'username' => 'lecturer_user',
            'password_hash' => 'oldpassword',
            'role' => UserRole::LECTURER,
        ]);

        $student = User::create([
            'username' => 'student_user',
            'password_hash' => 'oldpassword',
            'role' => UserRole::STUDENT,
        ]);

        $department = User::create([
            'username' => 'department_user',
            'password_hash' => 'oldpassword',
            'role' => UserRole::DEPARTMENT,
        ]);

        // Lecturer
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/users/{$lecturer->id}/password", [
                'password' => 'newpassword123',
            ])
            ->assertOk();
        $this->assertTrue(Hash::check('newpassword123', $lecturer->refresh()->password_hash));

        // Student
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/users/{$student->id}/password", [
                'password' => 'newpassword123',
            ])
            ->assertOk();
        $this->assertTrue(Hash::check('newpassword123', $student->refresh()->password_hash));

        // Department
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/users/{$department->id}/password", [
                'password' => 'newpassword123',
            ])
            ->assertOk();
        $this->assertTrue(Hash::check('newpassword123', $department->refresh()->password_hash));
    }

    public function test_admin_cannot_update_another_admin_password(): void
    {
        $admin1 = User::create([
            'username' => 'admin_user_1',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $admin2 = User::create([
            'username' => 'admin_user_2',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $this->actingAs($admin1, 'web')
            ->patchJson("/api/v1/users/{$admin2->id}/password", [
                'password' => 'newpassword123',
            ])
            ->assertForbidden();

        // Check password has not changed
        $this->assertTrue(Hash::check('password123', $admin2->refresh()->password_hash));
    }

    public function test_non_admin_cannot_update_passwords(): void
    {
        $lecturer = User::create([
            'username' => 'lecturer_user',
            'password_hash' => 'password123',
            'role' => UserRole::LECTURER,
        ]);

        $student = User::create([
            'username' => 'student_user',
            'password_hash' => 'password123',
            'role' => UserRole::STUDENT,
        ]);

        $this->actingAs($lecturer, 'web')
            ->patchJson("/api/v1/users/{$student->id}/password", [
                'password' => 'newpassword123',
            ])
            ->assertForbidden();
    }

    public function test_password_validation(): void
    {
        $admin = User::create([
            'username' => 'admin_user',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $student = User::create([
            'username' => 'student_user',
            'password_hash' => 'password123',
            'role' => UserRole::STUDENT,
        ]);

        // Less than 6 characters
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/users/{$student->id}/password", [
                'password' => '12345',
            ])
            ->assertUnprocessable();
    }
}

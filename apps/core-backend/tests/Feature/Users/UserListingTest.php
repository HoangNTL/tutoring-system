<?php

namespace Tests\Feature\Users;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_users_cannot_access_user_listing(): void
    {
        $this->getJson('/api/v1/users')->assertUnauthorized();
    }

    public function test_non_admin_users_are_forbidden_from_user_listing(): void
    {
        $student = User::create([
            'username' => 'student_user',
            'password_hash' => 'password123',
            'role' => UserRole::STUDENT,
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson('/api/v1/users')
            ->assertForbidden();
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();
        $department = User::create([
            'username' => 'department_user',
            'password_hash' => 'password123',
            'role' => UserRole::DEPARTMENT,
            'department_id' => 15,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/users');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Users retrieved successfully')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonFragment([
                'id' => $department->id,
                'username' => 'department_user',
                'role' => UserRole::DEPARTMENT->name,
                'studentId' => null,
                'lecturerId' => null,
                'departmentId' => 15,
            ]);
    }

    public function test_admin_can_search_users_by_username(): void
    {
        $admin = $this->createAdmin();

        User::create([
            'username' => 'student_alpha',
            'password_hash' => 'password123',
            'role' => UserRole::STUDENT,
        ]);

        $matchingUser = User::create([
            'username' => 'lecturer_beta',
            'password_hash' => 'password123',
            'role' => UserRole::LECTURER,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/users?search=beta');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchingUser->id)
            ->assertJsonPath('data.0.username', 'lecturer_beta');
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = $this->createAdmin();

        User::create([
            'username' => 'department_filter',
            'password_hash' => 'password123',
            'role' => UserRole::DEPARTMENT,
        ]);

        $lecturer = User::create([
            'username' => 'lecturer_filter',
            'password_hash' => 'password123',
            'role' => UserRole::LECTURER,
            'lecturer_id' => 22,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/users?role=LECTURER');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lecturer->id)
            ->assertJsonPath('data.0.role', UserRole::LECTURER->name);
    }

    public function test_response_does_not_expose_password_hash_or_email(): void
    {
        $admin = $this->createAdmin();

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/users');

        $response->assertOk();

        foreach ($response->json('data') as $item) {
            $this->assertArrayNotHasKey('password_hash', $item);
            $this->assertArrayNotHasKey('passwordHash', $item);
            $this->assertArrayNotHasKey('email', $item);
        }
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin_user',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);
    }
}

<?php

namespace Tests\Feature\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TutorialPeriodAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 1001, 'name' => 'Legacy Period 1001'],
                    ['id' => 20261, 'name' => 'Legacy Period 20261'],
                ],
            ], 200),
        ]);
    }

    public function test_tutorial_period_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/tutorial-periods')->assertUnauthorized();
    }

    public function test_non_admin_users_are_forbidden_from_listing_tutorial_periods(): void
    {
        $student = User::create([
            'username' => 'student1',
            'password_hash' => 'password123',
            'role' => UserRole::STUDENT,
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson('/api/v1/tutorial-periods')
            ->assertForbidden();
    }

    public function test_admin_can_list_tutorial_periods(): void
    {
        $admin = User::create([
            'username' => 'admin1',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        TutorialPeriod::create([
            'academic_period_id' => 1001,
            'title' => 'Spring Support',
            'description' => 'Support classes',
            'registration_start_at' => '2026-05-01 08:00:00',
            'registration_end_at' => '2026-05-05 17:00:00',
            'study_start_at' => '2026-05-10 08:00:00',
            'study_end_at' => '2026-06-10 17:00:00',
            'status' => TutorialPeriodStatus::DRAFT,
            'created_by' => $admin->id,
        ]);

        $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/tutorial-periods')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }
}

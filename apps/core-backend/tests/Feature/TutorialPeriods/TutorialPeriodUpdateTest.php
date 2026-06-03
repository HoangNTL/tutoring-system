<?php

namespace Tests\Feature\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TutorialPeriodUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 296, 'name' => 'Legacy Period 296'],
                    ['id' => 20261, 'name' => 'Legacy Period 20261'],
                ],
            ], 200),
        ]);
    }

    public function test_updating_draft_tutorial_period_does_not_try_to_persist_academic_period_payload(): void
    {
        $admin = User::create([
            'username' => 'admin_update',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $tutorialPeriod = TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => 'Original Period',
            'description' => 'Original description',
            'registration_start_at' => '2026-06-10 08:00:00',
            'registration_end_at' => '2026-06-12 17:00:00',
            'study_start_at' => '2026-06-15 08:00:00',
            'study_end_at' => '2026-06-20 17:00:00',
            'status' => TutorialPeriodStatus::DRAFT,
            'created_by' => $admin->id,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'academicPeriodId' => 296,
                'title' => 'Updated Period',
                'description' => 'Updated description',
                'registrationStartAt' => '2026-06-11 08:00:00',
                'registrationEndAt' => '2026-06-13 17:00:00',
                'studyStartAt' => '2026-06-16 08:00:00',
                'studyEndAt' => '2026-06-21 17:00:00',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.academicPeriodId', 296)
            ->assertJsonPath('data.academicPeriod.id', 296)
            ->assertJsonPath('data.academicPeriod.name', 'Legacy Period 296');

        $this->assertDatabaseHas('tutorial_periods', [
            'id' => $tutorialPeriod->id,
            'academic_period_id' => 296,
            'title' => 'Updated Period',
        ]);
    }
}

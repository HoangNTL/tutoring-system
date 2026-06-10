<?php

namespace Tests\Feature\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TutorialPeriodStatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 20261, 'name' => 'Legacy Period 20261'],
                ],
            ], 200),
        ]);
    }

    public function test_admin_can_create_period_with_explicit_status(): void
    {
        $admin = $this->createAdmin();

        $response = $this
            ->actingAs($admin, 'web')
            ->postJson('/api/v1/tutorial-periods', [
                'academicPeriodId' => 20261,
                'title' => 'New Tutorial Period',
                'description' => 'Description',
                'registrationStartAt' => '2026-06-10 08:00:00',
                'registrationEndAt' => '2026-06-12 17:00:00',
                'studyStartAt' => '2026-06-15 08:00:00',
                'studyEndAt' => '2026-06-20 17:00:00',
                'status' => TutorialPeriodStatus::OPEN->name,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', TutorialPeriodStatus::OPEN->name);
    }

    public function test_admin_can_update_period_fields_and_status_without_strict_transition_rules(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT);

        $response = $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'academicPeriodId' => 20261,
                'title' => 'Updated Title',
                'description' => 'Updated Description',
                'registrationStartAt' => '2026-06-10 08:00:00',
                'registrationEndAt' => '2026-06-12 17:00:00',
                'studyStartAt' => '2026-06-15 08:00:00',
                'studyEndAt' => '2026-06-20 17:00:00',
                'status' => TutorialPeriodStatus::ONGOING->name,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::ONGOING->name)
            ->assertJsonPath('data.title', 'Updated Title');

        $this->assertSame(TutorialPeriodStatus::ONGOING, $tutorialPeriod->refresh()->status);
    }

    public function test_closed_tutorial_period_cannot_be_changed_back(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CLOSED);

        $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'title' => 'Reopened',
                'status' => TutorialPeriodStatus::OPEN->name,
            ])
            ->assertConflict();
    }

    public function test_cancelled_tutorial_period_cannot_be_changed_back(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CANCELLED);

        $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'title' => 'Reopened',
                'status' => TutorialPeriodStatus::OPEN->name,
            ])
            ->assertConflict();
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin_transition',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);
    }

    private function createTutorialPeriod(
        int $createdBy,
        TutorialPeriodStatus $status,
        string $registrationStartAt = '2026-06-10 08:00:00',
        string $registrationEndAt = '2026-06-12 17:00:00',
        string $studyStartAt = '2026-06-15 08:00:00',
        string $studyEndAt = '2026-06-20 17:00:00'
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => 'Transition Period',
            'description' => 'Transition Period description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => $registrationEndAt,
            'study_start_at' => $studyStartAt,
            'study_end_at' => $studyEndAt,
            'status' => $status,
            'created_by' => $createdBy,
        ]);
    }
}

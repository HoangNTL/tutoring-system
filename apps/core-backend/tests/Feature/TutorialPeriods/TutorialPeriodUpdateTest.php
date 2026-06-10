<?php

namespace Tests\Feature\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
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

    public function test_updating_tutorial_period_does_not_try_to_persist_academic_period_payload(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT);

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
                'status' => TutorialPeriodStatus::DRAFT->name,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.academicPeriodId', 296)
            ->assertJsonPath('data.academicPeriod.id', 296)
            ->assertJsonPath('data.academicPeriod.name', 'Legacy Period 296');
    }

    public function test_open_tutorial_period_can_be_updated_like_normal_crud(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN);

        $response = $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'academicPeriodId' => 296,
                'title' => 'Open Period Updated',
                'description' => 'Open description updated',
                'registrationStartAt' => '2026-06-09 08:00:00',
                'registrationEndAt' => '2026-06-13 17:00:00',
                'studyStartAt' => '2026-06-16 08:00:00',
                'studyEndAt' => '2026-06-22 17:00:00',
                'status' => TutorialPeriodStatus::ASSIGNING->name,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.title', 'Open Period Updated')
            ->assertJsonPath('data.academicPeriodId', 296)
            ->assertJsonPath('data.registrationStartAt', '2026-06-09 08:00:00')
            ->assertJsonPath('data.status', TutorialPeriodStatus::ASSIGNING->name);
    }

    public function test_closed_tutorial_period_cannot_be_edited(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CLOSED);

        $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'title' => 'Nope',
                'status' => TutorialPeriodStatus::CLOSED->name,
            ])
            ->assertConflict();
    }

    public function test_cancelled_tutorial_period_cannot_be_edited(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CANCELLED);

        $this
            ->actingAs($admin, 'web')
            ->putJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id, [
                'title' => 'Nope',
                'status' => TutorialPeriodStatus::CANCELLED->name,
            ])
            ->assertConflict();
    }

    public function test_delete_without_related_data_is_allowed(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN);

        $this
            ->actingAs($admin, 'web')
            ->deleteJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id)
            ->assertOk();

        $this->assertSoftDeleted('tutorial_periods', [
            'id' => $tutorialPeriod->id,
        ]);
    }

    public function test_delete_is_blocked_if_related_data_exists(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'username' => 'student_delete_guard',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Course',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        $this
            ->actingAs($admin, 'web')
            ->deleteJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id)
            ->assertConflict();
    }

    public function test_closed_tutorial_period_cannot_be_deleted(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CLOSED);

        $this
            ->actingAs($admin, 'web')
            ->deleteJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id)
            ->assertConflict();
    }

    public function test_cancelled_tutorial_period_cannot_be_deleted(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CANCELLED);

        $this
            ->actingAs($admin, 'web')
            ->deleteJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id)
            ->assertConflict();
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin_update',
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
            'title' => 'Original Period',
            'description' => 'Original description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => $registrationEndAt,
            'study_start_at' => $studyStartAt,
            'study_end_at' => $studyEndAt,
            'status' => $status,
            'created_by' => $createdBy,
        ]);
    }
}

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

    public function test_create_starts_as_draft(): void
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
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', TutorialPeriodStatus::DRAFT->name);

        $this->assertDatabaseHas('tutorial_periods', [
            'title' => 'New Tutorial Period',
            'status' => TutorialPeriodStatus::DRAFT->value,
        ]);
    }

    public function test_only_draft_can_be_opened(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN, 'Open Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/open')
            ->assertForbidden();
    }

    public function test_draft_tutorial_period_can_be_opened(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/open')
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::OPEN->name);

        $this->assertSame(TutorialPeriodStatus::OPEN, $tutorialPeriod->refresh()->status);
    }

    public function test_open_requires_valid_date_order(): void
    {
        $admin = $this->createAdmin();

        $tutorialPeriod = TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => 'Invalid Draft',
            'description' => 'Invalid date order',
            'registration_start_at' => '2026-06-10 08:00:00',
            'registration_end_at' => '2026-06-12 17:00:00',
            'study_start_at' => '2026-06-12 17:00:00',
            'study_end_at' => '2026-06-20 17:00:00',
            'status' => TutorialPeriodStatus::DRAFT,
            'created_by' => $admin->id,
        ]);

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/open')
            ->assertConflict();
    }

    public function test_closed_tutorial_period_cannot_be_cancelled(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CLOSED, 'Closed Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/cancel')
            ->assertForbidden();
    }

    public function test_open_tutorial_period_can_be_cancelled(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN, 'Open Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::CANCELLED->name);

        $this->assertSame(TutorialPeriodStatus::CANCELLED, $tutorialPeriod->refresh()->status);
    }

    public function test_open_tutorial_period_can_be_moved_to_assigning_manually(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN, 'Open Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/assigning')
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::ASSIGNING->name);

        $this->assertSame(TutorialPeriodStatus::ASSIGNING, $tutorialPeriod->refresh()->status);
    }

    public function test_assigning_tutorial_period_can_be_moved_to_ongoing_manually(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::ASSIGNING, 'Assigning Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/ongoing')
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::ONGOING->name);

        $this->assertSame(TutorialPeriodStatus::ONGOING, $tutorialPeriod->refresh()->status);
    }

    public function test_ongoing_tutorial_period_can_be_closed_manually(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::ONGOING, 'Ongoing Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/close')
            ->assertOk()
            ->assertJsonPath('data.status', TutorialPeriodStatus::CLOSED->name);

        $this->assertSame(TutorialPeriodStatus::CLOSED, $tutorialPeriod->refresh()->status);
    }

    public function test_invalid_manual_transition_is_forbidden(): void
    {
        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        $this
            ->actingAs($admin, 'web')
            ->patchJson('/api/v1/tutorial-periods/' . $tutorialPeriod->id . '/assigning')
            ->assertForbidden();
    }

    public function test_cancelled_tutorial_period_is_ignored_by_automatic_status_updates(): void
    {
        $admin = $this->createAdmin();

        $open = $this->createTutorialPeriod(
            $admin->id,
            TutorialPeriodStatus::OPEN,
            'Open Period',
            '2026-06-01 08:00:00',
            '2026-06-05 17:00:00',
            '2026-06-10 08:00:00',
            '2026-06-20 17:00:00'
        );

        $assigning = $this->createTutorialPeriod(
            $admin->id,
            TutorialPeriodStatus::ASSIGNING,
            'Assigning Period',
            '2026-06-01 08:00:00',
            '2026-06-05 17:00:00',
            '2026-06-07 08:00:00',
            '2026-06-20 17:00:00'
        );

        $ongoing = $this->createTutorialPeriod(
            $admin->id,
            TutorialPeriodStatus::ONGOING,
            'Ongoing Period',
            '2026-06-01 08:00:00',
            '2026-06-05 17:00:00',
            '2026-06-07 08:00:00',
            '2026-06-10 17:00:00'
        );

        $cancelled = $this->createTutorialPeriod(
            $admin->id,
            TutorialPeriodStatus::CANCELLED,
            'Cancelled Period',
            '2026-06-01 08:00:00',
            '2026-06-05 17:00:00',
            '2026-06-07 08:00:00',
            '2026-06-10 17:00:00'
        );

        $this->travelTo('2026-06-12 12:00:00');

        $this->artisan('tutorial-periods:update-statuses')->assertSuccessful();

        $this->assertSame(TutorialPeriodStatus::ASSIGNING, $open->refresh()->status);
        $this->assertSame(TutorialPeriodStatus::ONGOING, $assigning->refresh()->status);
        $this->assertSame(TutorialPeriodStatus::CLOSED, $ongoing->refresh()->status);
        $this->assertSame(TutorialPeriodStatus::CANCELLED, $cancelled->refresh()->status);

        $this->travelBack();
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
        string $title,
        string $registrationStartAt = '2026-06-10 08:00:00',
        string $registrationEndAt = '2026-06-12 17:00:00',
        string $studyStartAt = '2026-06-15 08:00:00',
        string $studyEndAt = '2026-06-20 17:00:00'
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => $registrationEndAt,
            'study_start_at' => $studyStartAt,
            'study_end_at' => $studyEndAt,
            'status' => $status,
            'created_by' => $createdBy,
        ]);
    }
}

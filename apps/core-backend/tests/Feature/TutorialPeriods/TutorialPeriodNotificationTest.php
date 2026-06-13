<?php

namespace Tests\Feature\TutorialPeriods;

use App\Events\TutorialPeriodPublished;
use App\Listeners\SendTutorialPeriodNotification;
use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use App\Notifications\NewTutorialPeriodNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TutorialPeriodNotificationTest extends TestCase
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

    public function test_opening_tutorial_period_dispatches_published_event(): void
    {
        Event::fake([TutorialPeriodPublished::class]);

        $admin = $this->createAdmin();
        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        $this->actingAs($admin, 'web')
            ->putJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}", [
                'status' => 'OPEN',
            ])
            ->assertOk();

        Event::assertDispatched(TutorialPeriodPublished::class, function (TutorialPeriodPublished $event) use ($tutorialPeriod) {
            return $event->tutorialPeriod->id === $tutorialPeriod->id;
        });
    }

    public function test_listener_sends_notifications_to_all_students(): void
    {
        Notification::fake();

        $student1 = User::create([
            'username' => 'student1',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);
        $student2 = User::create([
            'username' => 'student2',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);
        $admin = $this->createAdmin();

        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        $event = new TutorialPeriodPublished($tutorialPeriod);
        $listener = new SendTutorialPeriodNotification();
        $listener->handle($event);

        Notification::assertSentTo(
            [$student1, $student2],
            NewTutorialPeriodNotification::class,
            function (NewTutorialPeriodNotification $notification) use ($tutorialPeriod) {
                $data = $notification->toArray($tutorialPeriod);
                return $data['tutorialPeriodId'] === $tutorialPeriod->id &&
                    $data['title'] === 'Thông báo: Đợt đăng ký phụ đạo mới';
            }
        );

        Notification::assertNotSentTo($admin, NewTutorialPeriodNotification::class);
    }

    public function test_notifications_are_saved_to_database(): void
    {
        $student = User::create([
            'username' => 'student_db',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);
        $admin = $this->createAdmin();

        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        $this->actingAs($admin, 'web')
            ->putJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}", [
                'status' => 'OPEN',
            ])
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $student->id,
            'notifiable_type' => User::class,
            'type' => NewTutorialPeriodNotification::class,
        ]);

        $this->assertEquals(1, $student->notifications()->count());

        $dbNotification = $student->notifications()->first();
        $this->assertNotNull($dbNotification);
        $this->assertSame('Thông báo: Đợt đăng ký phụ đạo mới', $dbNotification->data['title']);
        $this->assertSame($tutorialPeriod->id, $dbNotification->data['tutorialPeriodId']);
    }

    public function test_can_fetch_active_notifications(): void
    {
        $student = User::create([
            'username' => 'student_active_test',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);

        // Create an active notification
        $student->notify(new NewTutorialPeriodNotification(
            $this->createTutorialPeriod($student->id, TutorialPeriodStatus::DRAFT, 'Active Period', '2026-06-10 08:00:00', '2026-06-25 17:00:00')
        ));

        // Create an expired notification
        $student->notify(new NewTutorialPeriodNotification(
            $this->createTutorialPeriod($student->id, TutorialPeriodStatus::DRAFT, 'Expired Period', '2026-06-01 08:00:00', '2026-06-05 17:00:00')
        ));

        $response = $this->actingAs($student, 'web')
            ->getJson('/api/v1/notifications');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertStringContainsString('Active Period', $data[0]['data']['message']);
    }

    public function test_can_mark_notification_as_read(): void
    {
        $student = User::create([
            'username' => 'student_read_test',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);

        $student->notify(new NewTutorialPeriodNotification(
            $this->createTutorialPeriod($student->id, TutorialPeriodStatus::DRAFT, 'Active Period', '2026-06-10 08:00:00', '2026-06-25 17:00:00')
        ));

        $notification = $student->unreadNotifications()->first();
        $this->assertNotNull($notification);

        $response = $this->actingAs($student, 'web')
            ->patchJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNull($student->unreadNotifications()->first());
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin_notifier',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);
    }

    private function createTutorialPeriod(
        int $createdBy,
        TutorialPeriodStatus $status,
        string $title,
        string $registrationStartAt = '2026-06-10 08:00:00',
        string $registrationEndAt = '2026-06-12 17:00:00'
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => $registrationEndAt,
            'study_start_at' => '2026-06-15 08:00:00',
            'study_end_at' => '2026-06-20 17:00:00',
            'status' => $status,
            'created_by' => $createdBy,
        ]);
    }
}

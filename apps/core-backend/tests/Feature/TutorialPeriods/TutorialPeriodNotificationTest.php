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
            ->patchJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}/open")
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
            ->patchJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}/open")
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

    public function test_updating_open_tutorial_period_updates_existing_notifications(): void
    {
        $student = User::create([
            'username' => 'student_update_test',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);
        $admin = $this->createAdmin();

        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        // 1. Open the tutorial period (which sends notification to student)
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}/open")
            ->assertOk();

        // Verify initial notification state in database
        $notification = $student->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertSame('Thông báo: Đợt đăng ký phụ đạo mới', $notification->data['title']);
        $this->assertStringContainsString('Draft Period', $notification->data['message']);

        // 2. Update the open tutorial period (including dates)
        $newTitle = 'Updated Period Name';
        $newStart = '2026-06-11 08:00:00';
        $newEnd = '2026-06-13 17:00:00';

        $this->actingAs($admin, 'web')
            ->putJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}", [
                'title' => $newTitle,
                'registrationStartAt' => $newStart,
                'registrationEndAt' => $newEnd,
            ])
            ->assertOk();

        // 3. Verify that the existing notification is updated with the date-change title
        $notification->refresh();
        $this->assertSame('Thông báo: Thay đổi thời gian đăng ký phụ đạo', $notification->data['title']);
        $this->assertStringContainsString($newTitle, $notification->data['message']);
        $this->assertStringContainsString('11/06/2026', $notification->data['message']);
        $this->assertStringContainsString('13/06/2026', $notification->data['message']);
        $this->assertSame($newStart, $notification->data['registrationStartAt']);
        $this->assertSame($newEnd, $notification->data['registrationEndAt']);
    }

    public function test_updating_only_title_of_open_tutorial_period_keeps_original_notification_title(): void
    {
        $student = User::create([
            'username' => 'student_update_title_only',
            'password_hash' => 'password',
            'role' => UserRole::STUDENT,
        ]);
        $admin = $this->createAdmin();

        $tutorialPeriod = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');

        // 1. Open
        $this->actingAs($admin, 'web')
            ->patchJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}/open")
            ->assertOk();

        // 2. Update only title
        $newTitle = 'Updated Title Only';
        $this->actingAs($admin, 'web')
            ->putJson("/api/v1/tutorial-periods/{$tutorialPeriod->id}", [
                'title' => $newTitle,
            ])
            ->assertOk();

        // 3. Verify title remains the same
        $notification = $student->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertSame('Thông báo: Đợt đăng ký phụ đạo mới', $notification->data['title']);
        $this->assertStringContainsString($newTitle, $notification->data['message']);
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

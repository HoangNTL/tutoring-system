<?php

namespace App\Listeners;

use App\Events\TutorialPeriodPublished;
use App\Enums\UserRole;
use App\Models\User;
use App\Notifications\NewTutorialPeriodNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendTutorialPeriodNotification implements ShouldQueue
{
    public function handle(TutorialPeriodPublished $event): void
    {
        $tutorialPeriod = $event->tutorialPeriod;

        // Tách nhỏ danh sách sinh viên theo từng cụm (chunk) để không gây tràn bộ nhớ RAM (Memory Leak)
        User::where('role', UserRole::STUDENT->value)
            ->chunk(100, function ($students) use ($tutorialPeriod) {
                Notification::send($students, new NewTutorialPeriodNotification($tutorialPeriod));
            });
    }
}

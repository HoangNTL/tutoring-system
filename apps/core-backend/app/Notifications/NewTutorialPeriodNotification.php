<?php

namespace App\Notifications;

use App\Models\TutorialPeriod;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewTutorialPeriodNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private TutorialPeriod $tutorialPeriod
    ) {}

    public function via(object $notifiable): array
    {
        // Sử dụng database channel để lưu thông báo vào DB phục vụ việc hiển thị ở giao diện sinh viên
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $start = $this->tutorialPeriod->registration_start_at?->format('d/m/Y') ?? '...';
        $end = $this->tutorialPeriod->registration_end_at?->format('d/m/Y') ?? '...';

        return [
            'tutorialPeriodId' => $this->tutorialPeriod->id,
            'title' => 'Thông báo: Đợt đăng ký phụ đạo mới',
            'message' => "Đợt phụ đạo \"{$this->tutorialPeriod->title}\" chuẩn bị được mở vào ngày {$start} đến ngày {$end}",
            'registrationStartAt' => $this->tutorialPeriod->registration_start_at?->format('Y-m-d H:i:s'),
            'registrationEndAt' => $this->tutorialPeriod->registration_end_at?->format('Y-m-d H:i:s'),
        ];
    }
}

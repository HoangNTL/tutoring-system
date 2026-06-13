<?php

namespace App\Events;

use App\Models\TutorialPeriod;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TutorialPeriodPublished
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public TutorialPeriod $tutorialPeriod
    ) {}
}

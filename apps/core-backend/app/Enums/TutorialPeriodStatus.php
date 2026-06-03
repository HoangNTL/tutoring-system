<?php

namespace App\Enums;

enum TutorialPeriodStatus: int
{
    case DRAFT = 0;
    case OPEN = 1;
    case ASSIGNING = 2;
    case ONGOING = 3;
    case CLOSED = 4;
    case CANCELLED = 5;
}

<?php

namespace App\Enums;

enum NotificationType: int
{
    case SYSTEM = 0;
    case TUTORIAL_PERIOD = 1;
    case STATUS_CHANGE = 2;
    case REMINDER = 3;
}

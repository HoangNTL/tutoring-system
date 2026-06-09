<?php

namespace App\Enums;

enum TutorialClassStatus: string
{
    case PLANNED = 'PLANNED';
    case ASSIGNED = 'ASSIGNED';
    case SCHEDULED = 'SCHEDULED';
    case CANCELLED = 'CANCELLED';
}

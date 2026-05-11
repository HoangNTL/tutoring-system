<?php

namespace App\Enums;

enum UserRole: int
{
    case ADMIN = 1;
    case DEPARTMENT = 2;
    case LECTURER = 3;
    case STUDENT = 4;
}

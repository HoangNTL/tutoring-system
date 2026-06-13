<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentLecturerController;
use App\Http\Controllers\Api\V1\DepartmentTutorialRegistrationController;
use App\Http\Controllers\Api\V1\DepartmentTutorialClassController;
use App\Http\Controllers\Api\V1\DepartmentRoomController;
use App\Http\Controllers\Api\V1\LegacyPeriodController;
use App\Http\Controllers\Api\V1\LecturerScheduleController;
use App\Http\Controllers\Api\V1\StudentTutorialPeriodCourseController;
use App\Http\Controllers\Api\V1\StudentTutorialPeriodController;
use App\Http\Controllers\Api\V1\StudentTutorialRegistrationController;
use App\Http\Controllers\Api\V1\StudentTutorialRegistrationInfoController;
use App\Http\Controllers\Api\V1\StudentScheduleController;
use App\Http\Controllers\Api\V1\TutorialPeriodController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\NotificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware('web')->prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/legacy/periods', [LegacyPeriodController::class, 'index']);
        Route::get('/department/rooms', [DepartmentRoomController::class, 'index']);
        Route::get('/department/lecturers', [DepartmentLecturerController::class, 'index']);
        Route::get('/department/tutorial-periods', [DepartmentTutorialRegistrationController::class, 'tutorialPeriods']);
        Route::get('/department/tutorial-periods/{tutorialPeriodId}/course-registrations', [DepartmentTutorialRegistrationController::class, 'courseRegistrations']);
        Route::get('/department/tutorial-periods/{tutorialPeriodId}/course-registrations/{courseCode}/students', [DepartmentTutorialRegistrationController::class, 'students']);
        Route::get('/department/tutorial-periods/{tutorialPeriodId}/classes', [DepartmentTutorialClassController::class, 'index']);
        Route::get('/department/tutorial-periods/{tutorialPeriodId}/weekly-timetable', [DepartmentTutorialClassController::class, 'weeklyTimetable']);
        Route::post('/department/tutorial-periods/{tutorialPeriodId}/classes', [DepartmentTutorialClassController::class, 'store']);
        Route::put('/department/classes/{classId}', [DepartmentTutorialClassController::class, 'update']);
        Route::patch('/department/classes/{classId}/cancel', [DepartmentTutorialClassController::class, 'cancel']);
        Route::patch('/department/classes/{classId}/restore', [DepartmentTutorialClassController::class, 'restore']);
        Route::patch('/department/classes/{classId}/assign-lecturer', [DepartmentTutorialClassController::class, 'assignLecturer']);
        Route::get('/department/classes/{classId}/schedules', [DepartmentTutorialClassController::class, 'schedules']);
        Route::post('/department/classes/{classId}/schedules', [DepartmentTutorialClassController::class, 'storeSchedule']);
        Route::delete('/department/classes/{classId}/schedules/{scheduleId}', [DepartmentTutorialClassController::class, 'destroySchedule']);
        Route::get('/lecturer/schedules', [LecturerScheduleController::class, 'index']);
        Route::get('/student/schedules', [StudentScheduleController::class, 'index']);
        Route::get('/student/tutorial-periods/{tutorialPeriodId}/courses', [StudentTutorialPeriodCourseController::class, 'index']);
        Route::get('/student/tutorial-periods/{tutorialPeriodId}/registration-info', [StudentTutorialRegistrationInfoController::class, 'show']);
        Route::post('/student/tutorial-periods/{tutorialPeriodId}/registrations', [StudentTutorialRegistrationController::class, 'store']);
        Route::delete('/student/tutorial-periods/{tutorialPeriodId}/registrations/{courseCode}', [StudentTutorialRegistrationController::class, 'destroy']);
        Route::get('/student/tutorial-periods', [StudentTutorialPeriodController::class, 'index']);
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user}/password', [UserController::class, 'updatePassword']);
        Route::get('/tutorial-periods', [TutorialPeriodController::class, 'index']);
        Route::get('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'show']);
        Route::post('/tutorial-periods', [TutorialPeriodController::class, 'store']);
        Route::patch('/tutorial-periods/{tutorial_period}/open', [TutorialPeriodController::class, 'open']);
        Route::patch('/tutorial-periods/{tutorial_period}/assigning', [TutorialPeriodController::class, 'assigning']);
        Route::patch('/tutorial-periods/{tutorial_period}/ongoing', [TutorialPeriodController::class, 'ongoing']);
        Route::patch('/tutorial-periods/{tutorial_period}/close', [TutorialPeriodController::class, 'close']);
        Route::patch('/tutorial-periods/{tutorial_period}/cancel', [TutorialPeriodController::class, 'cancel']);
        Route::patch('/tutorial-periods/{tutorial_period}/revert-to-draft', [TutorialPeriodController::class, 'revertToDraft']);
        Route::patch('/tutorial-periods/{tutorial_period}/reopen-registration', [TutorialPeriodController::class, 'reopenRegistration']);
        Route::patch('/tutorial-periods/{tutorial_period}/restore', [TutorialPeriodController::class, 'restore']);
        Route::put('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'update']);
        Route::patch('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'update']);
        Route::delete('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'destroy']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    });
});

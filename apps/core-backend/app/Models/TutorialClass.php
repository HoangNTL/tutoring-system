<?php

namespace App\Models;

use App\Enums\TutorialClassStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorialClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_period_id',
        'department_id',
        'course_code',
        'course_name',
        'credits',
        'total_sessions',
        'periods_per_session',
        'total_periods',
        'status',
        'cancelled_at',
        'created_by',
        'lecturer_id',
        'lecturer_name',
        'day_of_week',
        'start_period',
        'room',
    ];

    protected function casts(): array
    {
        return [
            'tutorial_period_id' => 'integer',
            'credits' => 'integer',
            'total_sessions' => 'integer',
            'periods_per_session' => 'integer',
            'total_periods' => 'integer',
            'status' => TutorialClassStatus::class,
            'cancelled_at' => 'datetime',
            'created_by' => 'integer',
            'lecturer_id' => 'integer',
            'day_of_week' => 'integer',
            'start_period' => 'integer',
        ];
    }

    public function tutorialPeriod(): BelongsTo
    {
        return $this->belongsTo(TutorialPeriod::class, 'tutorial_period_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

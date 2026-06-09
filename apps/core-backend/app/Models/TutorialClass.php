<?php

namespace App\Models;

use App\Enums\TutorialClassStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorialClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_period_id',
        'course_code',
        'course_name',
        'credits',
        'total_sessions',
        'periods_per_session',
        'total_periods',
        'lecturer_id',
        'lecturer_code',
        'lecturer_name',
        'status',
        'assigned_at',
        'cancelled_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tutorial_period_id' => 'integer',
            'credits' => 'integer',
            'total_sessions' => 'integer',
            'periods_per_session' => 'integer',
            'total_periods' => 'integer',
            'lecturer_id' => 'integer',
            'status' => TutorialClassStatus::class,
            'assigned_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'created_by' => 'integer',
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

    public function schedules(): HasMany
    {
        return $this->hasMany(TutorialClassSchedule::class, 'tutorial_class_id');
    }
}

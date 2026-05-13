<?php

namespace App\Models;

use App\Enums\TutorialPeriodStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TutorialPeriod extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'start_reg_date',
        'end_reg_date',
        'start_study_date',
        'end_study_date',
        'status',
        'opened_at',
        'assigned_at',
        'started_at',
        'closed_at',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_reg_date' => 'date',
            'end_reg_date' => 'date',
            'start_study_date' => 'date',
            'end_study_date' => 'date',
            'status' => TutorialPeriodStatus::class,
            'opened_at' => 'datetime',
            'assigned_at' => 'datetime',
            'started_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(TutorialPeriodStatusLog::class);
    }
}

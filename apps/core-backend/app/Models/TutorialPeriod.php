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
     * Non-persisted legacy academic period payload for API responses.
     *
     * @var array{id:int,name:string}|null
     */
    protected ?array $academicPeriodData = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'academic_period_id',
        'title',
        'description',
        'registration_start_at',
        'registration_end_at',
        'study_start_at',
        'study_end_at',
        'status',
        'has_entered_ongoing',
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
            'academic_period_id' => 'integer',
            'registration_start_at' => 'datetime',
            'registration_end_at' => 'datetime',
            'study_start_at' => 'datetime',
            'study_end_at' => 'datetime',
            'status' => TutorialPeriodStatus::class,
            'has_entered_ongoing' => 'boolean',
        ];
    }

    /**
     * @param  array{id:int,name:string}|null  $academicPeriod
     */
    public function setAcademicPeriod(?array $academicPeriod): void
    {
        $this->academicPeriodData = $academicPeriod;
    }

    /**
     * @return array{id:int,name:string}|null
     */
    public function getAcademicPeriodAttribute(): ?array
    {
        return $this->academicPeriodData;
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(TutorialRegistration::class, 'tutorial_period_id');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(TutorialClass::class, 'tutorial_period_id');
    }
}

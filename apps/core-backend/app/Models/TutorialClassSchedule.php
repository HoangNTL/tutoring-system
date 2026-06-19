<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorialClassSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_class_id',
        'day_of_week',
        'start_period',
        'room',
    ];

    protected function casts(): array
    {
        return [
            'tutorial_class_id' => 'integer',
            'day_of_week' => 'integer',
            'start_period' => 'integer',
        ];
    }

    public function tutorialClass(): BelongsTo
    {
        return $this->belongsTo(TutorialClass::class, 'tutorial_class_id');
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'title'      => $this->title,
            'venue'      => $this->venue,
            'city'       => $this->city,
            'starts_at'  => optional($this->starts_at)?->toIso8601String(),
            'ends_at'    => optional($this->ends_at)?->toIso8601String(),
            'capacity'   => $this->capacity,
            'description' => $this->description,

            'artist' => $this->whenLoaded('artist', fn() => new UserSummaryResource($this->artist)),
        ];
    }
}

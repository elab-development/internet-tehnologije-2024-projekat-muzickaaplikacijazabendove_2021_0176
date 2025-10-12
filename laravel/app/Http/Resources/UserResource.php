<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,

            'albums' => AlbumResource::collection($this->whenLoaded('albums')),
            'events' => EventResource::collection($this->whenLoaded('events')),

            'albums_count' => $this->when(isset($this->albums_count), $this->albums_count),
            'events_count' => $this->when(isset($this->events_count), $this->events_count),
        ];
    }
}

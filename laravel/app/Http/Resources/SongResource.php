<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SongResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'album_id'         => $this->album_id,
            'title'            => $this->title,
            'track_number'     => $this->track_number,
            'duration_seconds' => $this->duration_seconds,

            'album'  => $this->whenLoaded('album', fn() => new AlbumSummaryResource($this->album)),

            'artist' => $this->when(
                $this->relationLoaded('album') && $this->album->relationLoaded('artist'),
                fn() => new UserSummaryResource($this->album->artist)
            ),
        ];
    }
}

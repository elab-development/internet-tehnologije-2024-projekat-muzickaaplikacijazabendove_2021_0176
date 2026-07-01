<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AlbumResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'title'        => $this->title,
            'release_date' => optional($this->release_date)?->toDateString(),
            'description'  => $this->description,

            'artist' => $this->whenLoaded('artist', fn() => new UserSummaryResource($this->artist)),

            'songs'  => SongResource::collection($this->whenLoaded('songs')),

            'songs_count' => $this->when(isset($this->songs_count), $this->songs_count),
        ];
    }
}

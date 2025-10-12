<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AlbumSummaryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title'  => $this->title,
            'release_date' => optional($this->release_date)?->toDateString(),
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\SongResource;
use App\Models\Album;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SongController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q'        => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page'     => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['per_page'] ?? 15;
        $page    = $validated['page'] ?? 1;
        $q       = $validated['q'] ?? null;

        $query = Song::query()
            ->select('songs.*')
            ->leftJoin('albums', 'songs.album_id', '=', 'albums.id')
            ->leftJoin('users', 'albums.user_id', '=', 'users.id')
            ->with(['album.artist']);

        if ($q) {
            $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $q) . '%';
            $query->where(function ($sub) use ($like) {
                $sub->where('songs.title', 'LIKE', $like)
                    ->orWhere('albums.title', 'LIKE', $like)
                    ->orWhere('users.name', 'LIKE', $like);
            });
        }

        $query->orderBy('songs.title');

        $paginator = $query->paginate($perPage, ['songs.*'], 'page', $page);

        return response()->json([
            'data' => SongResource::collection($paginator),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'artist') {
            return response()->json(['error' => 'Only artists can create songs'], 403);
        }

        $validated = $request->validate([
            'album_id'         => 'required|integer|exists:albums,id',
            'title'            => 'required|string|max:255',
            'track_number'     => 'required|integer|min:1',
            'duration_seconds' => 'nullable|integer|min:1',
        ]);

        // Provera vlasništva albuma
        $album = Album::findOrFail($validated['album_id']);
        if ($album->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can add songs only to your own albums'], 403);
        }

        // Unique (album_id, track_number)
        $request->validate([
            'track_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('songs')->where(
                    fn($q) =>
                    $q->where('album_id', $validated['album_id'])
                ),
            ],
        ]);

        $song = Song::create([
            'album_id'         => $validated['album_id'],
            'title'            => $validated['title'],
            'track_number'     => $validated['track_number'],
            'duration_seconds' => $validated['duration_seconds'] ?? null,
        ]);

        return response()->json([
            'message' => 'Song created successfully',
            'song'    => new SongResource($song->load(['album.artist'])),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Song $song)
    {
        $song->load(['album.artist']);

        return response()->json([
            'song' => new SongResource($song),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Song $song)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Song $song)
    {
        if (!Auth::check() || Auth::user()->role !== 'artist') {
            return response()->json(['error' => 'Only artists can update songs'], 403);
        }

        // Provera vlasništva (preko albuma)
        $song->load('album');
        if ($song->album->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can update only your own songs'], 403);
        }

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'track_number'     => 'sometimes|integer|min:1',
            'duration_seconds' => 'sometimes|nullable|integer|min:1',
        ]);

        // Ako se menja track_number, održi unique (album_id, track_number)
        if (array_key_exists('track_number', $validated)) {
            $request->validate([
                'track_number' => [
                    'integer',
                    'min:1',
                    Rule::unique('songs')
                        ->ignore($song->id)
                        ->where(fn($q) => $q->where('album_id', $song->album_id)),
                ],
            ]);
        }

        $song->update($validated);

        return response()->json([
            'message' => 'Song updated successfully',
            'song'    => new SongResource($song->load(['album.artist'])),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Song $song)
    {
        if (!Auth::check() || Auth::user()->role !== 'artist') {
            return response()->json(['error' => 'Only artists can delete songs'], 403);
        }

        $song->load('album');
        if ($song->album->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can delete only your own songs'], 403);
        }

        $song->delete();

        return response()->json(['message' => 'Song deleted successfully']);
    }
}

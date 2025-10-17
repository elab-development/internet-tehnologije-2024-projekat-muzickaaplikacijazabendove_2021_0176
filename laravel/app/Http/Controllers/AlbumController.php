<?php

namespace App\Http\Controllers;

use App\Http\Resources\AlbumResource;
use App\Models\Album;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlbumController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Album::query()
            ->with('artist')
            ->withCount('songs')
            ->orderBy('title');

        if ($request->filled('artist_id')) {
            $query->where('user_id', (int) $request->artist_id);
        }

        $albums = $query->get();

        if ($albums->isEmpty()) {
            return response()->json('No albums found.', 404);
        }

        return response()->json([
            'albums' => AlbumResource::collection($albums),
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
            return response()->json(['error' => 'Only artists can create albums'], 403);
        }

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'release_date' => 'nullable|date',
            'description'  => 'nullable|string',
        ]);

        $album = Album::create([
            'user_id'      => Auth::id(),
            'title'        => $validated['title'],
            'release_date' => $validated['release_date'] ?? null,
            'description'  => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Album created successfully',
            'album'   => new AlbumResource($album->load(['artist'])->loadCount('songs')),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Album $album)
    {
        $album->load(['artist', 'songs'])->loadCount('songs');

        return response()->json([
            'album' => new AlbumResource($album),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Album $album)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Album $album)
    {
        if (!Auth::check() || Auth::user()->role !== 'artist') {
            return response()->json(['error' => 'Only artists can update albums'], 403);
        }

        if ($album->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can update only your own albums'], 403);
        }

        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'release_date' => 'sometimes|nullable|date',
            'description'  => 'sometimes|nullable|string',
        ]);

        $album->update($validated);

        return response()->json([
            'message' => 'Album updated successfully',
            'album'   => new AlbumResource($album->load(['artist', 'songs'])->loadCount('songs')),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Album $album)
    {
        if (!Auth::check() || Auth::user()->role !== 'artist') {
            return response()->json(['error' => 'Only artists can delete albums'], 403);
        }

        if ($album->user_id !== Auth::id()) {
            return response()->json(['error' => 'You can delete only your own albums'], 403);
        }

        $album->delete();

        return response()->json(['message' => 'Album deleted successfully']);
    }
}

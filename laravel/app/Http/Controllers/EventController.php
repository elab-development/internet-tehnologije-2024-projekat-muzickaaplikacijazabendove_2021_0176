<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'artist_id' => 'sometimes|integer|exists:users,id',
            'date'      => 'sometimes|date_format:Y-m-d',
            'date_from' => 'sometimes|date_format:Y-m-d',
            'date_to'   => 'sometimes|date_format:Y-m-d',
        ]);

        $q = Event::query()
            ->with('artist')
            ->orderBy('starts_at');

        if ($request->filled('artist_id')) {
            $q->where('user_id', (int) $request->artist_id);
        }

        if ($request->filled('date')) {
            $q->whereDate('starts_at', $request->date);
        } elseif ($request->filled('date_from') && $request->filled('date_to')) {
            $q->whereBetween('starts_at', [
                $request->date_from . ' 00:00:00',
                $request->date_to   . ' 23:59:59',
            ]);
        } elseif ($request->filled('date_from')) {
            $q->where('starts_at', '>=', $request->date_from . ' 00:00:00');
        } elseif ($request->filled('date_to')) {
            $q->where('starts_at', '<=', $request->date_to . ' 23:59:59');
        }

        $events = $q->get();

        if ($events->isEmpty()) {
            return response()->json('No events found.', 404);
        }

        return response()->json([
            'events' => EventResource::collection($events),
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
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can create events'], 403);
        }

        $validated = $request->validate([
            'user_id'     => 'required|integer|exists:users,id',
            'title'       => 'required|string|max:255',
            'venue'       => 'nullable|string|max:255',
            'city'        => 'nullable|string|max:255',
            'starts_at'   => 'required|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
            'capacity'    => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ]);

        // Proveri da li je user artist
        $artist = User::findOrFail($validated['user_id']);
        if ($artist->role !== 'artist') {
            return response()->json(['error' => 'Target user must be an artist'], 422);
        }

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Event created successfully',
            'event'   => new EventResource($event->load('artist')),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $event->load('artist');

        return response()->json([
            'event' => new EventResource($event),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can update events'], 403);
        }

        $validated = $request->validate([
            'user_id'     => 'sometimes|integer|exists:users,id',
            'title'       => 'sometimes|string|max:255',
            'venue'       => 'sometimes|nullable|string|max:255',
            'city'        => 'sometimes|nullable|string|max:255',
            'starts_at'   => 'sometimes|date',
            'ends_at'     => 'sometimes|nullable|date|after_or_equal:starts_at',
            'capacity'    => 'sometimes|nullable|integer|min:1',
            'description' => 'sometimes|nullable|string',
        ]);

        if (array_key_exists('user_id', $validated)) {
            $artist = User::findOrFail($validated['user_id']);
            if ($artist->role !== 'artist') {
                return response()->json(['error' => 'Target user must be an artist'], 422);
            }
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'event'   => new EventResource($event->load('artist')),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can delete events'], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}

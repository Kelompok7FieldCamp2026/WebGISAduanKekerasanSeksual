<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        return response()->json(Location::orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string',
            'desc'   => 'nullable|string',
            'status' => 'required|in:terpasang,rencana',
            'icon'   => 'nullable|string',
            'count'  => 'nullable|integer',
            'lat'    => 'nullable|numeric',
            'lng'    => 'nullable|numeric',
            'gmaps'  => 'nullable|string',
            'photo'  => 'nullable|string',
        ]);

        $location = Location::create($validated);

        return response()->json(['success' => true, 'data' => $location], 201);
    }

    public function update(Request $request, $id)
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json(['success' => false, 'message' => 'Titik tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name'   => 'nullable|string',
            'desc'   => 'nullable|string',
            'status' => 'nullable|in:terpasang,rencana',
            'icon'   => 'nullable|string',
            'count'  => 'nullable|integer',
            'lat'    => 'nullable|numeric',
            'lng'    => 'nullable|numeric',
            'gmaps'  => 'nullable|string',
            'photo'  => 'nullable|string',
        ]);

        $location->fill($validated);
        $location->save();

        return response()->json(['success' => true, 'data' => $location]);
    }

    public function destroy($id)
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json(['success' => false, 'message' => 'Titik tidak ditemukan.'], 404);
        }

        $location->delete();

        return response()->json(['success' => true]);
    }
}

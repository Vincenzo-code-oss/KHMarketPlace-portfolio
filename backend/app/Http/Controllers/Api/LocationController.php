<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $locations = Location::query()
            ->where('type', $request->string('type', 'province')->toString())
            ->when($request->filled('parent_id'), fn ($query) => $query->where('parent_id', $request->integer('parent_id')))
            ->orderBy('name')
            ->get(['id', 'parent_id', 'name', 'type', 'slug']);

        return response()->json($locations);
    }
}

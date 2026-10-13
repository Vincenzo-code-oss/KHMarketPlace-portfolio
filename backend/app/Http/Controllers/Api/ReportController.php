<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReportRequest;
use App\Models\Product;
use App\Models\Report;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function store(ReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $exists = match ($data['target_type']) {
            'product' => Product::whereKey($data['target_id'])->exists(),
            'user' => User::whereKey($data['target_id'])->exists(),
            'review' => Review::whereKey($data['target_id'])->exists(),
        };
        abort_unless($exists, 404, 'The reported item could not be found.');

        $report = Report::create(['reporter_id' => $request->user()->id, ...$data]);

        return response()->json(['report' => $report], 201);
    }
}

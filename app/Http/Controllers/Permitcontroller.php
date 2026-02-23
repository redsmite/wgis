<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Permit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PermitController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        // ── Guard: table must exist ───────────────────────────────────────
        if (!Schema::hasTable('permits')) {
            return Inertia::render('Permits/Index', [
                'permits'        => collect()->paginate(25),
                'filters'        => (object)[],
                'municipalities' => [],
                'types'          => [],
                'purposes'       => [],
                'sources'        => [],
            ]);
        }

        $query = Permit::query();

        // ── Global search ─────────────────────────────────────────────────
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('permit',        'like', "%{$search}%")
                  ->orWhere('grantee',     'like', "%{$search}%")
                  ->orWhere('municipality','like', "%{$search}%")
                  ->orWhere('province',    'like', "%{$search}%")
                  ->orWhere('location',    'like', "%{$search}%")
                  ->orWhere('purpose',     'like', "%{$search}%")
                  ->orWhere('source',      'like', "%{$search}%")
                  ->orWhere('type',        'like', "%{$search}%");
            });
        }

        // ── Column filters ────────────────────────────────────────────────
        if ($v = $request->input('municipality')) $query->where('municipality', $v);
        if ($v = $request->input('type'))         $query->where('type', $v);
        if ($v = $request->input('purpose'))      $query->where('purpose', $v);
        if ($v = $request->input('source'))       $query->where('source', $v);

        // ── Sorting ───────────────────────────────────────────────────────
        $allowed  = ['ID', 'permit', 'grantee', 'municipality', 'purpose', 'date_app', 'charges', 'granted'];
        $sortField = in_array($request->input('sort'), $allowed) ? $request->input('sort') : 'ID';
        $sortDir   = $request->input('direction') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortField, $sortDir);

        // ── Paginate ──────────────────────────────────────────────────────
        $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100])
            ? (int) $request->input('per_page') : 25;

        $permits = $query->paginate($perPage)->withQueryString();

        // ── Filter option lists ───────────────────────────────────────────
        $municipalities = Permit::distinct()->whereNotNull('municipality')->orderBy('municipality')->pluck('municipality');
        $types          = Permit::distinct()->whereNotNull('type')->orderBy('type')->pluck('type');
        $purposes       = Permit::distinct()->whereNotNull('purpose')->orderBy('purpose')->pluck('purpose');
        $sources        = Permit::distinct()->whereNotNull('source')->orderBy('source')->pluck('source');

        return Inertia::render('Permits/Index', [
            'permits'        => $permits,
            'filters'        => (object) $request->only(['search', 'municipality', 'type', 'purpose', 'source', 'sort', 'direction', 'per_page']),
            'municipalities' => $municipalities,
            'types'          => $types,
            'purposes'       => $purposes,
            'sources'        => $sources,
        ]);
    }

    public function show(int $id): \Inertia\Response
    {
        $permit = Permit::findOrFail($id);

        return Inertia::render('Permits/Show', [
            'permit' => $permit,
        ]);
    }
}

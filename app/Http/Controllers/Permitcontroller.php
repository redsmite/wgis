<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Permit;
use App\Models\PermitPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PermitController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
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

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('permit',        'like', "%{$search}%")
                  ->orWhere('grantee',     'like', "%{$search}%")
                  ->orWhere('municipality','like', "%{$search}%")
                  ->orWhere('location',    'like', "%{$search}%")
                  ->orWhere('purpose',     'like', "%{$search}%")
                  ->orWhere('source',      'like', "%{$search}%")
                  ->orWhere('type',        'like', "%{$search}%");
            });
        }

        if ($v = $request->input('municipality')) $query->where('municipality', $v);
        if ($v = $request->input('type'))         $query->where('type', $v);
        if ($v = $request->input('purpose'))      $query->where('purpose', $v);
        if ($v = $request->input('source'))       $query->where('source', $v);

        // Remarks filter: 'with' = has remarks, 'without' = null/empty
        if ($remarks = $request->input('remarks')) {
            if ($remarks === 'with') {
                $query->whereNotNull('remarks')->where('remarks', '!=', '');
            } elseif ($remarks === 'without') {
                $query->where(fn($q) => $q->whereNull('remarks')->orWhere('remarks', ''));
            }
        }

        $allowed   = ['ID', 'permit', 'grantee', 'municipality', 'purpose', 'date_app', 'charges', 'granted'];
        $sortField = in_array($request->input('sort'), $allowed) ? $request->input('sort') : 'ID';
        $sortDir   = $request->input('direction') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortField, $sortDir);

        $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100])
            ? (int) $request->input('per_page') : 25;

        $permits = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Permits/Index', [
            'permits'        => $permits,
            'filters'        => (object) $request->only(['search', 'municipality', 'type', 'purpose', 'source', 'remarks', 'sort', 'direction', 'per_page']),
            'municipalities' => Permit::distinct()->whereNotNull('municipality')->orderBy('municipality')->pluck('municipality'),
            'types'          => Permit::distinct()->whereNotNull('type')->orderBy('type')->pluck('type'),
            'purposes'       => Permit::distinct()->whereNotNull('purpose')->orderBy('purpose')->pluck('purpose'),
            'sources'        => Permit::distinct()->whereNotNull('source')->orderBy('source')->pluck('source'),
        ]);
    }

    public function show(int $id): \Illuminate\Http\JsonResponse
    {
        $permit = Permit::findOrFail($id);
        $photos = PermitPhoto::where('permit_id', $id)->get()->map(fn($p) => [
            'id'            => $p->id,
            'type'          => $p->type,
            'original_name' => $p->original_name,
            'url'           => Storage::url($p->path),
        ]);

        return response()->json([
            'permit' => $permit,
            'photos' => $photos,
        ]);
    }

    public function update(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $permit = Permit::findOrFail($id);

        $validated = $request->validate([
            'region'       => 'nullable|string|max:50',
            'province'     => 'nullable|string|max:50',
            'municipality' => 'nullable|string|max:50',
            'permit'       => 'nullable|string|max:10',
            'grantee'      => 'nullable|string|max:255',
            'location'     => 'nullable|string',
            'source'       => 'nullable|string|max:20',
            'type'         => 'nullable|string|max:20',
            'latitude'     => 'nullable|string|max:25',
            'longitude'    => 'nullable|string|max:25',
            'charges'      => 'nullable|numeric',
            'granted'      => 'nullable|numeric',
            'purpose'      => 'nullable|string|max:30',
            'date_app'     => 'nullable|string|max:25',
            'remarks'      => 'nullable|string',
            'pdf'          => 'nullable|file|mimes:pdf|max:20480',
            'photos.*'     => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $permit->update(collect($validated)->except(['pdf', 'photos'])->toArray());

        // Upload PDF
        if ($request->hasFile('pdf')) {
            $file = $request->file('pdf');
            $path = $file->storeAs("permits/{$id}/pdf", Str::uuid().'.'.$file->extension(), 'public');
            PermitPhoto::create([
                'permit_id'     => $id,
                'filename'      => basename($path),
                'original_name' => $file->getClientOriginalName(),
                'path'          => $path,
                'type'          => 'pdf',
                'size'          => $file->getSize(),
            ]);
        }

        // Upload geotagged photos
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $path = $file->storeAs("permits/{$id}/photos", Str::uuid().'.'.$file->extension(), 'public');
                PermitPhoto::create([
                    'permit_id'     => $id,
                    'filename'      => basename($path),
                    'original_name' => $file->getClientOriginalName(),
                    'path'          => $path,
                    'type'          => 'photo',
                    'size'          => $file->getSize(),
                ]);
            }
        }

        return back()->with('success', 'Permit updated successfully.');
    }

    public function deletePhoto(int $photoId): \Illuminate\Http\JsonResponse
    {
        $photo = PermitPhoto::findOrFail($photoId);
        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(['deleted' => true]);
    }
}
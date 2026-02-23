<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ExternalSessionAuth
{
    public function handle(Request $request, Closure $next)
    {
        $sessionId = $request->query('session_id');

        // No session_id param → pass through (already-authed or public route)
        if (!$sessionId) {
            return $next($request);
        }

        // --------------------------------------------------
        // Look up external user from DENR core DB
        // --------------------------------------------------
        try {
            $external = DB::connection('denr_ncr')
                ->table('core_session as s')
                ->join('core_users as u', 's.userid', '=', 'u.id')
                ->select(
                    'u.id as external_user_id',
                    'u.username',
                    'u.email',
                    'u.first_name',
                    'u.middle_name',
                    'u.last_name',
                    'u.current_position as position',
                    'u.division'
                )
                ->where('s.session_id', $sessionId)
                ->where('s.guest', 0)
                ->first();
        } catch (\Exception $e) {
            Log::error('ExternalSessionAuth DB error: ' . $e->getMessage());
            abort(503, 'Authentication service unavailable.');
        }

        if (!$external) {
            abort(403, 'Invalid or expired external session.');
        }

        // --------------------------------------------------
        // Normalize values
        // --------------------------------------------------
        $email    = !empty($external->email)
            ? $external->email
            : $external->username . '@external.local';
        $position = $external->position ?? 'N/A';
        $division = $external->division ?? null;

        // --------------------------------------------------
        // If already logged in and it's the same user → sync & continue
        // --------------------------------------------------
        if (Auth::check()) {
            $current = Auth::user();

            if ((int) $current->external_user_id === (int) $external->external_user_id) {
                $current->update([
                    'name'        => $external->username,
                    'first_name'  => $external->first_name,
                    'last_name'   => $external->last_name,
                    'position'    => $position,
                    'division_id' => $division,
                    'email'       => $email,
                ]);

                return $next($request);
            }

            // Different user → logout first
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // --------------------------------------------------
        // Find or create local shadow user
        // --------------------------------------------------
        $user = User::where('external_user_id', $external->external_user_id)->first();

        if (!$user) {
            // Guard against duplicate email
            if (User::where('email', $email)->exists()) {
                $email = $external->username . '_' . $external->external_user_id . '@external.local';
            }

            $user = User::create([
                'name'             => $external->username,
                'first_name'       => $external->first_name,
                'last_name'        => $external->last_name,
                'position'         => $position,
                'division_id'      => $division,
                'email'            => $email,
                'user_type'        => 'user',
                'external_user_id' => $external->external_user_id,
            ]);
        } else {
            // Always sync latest data from core
            $user->update([
                'name'        => $external->username,
                'first_name'  => $external->first_name,
                'last_name'   => $external->last_name,
                'position'    => $position,
                'division_id' => $division,
                'email'       => $email,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        // Redirect to clean URL (strip ?session_id= from address bar)
        $cleanUrl = $request->url();
        $query    = $request->except('session_id');

        if (!empty($query)) {
            $cleanUrl .= '?' . http_build_query($query);
        }

        return redirect($cleanUrl);
    }
}

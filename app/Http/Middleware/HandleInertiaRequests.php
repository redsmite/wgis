<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'full_name'   => $request->user()->full_name,
                    'first_name'  => $request->user()->first_name,
                    'last_name'   => $request->user()->last_name,
                    'email'       => $request->user()->email,
                    'position'    => $request->user()->position,
                    'division_id' => $request->user()->division_id,
                    'user_type'   => $request->user()->user_type,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}

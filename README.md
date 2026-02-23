# DENR NCR — Laravel 11 + React (Inertia.js)
### External Session SSO via `?session_id=`

---

## ⚡ Quick Setup

```bash
# 1. Install PHP dependencies
composer install

# 2. Install JS dependencies
npm install

# 3. Set up environment
cp .env.example .env
php artisan key:generate

# 4. Run migrations (creates users, sessions tables)
php artisan migrate

# 5. Start dev servers
composer run dev
```

> **Note:** `composer install` must be run **inside this project folder** (where `artisan` lives).
> The error `Could not open input file: artisan` means you ran it from the wrong directory.

---

## 🔐 How Authentication Works

```
Browser visits: /dashboard?session_id=jetpahcj3ov43juqt1tkgikn7n
                                │
            ExternalSessionAuth middleware intercepts
                                │
        Queries denr_ncr.core_session JOIN core_users
                                │
              ┌─────────────────┴──────────────┐
           Valid?                           Invalid
              │                                │
    Find or create local user            abort(403)
              │
     Auth::login($user)
              │
    Redirect to /dashboard  ← clean URL, session_id stripped
```

After login the user has a normal Laravel session cookie. The `?session_id=` is only needed once per login.

---

## 📁 Project Structure

```
denr-app/
├── artisan                                   ← CLI entry point
├── public/index.php                          ← Web entry point
├── bootstrap/app.php                         ← Laravel 11 app config
├── bootstrap/providers.php
│
├── app/
│   ├── Http/
│   │   ├── Middleware/
│   │   │   ├── ExternalSessionAuth.php       ← 🔑 SSO middleware
│   │   │   └── HandleInertiaRequests.php     ← Shares auth.user to React
│   │   └── Controllers/
│   │       ├── HomeController.php
│   │       └── DashboardController.php
│   ├── Models/User.php
│   └── Providers/AppServiceProvider.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php                          ← Dual DB: mysql + denr_ncr
│   └── session.php
│
├── database/migrations/
│   └── ..._create_users_table.php            ← users + sessions tables
│
├── routes/web.php                            ← All routes
│
├── resources/
│   ├── views/app.blade.php                   ← Inertia root template
│   ├── css/app.css
│   └── js/
│       ├── app.jsx                           ← Inertia entrypoint
│       ├── Layouts/AppLayout.jsx             ← Sidebar + topbar
│       └── Pages/
│           ├── Auth/Login.jsx                ← SSO info page
│           └── Dashboard/Index.jsx           ← Main dashboard
│
├── composer.json
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---


SESSION_DRIVER=database   # requires sessions table — already in migration
```

---

## 🗄 Users Table

| Column              | Type    | Notes                                   |
|---------------------|---------|-----------------------------------------|
| `id`                | bigint  | Local PK                                |
| `name`              | string  | Username from core_users                |
| `first_name`        | string  | Synced from core                        |
| `last_name`         | string  | Synced from core                        |
| `email`             | string  | Unique; falls back to username@…        |
| `password`          | string  | **nullable** — SSO users have no password |
| `user_type`         | string  | `user` or `admin`                       |
| `position`          | string  | From `current_position`                 |
| `division_id`       | string  | From `division`                         |
| `external_user_id`  | bigint  | FK to core_users.id, unique             |

---

## ➕ Adding New Pages

**1. Controller method:**
```php
Route::get('/reports', [ReportController::class, 'index'])
    ->name('reports')
    ->middleware('auth');
```

**2. Controller:**
```php
public function index(): \Inertia\Response
{
    return Inertia::render('Reports/Index', ['data' => ...]);
}
```

**3. React page:**
```jsx
// resources/js/Pages/Reports/Index.jsx
import AppLayout from '@/Layouts/AppLayout';
export default function Reports({ data }) {
    return <AppLayout title="Reports">...</AppLayout>;
}
```

---

## ✅ Middleware Behaviour Summary

| Scenario | Result |
|----------|--------|
| `?session_id=` valid, new user | Creates local user, logs in, redirects (clean URL) |
| `?session_id=` valid, existing user | Syncs fields, logs in, redirects |
| `?session_id=` valid, same user already logged in | Syncs fields, continues |
| `?session_id=` valid, different user logged in | Logs out old user, logs in new user |
| `?session_id=` invalid / not found | `abort(403)` |
| No `?session_id=` | Passes through (existing session or public route) |
| Core DB unreachable | `abort(503)` |

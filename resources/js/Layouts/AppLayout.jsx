import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => router.post(route('logout'));

    return (
        <div className="min-h-screen flex" style={{ background: '#f0f7ff' }}>

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                transform transition-transform duration-300 ease-in-out shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0
            `} style={{
                background: 'linear-gradient(180deg, #0369a1 0%, #0284c7 30%, #0ea5e9 70%, #06b6d4 100%)',
                borderRight: '1px solid rgba(255,255,255,0.15)'
            }}>

                {/* Sidebar shimmer overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-none">
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 60%),
                                              radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)`
                        }} />
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3 px-6 py-5 flex-shrink-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                        <MapIcon />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">DENR NCR</p>
                        <p className="text-sky-100 text-xs opacity-80">WRUS Geographic Information System</p>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="relative flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="text-sky-200 text-xs font-semibold uppercase tracking-widest px-3 mb-3 opacity-60">
                        Navigation
                    </p>
                    <NavLink href={route('dashboard')} icon={<HomeIcon />} label="Dashboard" />
                    <NavLink href={route('permits.index')} icon={<PermitIcon />} label="Water Permits" />
                </nav>

                {/* User footer */}
                <div className="relative px-4 py-4 flex-shrink-0"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sky-900 text-sm font-bold flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                            {user?.first_name?.[0]?.toUpperCase() ?? user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">
                                {user?.full_name || user?.name}
                            </p>
                            <p className="text-sky-100 text-xs truncate opacity-70">{user?.position ?? 'N/A'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full text-left px-3 py-2 rounded-lg text-sky-100 text-sm flex items-center gap-2 transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <LogoutIcon />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Overlay (mobile) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Main ────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="px-4 py-3 flex items-center gap-4 flex-shrink-0"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(14,165,233,0.15)',
                        boxShadow: '0 1px 20px rgba(14,165,233,0.08)'
                    }}>
                    <button className="lg:hidden" style={{ color: '#0284c7' }} onClick={() => setSidebarOpen(true)}>
                        <MenuIcon />
                    </button>
                    <h1 className="flex-1 text-lg font-semibold" style={{ color: '#0c4a6e' }}>{title}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm hidden sm:block" style={{ color: '#0369a1' }}>{user?.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                            style={{ background: 'rgba(14,165,233,0.12)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.2)' }}>
                            {user?.user_type}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavLink({ href, icon, label }) {
    const { url } = usePage();
    const path = href.replace(window.location.origin, '');
    const isActive = url === path || url.startsWith(path + '/');

    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={isActive
                ? { background: 'rgba(255,255,255,0.25)', color: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)' }
                : { color: 'rgba(224,242,254,0.85)' }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
            {icon}
            {label}
        </Link>
    );
}

// Icons
const MapIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
    </svg>
);
const HomeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const LogoutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const PermitIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

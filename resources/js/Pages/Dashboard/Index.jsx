import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome banner */}
            <div className="rounded-2xl p-6 text-white mb-6 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 40%, #0ea5e9 70%, #06b6d4 100%)',
                    boxShadow: '0 8px 32px rgba(3,105,161,0.35)'
                }}>
                {/* Water ripple effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)', filter: 'blur(20px)' }} />
                    <div className="absolute top-2 right-24 w-32 h-32 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }} />
                </div>

                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sky-100 text-sm font-medium">{greeting()},</p>
                        <h2 className="text-2xl font-bold mt-0.5">{user.full_name || user.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {user.position && <Badge icon={<BriefcaseIcon />} label={user.position} />}
                            {/* ✅ CHANGED: division_id → division_name */}
                            {user.division_name && <Badge icon={<OfficeIcon />} label={user.division_name} />}
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                        {user.first_name?.[0]?.toUpperCase() ?? user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <StatCard label="Total Users"  value={stats.totalUsers}   icon={<UsersIcon />}  accent="#0284c7" bg="rgba(14,165,233,0.08)" />
                <StatCard label="Account Type" value={user.user_type}     icon={<ShieldIcon />} accent="#0891b2" bg="rgba(8,145,178,0.08)"  capitalize />
                <StatCard label="Auth Method"  value="SSO / Session"      icon={<KeyIcon />}    accent="#0369a1" bg="rgba(3,105,161,0.08)"  />
            </div>

            {/* Profile card */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 4px 24px rgba(3,105,161,0.08)' }}>
                <div className="px-6 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(14,165,233,0.12)', background: 'linear-gradient(90deg, rgba(14,165,233,0.05), transparent)' }}>
                    <h3 className="font-semibold" style={{ color: '#0c4a6e' }}>Your Profile</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.2)' }}>
                        Synced from Core
                    </span>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <ProfileField label="Username"   value={user.name} />
                    <ProfileField label="Email"      value={user.email} />
                    <ProfileField label="First Name" value={user.first_name} />
                    <ProfileField label="Last Name"  value={user.last_name} />
                    <ProfileField label="Position"   value={user.position} />
                    {/* ✅ CHANGED: division_id → division_name */}
                    <ProfileField label="Division"   value={user.division_name} />
                </div>
            </div>
        </AppLayout>
    );
}

function Badge({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.25)' }}>
            {icon}{label}
        </span>
    );
}

function StatCard({ label, value, icon, accent, bg, capitalize }) {
    return (
        <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#ffffff', border: `1px solid ${accent}22`, boxShadow: '0 2px 16px rgba(3,105,161,0.06)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg, color: accent }}>
                {icon}
            </div>
            <div>
                <p className="text-sm" style={{ color: '#64748b' }}>{label}</p>
                <p className={`text-xl font-bold ${capitalize ? 'capitalize' : ''}`} style={{ color: '#0c4a6e' }}>
                    {value ?? '—'}
                </p>
            </div>
        </div>
    );
}

function ProfileField({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{label}</dt>
            <dd className="text-sm font-medium" style={{ color: '#0c4a6e' }}>
                {value || <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 400 }}>Not set</span>}
            </dd>
        </div>
    );
}

// Icons
const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
);
const KeyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
    </svg>
);
const BriefcaseIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
);
const OfficeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
);

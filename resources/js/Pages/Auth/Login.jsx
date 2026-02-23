import { Head } from '@inertiajs/react';

export default function Login() {
    return (
        <>
            <Head title="Sign In" />
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2d4a 30%, #0a3d3a 65%, #062a22 100%)' }}>

                {/* Animated background layers */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px'
                        }} />

                    {/* Glowing orbs */}
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="absolute top-[40%] left-[30%] w-64 h-64 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', filter: 'blur(60px)' }} />

                    {/* Decorative rings */}
                    <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full border border-sky-500/20" />
                    <div className="absolute top-[12%] left-[8%] w-40 h-40 rounded-full border border-sky-500/10" />
                    <div className="absolute bottom-[15%] right-[8%] w-48 h-48 rounded-full border border-emerald-500/20" />
                    <div className="absolute bottom-[12%] right-[5%] w-64 h-64 rounded-full border border-emerald-500/10" />
                </div>

                <div className="relative w-full max-w-md">

                    {/* Top label */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5))' }} />
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase"
                            style={{ color: '#38bdf8' }}>
                            Secure Access Portal
                        </span>
                        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.5), transparent)' }} />
                    </div>

                    {/* Main card */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(56,189,248,0.15)',
                            boxShadow: '0 0 60px rgba(14,165,233,0.1), 0 25px 50px rgba(0,0,0,0.5)'
                        }}>

                        {/* Header */}
                        <div className="px-8 py-9 text-center relative"
                            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(16,185,129,0.15) 100%)', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>

                            {/* Logo circle */}
                            <div className="relative w-20 h-20 mx-auto mb-5">
                                <div className="absolute inset-0 rounded-full animate-pulse"
                                    style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.3), transparent)', filter: 'blur(8px)' }} />
                                <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(16,185,129,0.3))',
                                        border: '1px solid rgba(56,189,248,0.4)',
                                        boxShadow: '0 0 20px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                    }}>
                                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        style={{ color: '#7dd3fc' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold tracking-wide mb-1" style={{ color: '#e0f2fe' }}>
                                DENR NCR
                            </h1>
                            <p className="text-sm font-medium" style={{ color: '#7dd3fc' }}>
                                WRUS Geographic Information System
                            </p>

                            {/* Status indicator */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                        style={{ backgroundColor: '#34d399' }} />
                                    <span className="relative inline-flex rounded-full h-2 w-2"
                                        style={{ backgroundColor: '#10b981' }} />
                                </span>
                                <span className="text-xs" style={{ color: '#6ee7b7' }}>System Online</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-8">

                            {/* Warning row */}
                            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl"
                                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(251,191,36,0.15)' }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        style={{ color: '#fbbf24' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: '#fcd34d' }}>Authentication Required</p>
                                    <p className="text-xs" style={{ color: 'rgba(253,211,77,0.6)' }}>SSO login via DENR Core platform</p>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="space-y-3 mb-6">
                                {[
                                    { n: '01', text: 'Log in to the DENR Core system' },
                                    { n: '02', text: 'Navigate to WGIS from the core dashboard' },
                                    { n: '03', text: 'Your session authenticates automatically' },
                                ].map(({ n, text }) => (
                                    <div key={n} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.08)' }}>
                                        <span className="text-xs font-bold font-mono flex-shrink-0"
                                            style={{ color: '#38bdf8' }}>{n}</span>
                                        <div className="h-4 w-px flex-shrink-0" style={{ background: 'rgba(56,189,248,0.2)' }} />
                                        <p className="text-sm" style={{ color: '#bae6fd' }}>{text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer badge */}
                            <div className="flex items-center justify-center gap-2 pt-4"
                                style={{ borderTop: '1px solid rgba(56,189,248,0.1)' }}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"
                                    style={{ color: '#34d399' }}>
                                    <path fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd" />
                                </svg>
                                <span className="text-xs" style={{ color: 'rgba(110,231,183,0.7)' }}>
                                    Secured via external session authentication
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs mt-5" style={{ color: 'rgba(56,189,248,0.4)' }}>
                        Department of Environment and Natural Resources — NCR
                    </p>
                </div>
            </div>
        </>
    );
}

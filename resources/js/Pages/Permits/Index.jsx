import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useCallback } from 'react';

export default function PermitsIndex(props) {
    const permits        = props.permits        ?? { data: [], total: 0, from: 0, to: 0, current_page: 1, last_page: 1, links: [] };
    const filters        = props.filters        ?? {};
    const municipalities = props.municipalities ?? [];
    const types          = props.types          ?? [];
    const purposes       = props.purposes       ?? [];
    const sources        = props.sources        ?? [];

    const [search,       setSearch]       = useState(filters.search       ?? '');
    const [municipality, setMunicipality] = useState(filters.municipality ?? '');
    const [type,         setType]         = useState(filters.type         ?? '');
    const [purpose,      setPurpose]      = useState(filters.purpose      ?? '');
    const [source,       setSource]       = useState(filters.source       ?? '');
    const [perPage,      setPerPage]      = useState(filters.per_page     ?? '25');
    const [sort,         setSort]         = useState(filters.sort         ?? 'ID');
    const [direction,    setDirection]    = useState(filters.direction     ?? 'asc');

    const applyFilters = useCallback((overrides = {}) => {
        router.get(route('permits.index'), {
            search, municipality, type, purpose, source,
            per_page: perPage, sort, direction,
            ...overrides,
        }, { preserveState: true, replace: true });
    }, [search, municipality, type, purpose, source, perPage, sort, direction]);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleSort = (field) => {
        const newDir = sort === field && direction === 'asc' ? 'desc' : 'asc';
        setSort(field);
        setDirection(newDir);
        applyFilters({ sort: field, direction: newDir });
    };

    const handleFilter = (key, value) => {
        const updates = { search, municipality, type, purpose, source, per_page: perPage, [key]: value };
        if (key === 'municipality') setMunicipality(value);
        if (key === 'type')         setType(value);
        if (key === 'purpose')      setPurpose(value);
        if (key === 'source')       setSource(value);
        if (key === 'per_page')     setPerPage(value);
        applyFilters(updates);
    };

    const clearFilters = () => {
        setSearch(''); setMunicipality(''); setType('');
        setPurpose(''); setSource(''); setPerPage('25');
        router.get(route('permits.index'), {}, { replace: true });
    };

    const hasFilters = search || municipality || type || purpose || source;

    const SortIcon = ({ field }) => {
        if (sort !== field) return <span className="ml-1 opacity-30">↕</span>;
        return <span className="ml-1" style={{ color: '#0ea5e9' }}>{direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const columns = [
        { label: '#',            field: 'ID' },
        { label: 'Permit No.',   field: 'permit' },
        { label: 'Grantee',      field: 'grantee' },
        { label: 'Municipality', field: 'municipality' },
        { label: 'Location',     field: null },
        { label: 'Source',       field: null },
        { label: 'Type',         field: null },
        { label: 'Purpose',      field: 'purpose' },
        { label: 'Charges',      field: 'charges' },
        { label: 'Granted',      field: 'granted' },
        { label: 'Date Applied', field: 'date_app' },
        { label: 'Remarks',      field: null },
    ];

    return (
        <AppLayout title="Water Permits">
            <Head title="Permits" />

            {/* Header */}
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#0c4a6e' }}>Water Permits</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                        {(permits.total ?? 0).toLocaleString()} total records
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0284c7' }}>
                    <DocIcon /> Water Permits National Capital Region
                </div>
            </div>

            {/* Search & Filters */}
            <div className="rounded-2xl p-5 mb-5"
                style={{ background: '#fff', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 2px 16px rgba(3,105,161,0.06)' }}>

                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search permit, grantee, location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e' }}
                        />
                    </div>
                    <button type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}>
                        Search
                    </button>
                    {hasFilters && (
                        <button type="button" onClick={clearFilters}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium"
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                            Clear
                        </button>
                    )}
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FilterSelect label="Municipality" value={municipality} onChange={v => handleFilter('municipality', v)} options={municipalities} />
                    <FilterSelect label="Type"         value={type}         onChange={v => handleFilter('type', v)}         options={types} />
                    <FilterSelect label="Purpose"      value={purpose}      onChange={v => handleFilter('purpose', v)}      options={purposes} />
                    <FilterSelect label="Source"       value={source}       onChange={v => handleFilter('source', v)}       options={sources} />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 2px 16px rgba(3,105,161,0.06)' }}>

                <div className="px-5 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(14,165,233,0.1)', background: 'linear-gradient(90deg, rgba(14,165,233,0.04), transparent)' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                        Showing {permits.from ?? 0}–{permits.to ?? 0} of {(permits.total ?? 0).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#94a3b8' }}>Rows:</span>
                        <select value={perPage} onChange={e => handleFilter('per_page', e.target.value)}
                            className="text-xs rounded-lg px-2 py-1 outline-none"
                            style={{ border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e', background: '#f8fafc' }}>
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(14,165,233,0.04)', borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
                                {columns.map(({ label, field }) => (
                                    <th key={label}
                                        onClick={() => field && handleSort(field)}
                                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${field ? 'cursor-pointer' : ''}`}
                                        style={{ color: '#64748b' }}>
                                        {label}{field && <SortIcon field={field} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(permits.data ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-4 py-16 text-center" style={{ color: '#94a3b8' }}>
                                        <div className="flex flex-col items-center gap-2">
                                            <EmptyIcon />
                                            <span className="text-sm">No permits found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (permits.data ?? []).map((p, i) => (
                                <tr key={p.ID}
                                    style={{
                                        borderBottom: '1px solid rgba(14,165,233,0.06)',
                                        background: i % 2 === 0 ? '#fff' : 'rgba(240,247,255,0.5)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'rgba(240,247,255,0.5)'}>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{p.ID}</td>
                                    <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap" style={{ color: '#0284c7' }}>{p.permit ?? '—'}</td>
                                    <td className="px-4 py-3 font-medium max-w-48 truncate" style={{ color: '#0c4a6e' }} title={p.grantee}>{p.grantee ?? '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#334155' }}>{p.municipality ?? '—'}</td>
                                    <td className="px-4 py-3 max-w-xs truncate text-xs" style={{ color: '#475569' }} title={p.location}>{p.location ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7' }}>
                                            {p.source ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{ background: 'rgba(8,145,178,0.1)', color: '#0891b2' }}>
                                            {p.type ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>{p.purpose ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: '#334155' }}>
                                        {p.charges != null ? Number(p.charges).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: '#334155' }}>
                                        {p.granted != null ? Number(p.granted).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: '#64748b' }}>{p.date_app ?? '—'}</td>
                                    <td className="px-4 py-3 max-w-xs truncate text-xs" style={{ color: '#64748b' }} title={p.remarks}>{p.remarks ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(permits.last_page ?? 1) > 1 && (
                    <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                        style={{ borderTop: '1px solid rgba(14,165,233,0.1)' }}>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>
                            Page {permits.current_page} of {permits.last_page}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {(permits.links ?? []).map((link, i) => (
                                <Link key={i} href={link.url ?? '#'}
                                    preserveState
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                                    style={link.active
                                        ? { background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', color: '#fff' }
                                        : { background: '#f1f5f9', color: '#475569' }}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function FilterSelect({ label, value, onChange, options = [] }) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e', background: '#f8fafc' }}>
                <option value="">All</option>
                {(options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const DocIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const EmptyIcon = () => (
    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

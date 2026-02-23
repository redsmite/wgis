import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useCallback, useRef } from 'react';

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
    const [remarks,      setRemarks]      = useState(filters.remarks      ?? '');
    const [perPage,      setPerPage]      = useState(filters.per_page     ?? '25');
    const [sort,         setSort]         = useState(filters.sort         ?? 'ID');
    const [direction,    setDirection]    = useState(filters.direction     ?? 'asc');

    // Modal state
    const [viewModal,   setViewModal]   = useState(null);   // { permit, photos }
    const [editModal,   setEditModal]   = useState(null);   // permit object
    const [loadingId,   setLoadingId]   = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm,    setEditForm]    = useState({});
    const [newPdf,      setNewPdf]      = useState(null);
    const [newPhotos,   setNewPhotos]   = useState([]);
    const [activeTab,   setActiveTab]   = useState('pdf');
    const pdfRef   = useRef();
    const photoRef = useRef();

    const applyFilters = useCallback((overrides = {}) => {
        router.get(route('permits.index'), {
            search, municipality, type, purpose, source, remarks,
            per_page: perPage, sort, direction, ...overrides,
        }, { preserveState: true, replace: true });
    }, [search, municipality, type, purpose, source, remarks, perPage, sort, direction]);

    const handleSearch = (e) => { e.preventDefault(); applyFilters(); };

    const handleSort = (field) => {
        const newDir = sort === field && direction === 'asc' ? 'desc' : 'asc';
        setSort(field); setDirection(newDir);
        applyFilters({ sort: field, direction: newDir });
    };

    const handleFilter = (key, value) => {
        const updates = { search, municipality, type, purpose, source, remarks, per_page: perPage, [key]: value };
        if (key === 'municipality') setMunicipality(value);
        if (key === 'type')         setType(value);
        if (key === 'purpose')      setPurpose(value);
        if (key === 'source')       setSource(value);
        if (key === 'remarks')      setRemarks(value);
        if (key === 'per_page')     setPerPage(value);
        applyFilters(updates);
    };

    const clearFilters = () => {
        setSearch(''); setMunicipality(''); setType('');
        setPurpose(''); setSource(''); setRemarks(''); setPerPage('25');
        router.get(route('permits.index'), {}, { replace: true });
    };

    const hasFilters = search || municipality || type || purpose || source || remarks;

    // ── View Modal ────────────────────────────────────────────────────────
    const openView = async (permit) => {
        setLoadingId(permit.ID);
        try {
            const res = await fetch(route('permits.show', permit.ID));
            const data = await res.json();
            setViewModal(data);
            setActiveTab('pdf');
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    // ── Edit Modal ────────────────────────────────────────────────────────
    const openEdit = async (permit) => {
        setLoadingId(permit.ID);
        try {
            const res = await fetch(route('permits.show', permit.ID));
            const data = await res.json();
            setEditForm({ ...data.permit });
            setEditModal(data);
            setNewPdf(null);
            setNewPhotos([]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        const fd = new FormData();
        Object.entries(editForm).forEach(([k, v]) => {
            if (v != null && k !== 'ID') fd.append(k, v);
        });
        fd.append('_method', 'POST');
        if (newPdf) fd.append('pdf', newPdf);
        newPhotos.forEach(f => fd.append('photos[]', f));

        try {
            await fetch(route('permits.update', editModal.permit.ID), {
                method: 'POST',
                body: fd,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
            });
            setEditModal(null);
            router.reload({ preserveScroll: true });
        } catch (e) {
            console.error(e);
        } finally {
            setEditLoading(false);
        }
    };

    const deletePhoto = async (photoId) => {
        if (!confirm('Delete this file?')) return;
        await fetch(route('permits.photos.delete', photoId), {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '' },
        });
        setEditModal(prev => ({
            ...prev,
            photos: prev.photos.filter(p => p.id !== photoId),
        }));
    };

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
        { label: 'Actions',      field: null },
    ];

    const hasRemarks = (p) => p.remarks && p.remarks.trim() !== '';

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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.4)' }} />
                        <span style={{ color: '#64748b' }}>Has remarks</span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="rounded-2xl p-5 mb-5"
                style={{ background: '#fff', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 2px 16px rgba(3,105,161,0.06)' }}>

                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        <input type="text" placeholder="Search permit, grantee, location..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e' }} />
                    </div>
                    <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <FilterSelect label="Municipality" value={municipality} onChange={v => handleFilter('municipality', v)} options={municipalities} />
                    <FilterSelect label="Type"         value={type}         onChange={v => handleFilter('type', v)}         options={types} />
                    <FilterSelect label="Purpose"      value={purpose}      onChange={v => handleFilter('purpose', v)}      options={purposes} />
                    <FilterSelect label="Source"       value={source}       onChange={v => handleFilter('source', v)}       options={sources} />
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Remarks</label>
                        <select value={remarks} onChange={e => handleFilter('remarks', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                            style={{ border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e', background: '#f8fafc' }}>
                            <option value="">All</option>
                            <option value="with">Has Remarks</option>
                            <option value="without">No Remarks</option>
                        </select>
                    </div>
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
                                    <th key={label} onClick={() => field && handleSort(field)}
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
                                    <td colSpan={13} className="px-4 py-16 text-center" style={{ color: '#94a3b8' }}>
                                        <div className="flex flex-col items-center gap-2"><EmptyIcon /><span>No permits found</span></div>
                                    </td>
                                </tr>
                            ) : (permits.data ?? []).map((p, i) => {
                                const inspected = hasRemarks(p);
                                const base = inspected
                                    ? (i % 2 === 0 ? 'rgba(219,234,254,0.4)' : 'rgba(191,219,254,0.3)')
                                    : (i % 2 === 0 ? '#fff' : 'rgba(240,247,255,0.5)');
                                return (
                                    <tr key={p.ID}
                                        style={{ borderBottom: '1px solid rgba(14,165,233,0.06)', background: base }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = base}>
                                        <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                                            <div className="flex items-center gap-1.5">
                                                {inspected && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#0ea5e9' }} />}
                                                {p.ID}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap" style={{ color: '#0284c7' }}>{p.permit ?? '—'}</td>
                                        <td className="px-4 py-3 font-medium max-w-48 truncate" style={{ color: '#0c4a6e' }} title={p.grantee}>{p.grantee ?? '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#334155' }}>{p.municipality ?? '—'}</td>
                                        <td className="px-4 py-3 max-w-36 truncate text-xs" style={{ color: '#475569' }} title={p.location}>{p.location ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7' }}>
                                                {p.source ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(8,145,178,0.1)', color: '#0891b2' }}>
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
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => openView(p)} disabled={loadingId === p.ID}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                                    style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.2)' }}>
                                                    {loadingId === p.ID ? '…' : 'View'}
                                                </button>
                                                <button onClick={() => openEdit(p)} disabled={loadingId === p.ID}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                                    style={{ background: 'rgba(3,105,161,0.08)', color: '#0369a1', border: '1px solid rgba(3,105,161,0.2)' }}>
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {(permits.last_page ?? 1) > 1 && (
                    <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                        style={{ borderTop: '1px solid rgba(14,165,233,0.1)' }}>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>Page {permits.current_page} of {permits.last_page}</span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {(permits.links ?? []).map((link, i) => (
                                <Link key={i} href={link.url ?? '#'} preserveState
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                                    style={link.active ? { background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', color: '#fff' } : { background: '#f1f5f9', color: '#475569' }}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── VIEW MODAL ─────────────────────────────────────────────── */}
            {viewModal && (
                <Modal onClose={() => setViewModal(null)} title={`Permit #${viewModal.permit.permit ?? viewModal.permit.ID}`}>
                    <div className="space-y-4">
                        {/* Permit details grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                ['Grantee',      viewModal.permit.grantee],
                                ['Municipality', viewModal.permit.municipality],
                                ['Location',     viewModal.permit.location],
                                ['Source',       viewModal.permit.source],
                                ['Type',         viewModal.permit.type],
                                ['Purpose',      viewModal.permit.purpose],
                                ['Charges',      viewModal.permit.charges],
                                ['Granted',      viewModal.permit.granted],
                                ['Date Applied', viewModal.permit.date_app],
                                ['Remarks',      viewModal.permit.remarks],
                            ].map(([label, val]) => (
                                <div key={label}>
                                    <dt className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</dt>
                                    <dd className="text-sm" style={{ color: '#0c4a6e' }}>{val ?? '—'}</dd>
                                </div>
                            ))}
                        </div>

                        {/* Files tabs */}
                        <div style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }} className="pt-4">
                            <div className="flex gap-2 mb-3">
                                {['pdf', 'photo'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                                        style={activeTab === t
                                            ? { background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', color: '#fff' }
                                            : { background: '#f1f5f9', color: '#64748b' }}>
                                        {t === 'pdf' ? '📄 PDF' : '📷 Photos'}
                                        <span className="ml-1 opacity-70">
                                            ({viewModal.photos.filter(p => p.type === t).length})
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'pdf' ? (
                                <div className="space-y-2">
                                    {viewModal.photos.filter(p => p.type === 'pdf').length === 0
                                        ? <p className="text-xs text-center py-6" style={{ color: '#94a3b8' }}>No PDF uploaded</p>
                                        : viewModal.photos.filter(p => p.type === 'pdf').map(f => (
                                            <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                                style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                                                <span className="text-xl">📄</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#0284c7' }}>{f.original_name}</p>
                                                    <p className="text-xs" style={{ color: '#94a3b8' }}>Click to open</p>
                                                </div>
                                            </a>
                                        ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {viewModal.photos.filter(p => p.type === 'photo').length === 0
                                        ? <p className="col-span-2 text-xs text-center py-6" style={{ color: '#94a3b8' }}>No photos uploaded</p>
                                        : viewModal.photos.filter(p => p.type === 'photo').map(f => (
                                            <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                                                className="block rounded-xl overflow-hidden"
                                                style={{ border: '1px solid rgba(14,165,233,0.15)' }}>
                                                <img src={f.url} alt={f.original_name}
                                                    className="w-full h-28 object-cover hover:opacity-90 transition-opacity" />
                                                <p className="px-2 py-1 text-xs truncate" style={{ color: '#64748b' }}>{f.original_name}</p>
                                            </a>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── EDIT MODAL ─────────────────────────────────────────────── */}
            {editModal && (
                <Modal onClose={() => setEditModal(null)} title={`Edit Permit #${editModal.permit.permit ?? editModal.permit.ID}`} wide>
                    <form onSubmit={handleEditSubmit} className="space-y-5">

                        {/* Fields grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'permit',       label: 'Permit No.' },
                                { key: 'grantee',      label: 'Grantee' },
                                { key: 'region',       label: 'Region' },
                                { key: 'province',     label: 'Province' },
                                { key: 'municipality', label: 'Municipality' },
                                { key: 'source',       label: 'Source' },
                                { key: 'type',         label: 'Type' },
                                { key: 'purpose',      label: 'Purpose' },
                                { key: 'charges',      label: 'Charges' },
                                { key: 'granted',      label: 'Granted (cu.m/day)' },
                                { key: 'date_app',     label: 'Date Applied' },
                                { key: 'latitude',     label: 'Latitude' },
                                { key: 'longitude',    label: 'Longitude' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{label}</label>
                                    <input type="text" value={editForm[key] ?? ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e' }} />
                                </div>
                            ))}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Location</label>
                                <input type="text" value={editForm.location ?? ''} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={{ background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e' }} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Remarks</label>
                                <textarea rows={3} value={editForm.remarks ?? ''} onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', color: '#0c4a6e' }} />
                            </div>
                        </div>

                        {/* Existing files */}
                        {editModal.photos.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }} className="pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Existing Files</p>
                                <div className="space-y-2">
                                    {editModal.photos.map(f => (
                                        <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                                            style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)' }}>
                                            <span className="text-lg">{f.type === 'pdf' ? '📄' : '📷'}</span>
                                            <span className="flex-1 text-sm truncate" style={{ color: '#0c4a6e' }}>{f.original_name}</span>
                                            <a href={f.url} target="_blank" rel="noreferrer"
                                                className="text-xs px-2 py-1 rounded-lg" style={{ color: '#0284c7', background: 'rgba(14,165,233,0.1)' }}>
                                                View
                                            </a>
                                            <button type="button" onClick={() => deletePhoto(f.id)}
                                                className="text-xs px-2 py-1 rounded-lg" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}>
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload new files */}
                        <div style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }} className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Upload PDF</p>
                                <div onClick={() => pdfRef.current?.click()} className="cursor-pointer rounded-xl p-4 text-center transition-all"
                                    style={{ border: '2px dashed rgba(14,165,233,0.3)', background: newPdf ? 'rgba(14,165,233,0.06)' : '#f8fafc' }}>
                                    <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
                                        onChange={e => setNewPdf(e.target.files[0])} />
                                    <p className="text-sm" style={{ color: '#0284c7' }}>
                                        {newPdf ? `✅ ${newPdf.name}` : '📄 Click to upload PDF'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Upload Geotagged Photos</p>
                                <div onClick={() => photoRef.current?.click()} className="cursor-pointer rounded-xl p-4 text-center transition-all"
                                    style={{ border: '2px dashed rgba(14,165,233,0.3)', background: newPhotos.length ? 'rgba(14,165,233,0.06)' : '#f8fafc' }}>
                                    <input ref={photoRef} type="file" accept="image/*" multiple className="hidden"
                                        onChange={e => setNewPhotos(Array.from(e.target.files))} />
                                    <p className="text-sm" style={{ color: '#0284c7' }}>
                                        {newPhotos.length ? `✅ ${newPhotos.length} photo(s) selected` : '📷 Click to upload photos'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setEditModal(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                                style={{ background: '#f1f5f9', color: '#64748b' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={editLoading}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', opacity: editLoading ? 0.7 : 1 }}>
                                {editLoading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AppLayout>
    );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────
function Modal({ onClose, title, children, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(12,74,110,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full rounded-2xl overflow-hidden flex flex-col"
                style={{
                    maxWidth: wide ? '720px' : '540px',
                    maxHeight: '90vh',
                    background: '#fff',
                    boxShadow: '0 25px 60px rgba(3,105,161,0.25)',
                    border: '1px solid rgba(14,165,233,0.2)',
                }}>
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid rgba(14,165,233,0.12)', background: 'linear-gradient(90deg, rgba(14,165,233,0.06), transparent)' }}>
                    <h3 className="font-semibold text-base" style={{ color: '#0c4a6e' }}>{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0284c7' }}>✕</button>
                </div>
                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────
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
const EmptyIcon = () => (
    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

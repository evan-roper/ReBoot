import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, X, Package2, Pencil, Trash2, CheckCircle2, Link2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BoardListing, DeviceType, Condition, EquipmentRecord } from '../types/equipment';
import { ConditionBadge } from '../components/Badges';

const DEVICE_TYPE_OPTIONS: (DeviceType | '')[] = [
  '', 'Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Networking', 'Storage', 'GPU', 'CPU', 'RAM', 'Printer', 'Custom',
];
const CONDITION_OPTIONS: (Condition | '')[] = ['', 'Working', 'Needs repair', 'Untested', 'Nonfunctional'];

function generateId() {
  return `surplus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Convert structured specs object to a readable string for the listing form. */
function specSummaryFromRecord(specs: unknown): string {
  if (!specs || typeof specs !== 'object') return '';
  const s = specs as Record<string, unknown>;
  const parts: string[] = [];
  if (s.cpuModel) parts.push(String(s.cpuModel));
  if (s.coreCount) parts.push(`${s.coreCount} cores`);
  if (s.ramGB) parts.push(`${s.ramGB} GB RAM`);
  if (s.storageGB) parts.push(`${s.storageGB} GB ${s.storageType ?? ''}`);
  if (s.dedicatedGPU === 'Present' && s.gpuModel) parts.push(`GPU: ${s.gpuModel}${s.gpuVramGB ? ` ${s.gpuVramGB}GB VRAM` : ''}`);
  if (s.vaRating) parts.push(`${s.vaRating}VA`);
  if (s.screenSizeInch) parts.push(`${s.screenSizeInch}"`);
  if (s.resolution) parts.push(String(s.resolution));
  if (s.capacityGB) parts.push(`${s.capacityGB} GB`);
  if (s.interface) parts.push(String(s.interface));
  if (s.portCount) parts.push(`${s.portCount} ports`);
  if (s.notes) parts.push(String(s.notes));
  return parts.filter(Boolean).join(', ');
}

interface ListingFormProps {
  existing?: BoardListing;
  prefill?: Pick<EquipmentRecord, 'name' | 'deviceType' | 'quantity' | 'condition' | 'specs'> & { inventoryRecordId: string };
  onClose: () => void;
  onSaved: () => void;
}

function ListingForm({ existing, prefill, onClose, onSaved }: ListingFormProps) {
  const { addBoardListing, updateBoardListing } = useApp();
  const [form, setForm] = useState({
    companyName: existing?.companyName ?? '',
    contactEmail: existing?.contactEmail ?? '',
    deviceType: existing?.deviceType ?? prefill?.deviceType ?? ('' as DeviceType | ''),
    name: existing?.name ?? prefill?.name ?? '',
    quantity: existing?.quantity ?? prefill?.quantity ?? 1,
    condition: existing?.condition ?? prefill?.condition ?? ('' as Condition | ''),
    specs: existing?.specs ?? (prefill ? specSummaryFromRecord(prefill.specs) : ''),
    location: existing?.location ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.contactEmail.trim()) e.contactEmail = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email';
    if (!form.deviceType) e.deviceType = 'Required';
    if (!form.name.trim()) e.name = 'Required';
    if (form.quantity < 1) e.quantity = 'Must be at least 1';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const now = new Date().toISOString();
    if (existing) {
      updateBoardListing({
        ...existing,
        ...form,
        deviceType: form.deviceType as DeviceType,
        condition: form.condition || undefined,
        updatedAt: now,
      });
    } else {
      addBoardListing({
        id: generateId(),
        kind: 'surplus',
        ...form,
        deviceType: form.deviceType as DeviceType,
        condition: form.condition || undefined,
        status: 'available',
        postedAt: now,
        updatedAt: now,
        inventoryRecordId: prefill?.inventoryRecordId,
      });
    }
    onSaved();
  }

  function field(label: string, key: keyof typeof form, input: React.ReactNode) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {input}
        {errors[key] && <p className="text-xs text-red-600 mt-0.5">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-apptext">{existing ? 'Edit Surplus Listing' : 'Post Surplus Equipment'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Company Name', 'companyName',
              <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            )}
            {field('Contact Email', 'contactEmail',
              <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            )}
          </div>
          {field('Equipment Name / Description', 'name',
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dell OptiPlex 7050 Desktops"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field('Device Type', 'deviceType',
              <select value={form.deviceType} onChange={e => setForm(f => ({ ...f, deviceType: e.target.value as DeviceType | '' }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                {DEVICE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'Select type'}</option>)}
              </select>
            )}
            {field('Quantity', 'quantity',
              <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            )}
            {field('Condition', 'condition',
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as Condition | '' }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c || 'Not specified'}</option>)}
              </select>
            )}
          </div>
          {field('Specs / Notes', 'specs',
            <textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))}
              rows={3} placeholder="CPU, RAM, storage, any defects, accessories included…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          )}
          {field('Location (optional)', 'location',
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="City, State or Region"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">
              {existing ? 'Save Changes' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SurplusPage() {
  const { boardListings, updateBoardListing, deleteBoardListing, pendingSurplusPrefill, inventory } = useApp();
  const surplus = useMemo(() => boardListings.filter(l => l.kind === 'surplus'), [boardListings]);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<BoardListing | undefined>(undefined);
  const [prefill, setPrefill] = useState<ListingFormProps['prefill'] | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DeviceType | ''>('');
  const [toast, setToast] = useState<string | null>(null);

  // Pick up prefill from inventory navigation
  useEffect(() => {
    if (pendingSurplusPrefill.current) {
      setPrefill(pendingSurplusPrefill.current);
      setEditTarget(undefined);
      setShowForm(true);
      pendingSurplusPrefill.current = null;
    }
  }, [pendingSurplusPrefill]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleMarkFulfilled(listing: BoardListing) {
    updateBoardListing({ ...listing, status: 'fulfilled', updatedAt: new Date().toISOString() });
    showToast('Listing marked as fulfilled.');
  }

  function handleDelete(id: string) {
    deleteBoardListing(id);
    setDeleteConfirm(null);
    showToast('Listing removed.');
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return surplus.filter(l => {
      const matchSearch = !q ||
        l.name.toLowerCase().includes(q) ||
        l.companyName.toLowerCase().includes(q) ||
        l.specs.toLowerCase().includes(q) ||
        (l.location ?? '').toLowerCase().includes(q);
      const matchType = !typeFilter || l.deviceType === typeFilter;
      return matchSearch && matchType;
    });
  }, [surplus, search, typeFilter]);

  const available = filtered.filter(l => l.status === 'available');
  const fulfilled = filtered.filter(l => l.status === 'fulfilled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Surplus Equipment Board</h1>
          <p className="text-gray-500 text-sm mt-1">
            Companies listing surplus IT equipment available for reuse or transfer.
          </p>
          {surplus.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {surplus.filter(l => l.status === 'available').length} active listing{surplus.filter(l => l.status === 'available').length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary self-start sm:self-auto"
        >
          <Plus size={16} /> Post Surplus
        </button>
      </div>

      {/* Filters */}
      {surplus.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name, company, specs, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as DeviceType | '')}
            className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Filter by device type"
          >
            {DEVICE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
          </select>
          {(search || typeFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {surplus.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
            <Package2 size={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-apptext mb-2">No surplus listings yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Companies can post surplus IT equipment here so others can find and reuse it.
          </p>
          <button
            onClick={() => { setEditTarget(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary mx-auto"
          >
            <Plus size={16} /> Post Surplus Equipment
          </button>
        </div>
      )}

      {/* Available listings */}
      {available.length > 0 && (
        <div className="space-y-3">
          {available.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              linkedRecord={listing.inventoryRecordId ? inventory.find(r => r.id === listing.inventoryRecordId) : undefined}
              onEdit={() => { setEditTarget(listing); setShowForm(true); }}
              onDelete={() => setDeleteConfirm(listing.id)}
              onMarkFulfilled={() => handleMarkFulfilled(listing)}
            />
          ))}
        </div>
      )}

      {/* Fulfilled listings */}
      {fulfilled.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fulfilled</h2>
          <div className="space-y-3 opacity-60">
            {fulfilled.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                linkedRecord={listing.inventoryRecordId ? inventory.find(r => r.id === listing.inventoryRecordId) : undefined}
                onEdit={() => { setEditTarget(listing); setShowForm(true); }}
                onDelete={() => setDeleteConfirm(listing.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Forms and modals */}
      {showForm && (
        <ListingForm
          existing={editTarget}
          prefill={editTarget ? undefined : prefill}
          onClose={() => { setShowForm(false); setEditTarget(undefined); setPrefill(undefined); }}
          onSaved={() => { setShowForm(false); setEditTarget(undefined); setPrefill(undefined); showToast(editTarget ? 'Listing updated.' : 'Listing posted.'); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-2">Remove listing?</h2>
            <p className="text-sm text-gray-600 mb-6">
              "{surplus.find(l => l.id === deleteConfirm)?.name}" will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-apptext text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: BoardListing;
  linkedRecord?: EquipmentRecord;
  onEdit: () => void;
  onDelete: () => void;
  onMarkFulfilled?: () => void;
}

function ListingCard({ listing, linkedRecord, onEdit, onDelete, onMarkFulfilled }: ListingCardProps) {
  const postedDate = new Date(listing.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-apptext">{listing.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{listing.deviceType}</span>
            {listing.condition && <ConditionBadge value={listing.condition} />}
            {listing.status === 'fulfilled' && (
              <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">Fulfilled</span>
            )}
            {linkedRecord && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary bg-mint rounded-full px-2 py-0.5" title={`Linked to inventory: ${linkedRecord.name}`}>
                <Link2 size={11} /> Inventory linked
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{listing.specs || '—'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span><strong className="text-gray-700">Company:</strong> {listing.companyName}</span>
            <span><strong className="text-gray-700">Qty:</strong> {listing.quantity}</span>
            {listing.location && <span><strong className="text-gray-700">Location:</strong> {listing.location}</span>}
            <span><strong className="text-gray-700">Contact:</strong> <a href={`mailto:${listing.contactEmail}`} className="text-primary hover:underline">{listing.contactEmail}</a></span>
            <span>Posted {postedDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onMarkFulfilled && listing.status === 'available' && (
            <button
              onClick={onMarkFulfilled}
              className="p-1.5 rounded-md hover:bg-green-50 text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Mark as fulfilled"
              title="Mark as fulfilled"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Edit ${listing.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Remove ${listing.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

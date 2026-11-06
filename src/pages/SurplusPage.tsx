import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, X, Package2, Pencil, Trash2, CheckCircle2, Link2, Package, Globe } from 'lucide-react';
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
  onReview: (listing: BoardListing) => void;
}

function ListingForm({ existing, prefill, onClose, onReview }: ListingFormProps) {
  const { updateBoardListing } = useApp();
  const [form, setForm] = useState({
    companyName: existing?.companyName ?? '',
    contactEmail: existing?.contactEmail ?? '',
    deviceType: existing?.deviceType ?? prefill?.deviceType ?? ('' as DeviceType | ''),
    name: existing?.name ?? prefill?.name ?? '',
    quantity: existing?.quantity ?? prefill?.quantity ?? 1,
    condition: existing?.condition ?? prefill?.condition ?? ('' as Condition | ''),
    specs: existing?.specs ?? (prefill ? specSummaryFromRecord(prefill.specs) : ''),
    location: existing?.location ?? '',
    isPublic: existing?.isPublic ?? false,
    price: existing?.price ?? ('' as number | ''),
    isNonProfit: existing?.isNonProfit ?? false,
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
    const priceVal = form.price !== '' && Number(form.price) > 0 ? Number(form.price) : undefined;

    if (existing) {
      updateBoardListing({
        ...existing,
        companyName: form.companyName,
        contactEmail: form.contactEmail,
        deviceType: form.deviceType as DeviceType,
        name: form.name,
        quantity: form.quantity,
        condition: form.condition || undefined,
        specs: form.specs,
        location: form.location || undefined,
        isPublic: form.isPublic,
        price: form.isPublic ? priceVal : undefined,
        isNonProfit: form.isPublic ? form.isNonProfit : undefined,
        updatedAt: now,
      });
      onClose();
    } else {
      const pending: BoardListing = {
        id: generateId(),
        kind: 'surplus',
        companyName: form.companyName,
        contactEmail: form.contactEmail,
        deviceType: form.deviceType as DeviceType,
        name: form.name,
        quantity: form.quantity,
        condition: form.condition || undefined,
        specs: form.specs,
        location: form.location || undefined,
        status: 'available',
        postedAt: now,
        updatedAt: now,
        inventoryRecordId: prefill?.inventoryRecordId,
        isPublic: form.isPublic,
        price: form.isPublic ? priceVal : undefined,
        isNonProfit: form.isPublic ? form.isNonProfit : undefined,
      };
      onReview(pending);
    }
  }

  function field(label: string, key: keyof typeof form, input: React.ReactNode) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {input}
        {errors[key] && <p className="text-xs text-red-600 mt-0.5">{errors[key as string]}</p>}
      </div>
    );
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-apptext">{existing ? 'Edit Surplus Record' : 'Record Surplus Equipment'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Your Company', 'companyName', <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className={inputCls} />)}
            {field('Contact Email', 'contactEmail', <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} className={inputCls} />)}
          </div>
          {field('Equipment Name', 'name', <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dell OptiPlex 7050" className={inputCls} />)}
          <div className="grid grid-cols-3 gap-4">
            {field('Type', 'deviceType',
              <select value={form.deviceType} onChange={e => setForm(f => ({ ...f, deviceType: e.target.value as DeviceType | '' }))} className={inputCls}>
                {DEVICE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'Select'}</option>)}
              </select>
            )}
            {field('Qty', 'quantity', <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} className={inputCls} />)}
            {field('Condition', 'condition',
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as Condition | '' }))} className={inputCls}>
                {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c || 'Not specified'}</option>)}
              </select>
            )}
          </div>
          {field('Specs / Notes', 'specs',
            <textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} rows={2} placeholder="CPU, RAM, storage, any defects…" className={`${inputCls} resize-none`} />
          )}
          {field('Location (optional)', 'location', <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State" className={inputCls} />)}

          {/* Public marketplace toggle */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-apptext flex items-center gap-1.5"><Globe size={14} className="text-primary" /> Post to public marketplace</span>
                <p className="text-xs text-gray-500">Allow other organisations to discover and contact you about this equipment.</p>
              </div>
            </label>
            {form.isPublic && (
              <div className="ml-7 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isNonProfit} onChange={e => setForm(f => ({ ...f, isNonProfit: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-apptext">Non-profit / donation listing</span>
                </label>
                {!form.isNonProfit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asking price (optional)</label>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number" min={0} step={1}
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value === '' ? '' : Number(e.target.value) }))}
                        placeholder="0"
                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave blank to list as free.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">
              {existing ? 'Save Changes' : 'Review & Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 font-medium text-gray-500 text-sm">{label}</span>
      <span className="text-apptext text-sm break-all">{value}</span>
    </div>
  );
}

export function SurplusPage() {
  const { boardListings, addBoardListing, updateBoardListing, deleteBoardListing, pendingSurplusPrefill, inventory } = useApp();
  const surplus = useMemo(() => boardListings.filter(l => l.kind === 'surplus'), [boardListings]);

  const [showForm, setShowForm] = useState(false);
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);
  const [editTarget, setEditTarget] = useState<BoardListing | undefined>(undefined);
  const [prefill, setPrefill] = useState<ListingFormProps['prefill'] | undefined>(undefined);
  const [pendingListing, setPendingListing] = useState<BoardListing | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DeviceType | ''>('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (pendingSurplusPrefill.current) {
      setPrefill(pendingSurplusPrefill.current);
      setEditTarget(undefined);
      setShowForm(true);
      pendingSurplusPrefill.current = null;
    }
  }, [pendingSurplusPrefill]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }
  function handleMarkFulfilled(listing: BoardListing) {
    updateBoardListing({ ...listing, status: 'fulfilled', updatedAt: new Date().toISOString() });
    showToast('Marked as fulfilled.');
  }
  function handleDelete(id: string) { deleteBoardListing(id); setDeleteConfirm(null); showToast('Record removed.'); }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return surplus.filter(l => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.companyName.toLowerCase().includes(q) || l.specs.toLowerCase().includes(q) || (l.location ?? '').toLowerCase().includes(q);
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
          <h1 className="text-2xl font-bold text-apptext">Surplus Equipment</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your organisation's surplus IT equipment.</p>
          {surplus.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{surplus.filter(l => l.status === 'available').length} active · {surplus.filter(l => l.isPublic).length} on marketplace</p>}
        </div>
        <div className="flex gap-2 flex-wrap self-start sm:self-auto">
          {inventory.length > 0 && (
            <button onClick={() => setShowInventoryPicker(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg text-sm font-medium hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary">
              <Package size={16} /> From Inventory
            </button>
          )}
          <button onClick={() => { setEditTarget(undefined); setPrefill(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">
            <Plus size={16} /> Add Surplus
          </button>
        </div>
      </div>

      {/* Filters */}
      {surplus.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Search surplus records…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as DeviceType | '')} className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="Filter by type">
            {DEVICE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
          </select>
          {(search || typeFilter) && <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><X size={14} /> Clear</button>}
        </div>
      )}

      {/* Empty state */}
      {surplus.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4"><Package2 size={28} className="text-primary" /></div>
          <h2 className="text-lg font-semibold text-apptext mb-2">No surplus records yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Record surplus equipment from your inventory, or add one manually.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => setShowInventoryPicker(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-primary text-primary rounded-lg text-sm font-medium hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary">
              <Package size={16} /> From Inventory
            </button>
            <button onClick={() => { setEditTarget(undefined); setPrefill(undefined); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">
              <Plus size={16} /> Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Available */}
      {available.length > 0 && (
        <div className="space-y-3">
          {available.map(listing => (
            <ListingCard key={listing.id} listing={listing} linkedRecord={listing.inventoryRecordId ? inventory.find(r => r.id === listing.inventoryRecordId) : undefined}
              onEdit={() => { setEditTarget(listing); setShowForm(true); }}
              onDelete={() => setDeleteConfirm(listing.id)}
              onMarkFulfilled={() => handleMarkFulfilled(listing)}
            />
          ))}
        </div>
      )}

      {/* Fulfilled */}
      {fulfilled.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fulfilled</h2>
          <div className="space-y-3 opacity-60">
            {fulfilled.map(listing => (
              <ListingCard key={listing.id} listing={listing} linkedRecord={listing.inventoryRecordId ? inventory.find(r => r.id === listing.inventoryRecordId) : undefined}
                onEdit={() => { setEditTarget(listing); setShowForm(true); }}
                onDelete={() => setDeleteConfirm(listing.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inventory Picker */}
      {showInventoryPicker && (
        <InventoryPickerModal inventory={inventory}
          onSelect={rec => { setPrefill({ inventoryRecordId: rec.id, name: rec.name, deviceType: rec.deviceType, quantity: rec.quantity, condition: rec.condition, specs: rec.specs }); setEditTarget(undefined); setShowInventoryPicker(false); setShowForm(true); }}
          onClose={() => setShowInventoryPicker(false)}
        />
      )}

      {/* Form */}
      {showForm && (
        <ListingForm existing={editTarget} prefill={editTarget ? undefined : prefill}
          onClose={() => { setShowForm(false); setEditTarget(undefined); setPrefill(undefined); }}
          onReview={listing => { setShowForm(false); setPendingListing(listing); }}
        />
      )}

      {/* Verification modal */}
      {pendingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-1">Confirm Surplus Record</h2>
            <p className="text-sm text-gray-500 mb-4">Review before saving to your internal surplus log.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-2">
              <Row label="Equipment" value={pendingListing.name} />
              <Row label="Type" value={pendingListing.deviceType} />
              <Row label="Qty" value={String(pendingListing.quantity)} />
              {pendingListing.condition && <Row label="Condition" value={pendingListing.condition} />}
              <Row label="Company" value={pendingListing.companyName} />
              {pendingListing.location && <Row label="Location" value={pendingListing.location} />}
            </div>
            {pendingListing.isPublic && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary bg-mint rounded-lg px-3 py-2 mb-4">
                <Globe size={13} /> This will also appear on the public marketplace
                {pendingListing.isNonProfit ? ' as a donation.' : pendingListing.price ? ` at $${pendingListing.price}.` : ' as free.'}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setPendingListing(null); setPrefill(undefined); }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">No, go back</button>
              <button onClick={() => { addBoardListing(pendingListing); setPendingListing(null); setPrefill(undefined); showToast('Surplus record saved.'); }} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">Yes, confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-2">Remove surplus record?</h2>
            <p className="text-sm text-gray-600 mb-6">"{surplus.find(l => l.id === deleteConfirm)?.name}" will be permanently removed.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-apptext text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium" role="status" aria-live="polite">{toast}</div>}
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
            {listing.status === 'fulfilled' && <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">Fulfilled</span>}
            {linkedRecord && <span className="flex items-center gap-1 text-xs font-medium text-primary bg-mint rounded-full px-2 py-0.5"><Link2 size={11} /> Inventory linked</span>}
            {listing.isPublic && (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                <Globe size={11} /> {listing.isNonProfit ? 'Donation' : listing.price ? `$${listing.price}` : 'Free'} · Marketplace
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
            <button onClick={onMarkFulfilled} className="p-1.5 rounded-md hover:bg-green-50 text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400" aria-label="Mark fulfilled" title="Mark as fulfilled">
              <CheckCircle2 size={16} />
            </button>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Edit ${listing.name}`}><Pencil size={15} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Remove ${listing.name}`}><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

interface InventoryPickerModalProps {
  inventory: EquipmentRecord[];
  onSelect: (rec: EquipmentRecord) => void;
  onClose: () => void;
}

function InventoryPickerModal({ inventory, onSelect, onClose }: InventoryPickerModalProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(r => !q || r.name.toLowerCase().includes(q) || r.deviceType.toLowerCase().includes(q));
  }, [inventory, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-4 px-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-apptext">Choose from Inventory</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto px-3 pb-4 space-y-1">
          {filtered.length === 0 && <p className="text-sm text-gray-500 text-center py-6">No inventory records match.</p>}
          {filtered.map(rec => (
            <button key={rec.id} onClick={() => onSelect(rec)} className="w-full text-left flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
              <div>
                <p className="text-sm font-medium text-apptext">{rec.name}</p>
                <p className="text-xs text-gray-500">{rec.deviceType} · {rec.quantity} unit{rec.quantity !== 1 ? 's' : ''} · {rec.condition}</p>
              </div>
              <Plus size={16} className="text-primary shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

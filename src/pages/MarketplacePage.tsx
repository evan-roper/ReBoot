import { useState, useMemo } from 'react';
import { Globe, Search, X, ShoppingBag, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DeviceType } from '../types/equipment';
import { ConditionBadge } from '../components/Badges';

const DEVICE_TYPE_OPTIONS: (DeviceType | '')[] = [
  '', 'Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Networking', 'Storage', 'GPU', 'CPU', 'RAM', 'Printer', 'Custom',
];

export function MarketplacePage() {
  const { boardListings, navigate, loadDemoListings } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DeviceType | ''>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid' | 'donation'>('all');
  const [demoConfirm, setDemoConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleLoadDemo() {
    if (loadDemoListings() === 'confirm') {
      setDemoConfirm(true);
    } else {
      showToast('6 demo marketplace listings loaded.');
    }
  }

  function handleConfirmDemo() {
    loadDemoListings(true);
    setDemoConfirm(false);
    showToast('6 demo marketplace listings loaded.');
  }

  const listings = useMemo(() =>
    boardListings.filter(l => l.kind === 'surplus' && l.isPublic && l.status === 'available'),
    [boardListings]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter(l => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.companyName.toLowerCase().includes(q) || l.specs.toLowerCase().includes(q) || (l.location ?? '').toLowerCase().includes(q);
      const matchType = !typeFilter || l.deviceType === typeFilter;
      const matchPrice =
        priceFilter === 'all' ? true :
        priceFilter === 'donation' ? !!l.isNonProfit :
        priceFilter === 'free' ? (!l.isNonProfit && !l.price) :
        priceFilter === 'paid' ? (!!l.price && !l.isNonProfit) : true;
      return matchSearch && matchType && matchPrice;
    });
  }, [listings, search, typeFilter, priceFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Equipment Marketplace</h1>
          <p className="text-gray-500 text-sm mt-1">Surplus IT equipment available from organisations near you.</p>
          {listings.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{listings.length} active listing{listings.length !== 1 ? 's' : ''}</p>}
        </div>
        <div className="flex gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <RefreshCw size={16} /> Load Demo
          </button>
          <button
            onClick={() => navigate('surplus')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg text-sm font-medium hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Globe size={16} /> List your surplus
          </button>
        </div>
      </div>

      {/* Filters */}
      {listings.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Search by name, company, specs, location…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as DeviceType | '')} className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="Filter by type">
            {DEVICE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
          </select>
          <select value={priceFilter} onChange={e => setPriceFilter(e.target.value as typeof priceFilter)} className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="Filter by price">
            <option value="all">All listings</option>
            <option value="free">Free</option>
            <option value="paid">For sale</option>
            <option value="donation">Donations</option>
          </select>
          {(search || typeFilter || priceFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); setPriceFilter('all'); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag size={28} className="text-primary" /></div>
          <h2 className="text-lg font-semibold text-apptext mb-2">No public listings yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            When organisations mark surplus equipment as public, it will appear here. Load the demo to see what it looks like.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={handleLoadDemo} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary">
              <RefreshCw size={16} /> Load Demo
            </button>
            <button onClick={() => navigate('surplus')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-primary text-primary rounded-lg text-sm font-medium hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary">
              <Globe size={16} /> List your surplus
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {listings.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">No listings match your filters.</p>
          <button onClick={() => { setSearch(''); setTypeFilter(''); setPriceFilter('all'); }} className="mt-2 text-sm text-primary underline">Clear filters</button>
        </div>
      )}

      {/* Listings grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(listing => {
            const postedDate = new Date(listing.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const priceLabel = listing.isNonProfit ? 'Donation' : listing.price ? `$${listing.price}` : 'Free';
            const priceCls = listing.isNonProfit ? 'bg-purple-100 text-purple-700' : listing.price ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
            return (
              <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-apptext">{listing.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{listing.deviceType} · Qty {listing.quantity}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${priceCls}`}>{priceLabel}</span>
                </div>
                {listing.condition && <ConditionBadge value={listing.condition} />}
                {listing.specs && <p className="text-sm text-gray-600 line-clamp-2">{listing.specs}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-50">
                  <span><strong className="text-gray-700">Company:</strong> {listing.companyName}</span>
                  {listing.location && <span><strong className="text-gray-700">Location:</strong> {listing.location}</span>}
                  <span>Listed {postedDate}</span>
                </div>
                <a
                  href={`mailto:${listing.contactEmail}?subject=Interested in: ${encodeURIComponent(listing.name)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  Contact {listing.companyName}
                </a>
              </div>
            );
          })}
        </div>
      )}
      {/* Replace confirm modal */}
      {demoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-2">Replace existing listings?</h2>
            <p className="text-sm text-gray-600 mb-6">Loading demo data will replace all current marketplace listings.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDemoConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleConfirmDemo} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest">Replace & Load Demo</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-apptext text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

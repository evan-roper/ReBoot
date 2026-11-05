import { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, BarChart2, Pencil, Trash2, X, Package, Upload, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EquipmentForm } from '../components/EquipmentForm';
import { CSVImportModal } from '../components/CSVImportModal';
import { ConditionBadge, ClassificationBadge } from '../components/Badges';
import { downloadCSV } from '../utils/csv';
import type { EquipmentRecord, DeviceType, Condition } from '../types/equipment';

function specSummary(rec: EquipmentRecord): string {
  const s = rec.specs as Record<string, unknown>;
  const parts: string[] = [];
  if (s.coreCount) parts.push(`${s.coreCount} cores`);
  if (s.ramGB) parts.push(`${s.ramGB} GB RAM`);
  if (s.storageGB) parts.push(`${s.storageGB} GB`);
  if (s.storageType && s.storageType !== 'Unknown') parts.push(String(s.storageType));
  if (s.capacityGB) parts.push(`${s.capacityGB} GB`);
  if (s.interface && s.interface !== 'Unknown') parts.push(String(s.interface));
  if (s.vaRating) parts.push(`${s.vaRating}VA`);
  if (s.screenSizeInch) parts.push(`${s.screenSizeInch}"`);
  if (s.resolution) parts.push(String(s.resolution));
  if (s.portCount) parts.push(`${s.portCount} ports`);
  if (s.portSpeed && s.portSpeed !== 'Unknown') parts.push(String(s.portSpeed));
  if (s.totalCapacityGB) parts.push(`${s.totalCapacityGB} GB`);
  if (s.vramGB) parts.push(`${s.vramGB} GB VRAM`);
  if (s.printerType && s.printerType !== 'Unknown') parts.push(String(s.printerType));
  if (s.categoryName) parts.push(String(s.categoryName));
  return parts.join(' · ') || '—';
}

const DEVICE_TYPE_OPTIONS: (DeviceType | '')[] = ['', 'Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Networking', 'Storage', 'GPU', 'CPU', 'RAM', 'Printer', 'Custom'];
const CONDITION_OPTIONS: (Condition | '')[] = ['', 'Working', 'Needs repair', 'Untested', 'Nonfunctional'];

export function InventoryPage() {
  const { inventory, deleteRecord, navigate, loadDemo, runAnalysis, analysisResults } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<EquipmentRecord | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [demoConfirm, setDemoConfirm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DeviceType | ''>('');
  const [condFilter, setCondFilter] = useState<Condition | ''>('');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleDelete(id: string) {
    deleteRecord(id);
    setDeleteConfirm(null);
    showToast('Equipment record deleted.');
  }

  function handleLoadDemo() {
    if (inventory.length > 0) {
      setDemoConfirm(true);
    } else {
      loadDemo(true);
      showToast('10 demo records loaded.');
    }
  }

  function handleConfirmDemo() {
    loadDemo(true);
    setDemoConfirm(false);
    showToast('10 demo records loaded.');
  }

  function handleRunAnalysis() {
    runAnalysis();
    navigate('analysis');
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(r => {
      const s = r.specs as Record<string, unknown>;
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        (s.manufacturer as string ?? '').toLowerCase().includes(q) ||
        (s.model as string ?? '').toLowerCase().includes(q) ||
        (s.assetTag as string ?? '').toLowerCase().includes(q) ||
        r.deviceType.toLowerCase().includes(q);
      const matchType = !typeFilter || r.deviceType === typeFilter;
      const matchCond = !condFilter || r.condition === condFilter;
      return matchSearch && matchType && matchCond;
    });
  }, [inventory, search, typeFilter, condFilter]);

  const totalUnits = inventory.reduce((sum, r) => sum + r.quantity, 0);

  function getAnalysisStatus(id: string) {
    const ar = analysisResults.find(r => r.recordId === id);
    return ar ? ar.classification : null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Equipment Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your retired IT assets.</p>
          {inventory.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {inventory.length} record{inventory.length !== 1 ? 's' : ''} · {totalUnits} physical unit{totalUnits !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setEditTarget(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Plus size={16} /> Add Equipment
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Upload size={16} /> Import CSV
          </button>
          {inventory.length > 0 && (
            <button
              onClick={() => { downloadCSV(inventory); showToast('CSV downloaded.'); }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Download size={16} /> Export CSV
            </button>
          )}
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <RefreshCw size={16} /> Load Demo
          </button>
          {inventory.length > 0 && (
            <button
              onClick={handleRunAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <BarChart2 size={16} /> Analyze Inventory
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {inventory.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name, manufacturer, model, asset tag…"
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
          <select
            value={condFilter}
            onChange={e => setCondFilter(e.target.value as Condition | '')}
            className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Filter by condition"
          >
            {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c || 'All conditions'}</option>)}
          </select>
          {(search || typeFilter || condFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setCondFilter(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {inventory.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-apptext mb-2">No equipment yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Add your retired IT assets to discover reuse potential, or load the demo to see how ReBoot works.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setEditTarget(undefined); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Plus size={16} /> Add Equipment
            </button>
            <button
              onClick={handleLoadDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <RefreshCw size={16} /> Try Demo
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {inventory.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500">No equipment matches your search or filters.</p>
          <button onClick={() => { setSearch(''); setTypeFilter(''); setCondFilter(''); }} className="mt-2 text-sm text-primary underline">Clear filters</button>
        </div>
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Specs</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Condition</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Analysis</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(rec => {
                    const analysis = getAnalysisStatus(rec.id);
                    return (
                      <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-apptext">{rec.name}</div>
                          {typeof (rec.specs as Record<string, unknown>).assetTag === 'string' && (
                            <div className="text-xs text-gray-400">{String((rec.specs as Record<string, unknown>).assetTag)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{rec.deviceType}</td>
                        <td className="px-4 py-3.5 text-gray-500 max-w-[200px] truncate">{specSummary(rec)}</td>
                        <td className="px-4 py-3.5"><ConditionBadge value={rec.condition} /></td>
                        <td className="px-4 py-3.5 text-gray-600">{rec.quantity}</td>
                        <td className="px-4 py-3.5">
                          {analysis ? <ClassificationBadge value={analysis} /> : <span className="text-xs text-gray-400">Not analyzed</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditTarget(rec); setShowForm(true); }}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                              aria-label={`Edit ${rec.name}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(rec.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                              aria-label={`Delete ${rec.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(rec => {
              const analysis = getAnalysisStatus(rec.id);
              return (
                <div key={rec.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-apptext">{rec.name}</p>
                      <p className="text-xs text-gray-500">{rec.deviceType} · {rec.quantity} unit{rec.quantity !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditTarget(rec); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary" aria-label={`Edit ${rec.name}`}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteConfirm(rec.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600" aria-label={`Delete ${rec.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{specSummary(rec)}</p>
                  <div className="flex flex-wrap gap-2">
                    <ConditionBadge value={rec.condition} />
                    {analysis && <ClassificationBadge value={analysis} />}
                    {!analysis && <span className="text-xs text-gray-400">Not analyzed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <CSVImportModal
          onClose={() => setShowImport(false)}
          onImportDone={() => showToast('CSV imported successfully.')}
        />
      )}

      {/* Forms and dialogs */}
      {showForm && (
        <EquipmentForm
          existing={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
          onSaved={() => { setShowForm(false); setEditTarget(undefined); showToast(editTarget ? 'Equipment updated.' : 'Equipment added.'); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-2">Delete equipment record?</h2>
            <p className="text-sm text-gray-600 mb-6">
              "{inventory.find(r => r.id === deleteConfirm)?.name}" will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">Delete</button>
            </div>
          </div>
        </div>
      )}

      {demoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-2">Replace existing inventory?</h2>
            <p className="text-sm text-gray-600 mb-6">Loading demo data will replace your {inventory.length} existing record{inventory.length !== 1 ? 's' : ''}.</p>
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


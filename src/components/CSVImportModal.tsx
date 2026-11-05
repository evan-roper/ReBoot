import { useState, useRef } from 'react';
import { X, Upload, Download, AlertTriangle, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { parseImportCSV, downloadCSV, type ImportRowResult } from '../utils/csv';
import { useApp } from '../context/AppContext';
import type { EquipmentRecord } from '../types/equipment';

interface Props {
  onClose: () => void;
  onImportDone?: () => void;
}

type Step = 'upload' | 'preview' | 'done';

export function CSVImportModal({ onClose, onImportDone }: Props) {
  const { inventory, addRecord, clearInventory } = useApp();
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ImportRowResult[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [fileName, setFileName] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setParseError('Please select a .csv file.');
      return;
    }
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const result = parseImportCSV(text);
        if (result.rows.length === 0) {
          setParseError('The file appears to be empty or contains only a header row.');
          return;
        }
        setRows(result.rows);
        setValidCount(result.validCount);
        setErrorCount(result.errorCount);
        setStep('preview');
      } catch {
        setParseError('Failed to parse the CSV file. Ensure it matches the ReBoot CSV schema.');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFile(fakeEvent);
  }

  function handleImport(replace: boolean) {
    const validRecords = rows.filter(r => r.record && r.errors.length === 0).map(r => r.record as EquipmentRecord);
    if (replace) {
      clearInventory();
    }
    for (const rec of validRecords) {
      addRecord(rec);
    }
    setImportedCount(validRecords.length);
    setStep('done');
    onImportDone?.();
  }

  function handleConfirmImport() {
    if (replaceMode && inventory.length > 0) {
      setShowReplaceConfirm(true);
    } else {
      handleImport(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-6 pb-4 px-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Import CSV">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-apptext">Import Equipment from CSV</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Step: Upload ── */}
          {step === 'upload' && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                Upload a CSV file formatted using the ReBoot schema. Each row becomes one equipment record.
              </p>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-mint/30 transition-colors"
              >
                <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-apptext">Drop your CSV file here, or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">.csv files only</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} aria-label="Upload CSV file" />
              </div>

              {parseError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{parseError}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-medium text-apptext mb-2">Need the template?</p>
                <p className="text-xs text-gray-500 mb-3">Download your current inventory as a CSV to use as a starting point, or see the <span className="text-primary font-medium">CSV Documentation</span> for the full schema.</p>
                {inventory.length > 0 && (
                  <button
                    onClick={() => downloadCSV(inventory)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary bg-white border border-primary/30 rounded-lg hover:bg-mint focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Download size={14} /> Export current inventory as CSV
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step: Preview ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">File: <strong className="text-apptext">{fileName}</strong></span>
                <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} /> {validCount} valid row{validCount !== 1 ? 's' : ''}
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                    <AlertCircle size={12} /> {errorCount} error{errorCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {errorCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  ⚠ Rows with errors will be skipped. Fix them in your CSV and re-upload if needed.
                </div>
              )}

              {/* Row-level results */}
              <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                {rows.map((row) => (
                  <div key={row.rowNumber} className={`rounded-lg p-3 text-xs border ${row.errors.length > 0 ? 'bg-red-50 border-red-200' : row.warnings.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {row.errors.length > 0
                        ? <AlertCircle size={13} className="text-red-500 shrink-0" />
                        : row.warnings.length > 0
                          ? <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                          : <CheckCircle size={13} className="text-green-500 shrink-0" />}
                      <span className="font-medium text-apptext">
                        Row {row.rowNumber}: {row.record?.name || row.rawData['name'] || '(unnamed)'}
                      </span>
                      {row.record && (
                        <span className="text-gray-400">{row.record.deviceType} · qty {row.record.quantity}</span>
                      )}
                    </div>
                    {row.errors.map((e, i) => (
                      <p key={i} className="text-red-600 ml-5">✗ {e}</p>
                    ))}
                    {row.warnings.map((w, i) => (
                      <p key={i} className="text-amber-700 ml-5">⚠ {w}</p>
                    ))}
                  </div>
                ))}
              </div>

              {validCount > 0 && inventory.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceMode}
                    onChange={e => setReplaceMode(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Replace existing inventory ({inventory.length} records) with imported rows
                </label>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('upload'); setRows([]); setFileName(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  ← Choose different file
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={validCount === 0}
                  className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {validCount} record{validCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-mint rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-apptext">Import complete</h3>
              <p className="text-sm text-gray-500">
                {importedCount} equipment record{importedCount !== 1 ? 's' : ''} added to your inventory.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replace confirmation */}
      {showReplaceConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-apptext mb-2">Replace existing inventory?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Your {inventory.length} existing record{inventory.length !== 1 ? 's' : ''} will be removed and replaced with the {validCount} imported record{validCount !== 1 ? 's' : ''}. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReplaceConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowReplaceConfirm(false); handleImport(true); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Replace & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

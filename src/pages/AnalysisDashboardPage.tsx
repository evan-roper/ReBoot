import { useMemo } from 'react';
import { BarChart2, Play, Lightbulb, AlertTriangle, CheckCircle, Clock, Wrench, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeAll, totalUnits } from '../analysis/engine';
import { ClassificationBadge, ReadinessBadge, ConditionBadge } from '../components/Badges';
import type { Classification, AnalysisResult } from '../types/equipment';

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  'Reuse Candidate': 'bg-green-500',
  'Refurbish Candidate': 'bg-amber-500',
  'Parts Candidate': 'bg-blue-500',
  'Needs Assessment': 'bg-gray-400',
};

const CLASSIFICATION_ICONS: Record<Classification, typeof CheckCircle> = {
  'Reuse Candidate': CheckCircle,
  'Refurbish Candidate': Wrench,
  'Parts Candidate': AlertTriangle,
  'Needs Assessment': Clock,
};

export function AnalysisDashboardPage() {
  const { inventory, analysisResults, analysisRunAt, runAnalysis, navigate } = useApp();

  // Always derive fresh results from current inventory
  const results: AnalysisResult[] = useMemo(() => {
    if (inventory.length === 0) return [];
    // If we have stored results covering all records, use them; otherwise recompute
    const storedIds = new Set(analysisResults.map(r => r.recordId));
    const allCovered = inventory.every(r => storedIds.has(r.id));
    if (allCovered && analysisResults.length === inventory.length) return analysisResults;
    return analyzeAll(inventory);
  }, [inventory, analysisResults]);

  const unitTotal = totalUnits(inventory);
  const recordCount = inventory.length;

  // Classification breakdown
  const byClass = useMemo(() => {
    const map: Record<Classification, { records: number; units: number }> = {
      'Reuse Candidate': { records: 0, units: 0 },
      'Refurbish Candidate': { records: 0, units: 0 },
      'Parts Candidate': { records: 0, units: 0 },
      'Needs Assessment': { records: 0, units: 0 },
    };
    results.forEach(r => {
      const rec = inventory.find(i => i.id === r.recordId);
      if (rec) {
        map[r.classification].records += 1;
        map[r.classification].units += rec.quantity;
      }
    });
    return map;
  }, [results, inventory]);

  const needsAssessmentCount = byClass['Needs Assessment'].records;

  const allHiddenPotential = useMemo(() =>
    results.flatMap(r => {
      const rec = inventory.find(i => i.id === r.recordId);
      return r.hiddenPotential.map(hp => ({ ...hp, rec, result: r }));
    }).filter(hp => hp.rec),
    [results, inventory]
  );

  if (inventory.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Equipment Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">Run analysis to classify your inventory and discover reuse potential.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-apptext mb-2">No inventory to analyze</h2>
          <p className="text-gray-500 text-sm mb-6">Add equipment to your inventory first, then run analysis to see results.</p>
          <button
            onClick={() => navigate('inventory')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Go to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Equipment Analysis</h1>
          {analysisRunAt && (
            <p className="text-xs text-gray-400 mt-1">Last analyzed: {new Date(analysisRunAt).toLocaleString()}</p>
          )}
        </div>
        <button
          onClick={runAnalysis}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Play size={16} /> Run Analysis
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Equipment Records" value={recordCount} />
        <StatCard label="Physical Units" value={unitTotal} />
        <StatCard label="Needing Assessment" value={needsAssessmentCount} highlight={needsAssessmentCount > 0} />
        <StatCard label="Hidden Potential Items" value={allHiddenPotential.length} positive={allHiddenPotential.length > 0} />
      </div>

      {/* Classification breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-apptext mb-5">Units by Classification</h2>
        <div className="space-y-3">
          {(Object.entries(byClass) as [Classification, { records: number; units: number }][]).map(([cls, data]) => {
            const pct = unitTotal > 0 ? Math.round((data.units / unitTotal) * 100) : 0;
            return (
              <div key={cls} className="flex items-center gap-4">
                <div className="w-36 shrink-0 text-sm font-medium text-apptext">{cls}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${CLASSIFICATION_COLORS[cls]}`}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cls}: ${pct}%`}
                  />
                </div>
                <div className="text-sm text-gray-500 w-28 shrink-0 text-right">
                  {data.units} unit{data.units !== 1 ? 's' : ''} ({data.records} record{data.records !== 1 ? 's' : ''})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Potential */}
      {allHiddenPotential.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-amber-500" />
            <h2 className="text-base font-semibold text-apptext">Hidden Potential</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{allHiddenPotential.length} opportunit{allHiddenPotential.length !== 1 ? 'ies' : 'y'}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allHiddenPotential.map((hp, i) => (
              <div key={i} className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-apptext">{hp.rec!.name}</p>
                    <p className="text-xs text-gray-500">{hp.rec!.quantity} unit{hp.rec!.quantity !== 1 ? 's' : ''} · {hp.rec!.deviceType}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    hp.matchStrength === 'Strong' ? 'bg-green-100 text-green-700' :
                    hp.matchStrength === 'Conditional' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {hp.matchStrength}
                  </span>
                </div>
                <p className="text-sm font-medium text-primary mb-1">{hp.opportunityTitle}</p>
                <p className="text-sm text-gray-600 mb-3">{hp.explanation}</p>
                {hp.prerequisites.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Prerequisites</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {hp.prerequisites.map((p, j) => <li key={j} className="text-xs text-gray-500">{p}</li>)}
                    </ul>
                  </div>
                )}
                {hp.requiredChecks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Required Checks</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {hp.requiredChecks.map((c, j) => <li key={j} className="text-xs text-gray-500">{c}</li>)}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => navigate('opportunities')}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline focus:outline-none"
                >
                  View Opportunity <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-record results */}
      <div>
        <h2 className="text-base font-semibold text-apptext mb-4">Per-Record Results</h2>
        <div className="space-y-4">
          {results.map(result => {
            const rec = inventory.find(r => r.id === result.recordId);
            if (!rec) return null;
            const Icon = CLASSIFICATION_ICONS[result.classification];
            return (
              <div key={result.recordId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={
                      result.classification === 'Reuse Candidate' ? 'text-green-600' :
                      result.classification === 'Refurbish Candidate' ? 'text-amber-600' :
                      result.classification === 'Parts Candidate' ? 'text-blue-600' :
                      'text-gray-500'
                    } />
                    <div>
                      <p className="font-semibold text-apptext">{rec.name}</p>
                      <p className="text-xs text-gray-500">{rec.deviceType} · {rec.quantity} unit{rec.quantity !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ConditionBadge value={rec.condition} />
                    <ClassificationBadge value={result.classification} />
                    <ReadinessBadge value={result.readiness} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {result.reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Assessment</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.reasons.map((r, i) => <li key={i} className="text-gray-600">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.missingInfo.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-1">⚠ Missing Information</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.missingInfo.map((m, i) => <li key={i} className="text-gray-600">{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.requiredChecks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Required Checks</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.requiredChecks.map((c, i) => <li key={i} className="text-gray-600">{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.potentialApplications.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">✓ Potential Applications</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.potentialApplications.map((p, i) => <li key={i} className="text-gray-600">{p}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight, positive }: { label: string; value: number; highlight?: boolean; positive?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${highlight ? 'border-amber-200' : positive ? 'border-green-200' : 'border-gray-100'}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-amber-600' : positive ? 'text-green-600' : 'text-apptext'}`}>{value}</p>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { ChevronLeft, Monitor, Code2, Layers, Cpu, ScreenShare, Network, HardDrive, CircuitBoard, Printer, Zap, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeAll } from '../analysis/engine';
import { OPPORTUNITIES } from '../data/opportunities';
import { ConditionBadge } from '../components/Badges';
import type { EquipmentRecord } from '../types/equipment';

import type { LucideProps } from 'lucide-react';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
const ICON_MAP: Record<string, LucideIcon> = {
  Monitor, Code2, Layers, Cpu, ScreenShare, Network, HardDrive, CircuitBoard, Printer, Zap,
};

export function OpportunitiesPage() {
  const { inventory, analysisResults } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Always compute fresh results from current inventory
  const results = useMemo(() => {
    if (inventory.length === 0) return analysisResults;
    const storedIds = new Set(analysisResults.map(r => r.recordId));
    const allCovered = inventory.every(r => storedIds.has(r.id)) && analysisResults.length === inventory.length;
    return allCovered ? analysisResults : analyzeAll(inventory);
  }, [inventory, analysisResults]);

  // For each opportunity, find matching inventory items
  const matchedOpportunities = useMemo(() => {
    return OPPORTUNITIES.map(opp => {
      const matches: { rec: EquipmentRecord; explanation: string; prerequisites: string[]; requiredChecks: string[]; matchStrength: string }[] = [];
      results.forEach(r => {
        const rec = inventory.find(i => i.id === r.recordId);
        if (!rec) return;
        const hp = r.hiddenPotential.find(h => h.opportunityId === opp.id);
        if (hp) {
          matches.push({
            rec,
            explanation: hp.explanation,
            prerequisites: hp.prerequisites,
            requiredChecks: hp.requiredChecks,
            matchStrength: hp.matchStrength,
          });
        }
      });
      return { opp, matches };
    });
  }, [OPPORTUNITIES, results, inventory]);

  const selected = selectedId ? matchedOpportunities.find(m => m.opp.id === selectedId) : null;

  if (inventory.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-apptext">Second Life Opportunities</h1>
          <p className="text-gray-500 text-sm mt-1">Explore what your equipment could become.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Add equipment to your inventory to discover matching second-life opportunities.</p>
          <button
            onClick={() => {/* navigate handled by parent */}}
            className="text-primary underline text-sm"
          >
            Go to Inventory to add equipment
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <OpportunityDetail
        opp={selected.opp}
        matches={selected.matches}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-apptext">Second Life Opportunities</h1>
        <p className="text-gray-500 text-sm mt-1">Explore what your equipment could become.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchedOpportunities.map(({ opp, matches }) => {
          const Icon = ICON_MAP[opp.icon] ?? Monitor;
          const totalMatchedUnits = matches.reduce((s, m) => s + m.rec.quantity, 0);
          const hasMatches = matches.length > 0;
          return (
            <button
              key={opp.id}
              onClick={() => setSelectedId(opp.id)}
              className={`bg-white rounded-xl border shadow-sm p-5 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary
                ${hasMatches ? 'border-green-100' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasMatches ? 'bg-mint' : 'bg-gray-100'}`}>
                  <Icon size={20} className={hasMatches ? 'text-primary' : 'text-gray-400'} />
                </div>
                <span className="text-xs font-medium text-gray-400">{opp.category}</span>
              </div>
              <h3 className="font-semibold text-apptext mb-1">{opp.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{opp.shortDescription}</p>
              {hasMatches ? (
                <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                  <span>✓</span>
                  <span>{matches.length} record{matches.length !== 1 ? 's' : ''} match · {totalMatchedUnits} unit{totalMatchedUnits !== 1 ? 's' : ''}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">No matches in current inventory</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityDetail({
  opp, matches, onBack
}: {
  opp: typeof OPPORTUNITIES[0];
  matches: { rec: EquipmentRecord; explanation: string; prerequisites: string[]; requiredChecks: string[]; matchStrength: string }[];
  onBack: () => void;
}) {
  const Icon = ICON_MAP[opp.icon] ?? Monitor;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-apptext focus:outline-none focus:ring-2 focus:ring-primary rounded"
      >
        <ChevronLeft size={16} /> Back to Opportunities
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center">
            <Icon size={24} className="text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">{opp.category}</span>
            <h1 className="text-xl font-bold text-apptext">{opp.title}</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{opp.description}</p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search size={20} className="text-gray-400" />
          </div>
          <p className="font-medium text-apptext mb-2">No matching inventory</p>
          <p className="text-sm text-gray-500">
            None of your current equipment meets the requirements for this opportunity.
            Check the opportunity description for what specifications are needed.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-semibold text-apptext mb-4">
            Matching Equipment ({matches.length} record{matches.length !== 1 ? 's' : ''})
          </h2>
          <div className="space-y-4">
            {matches.map((match, i) => (
              <div key={i} className="bg-white rounded-xl border border-green-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-apptext">{match.rec.name}</p>
                    <p className="text-xs text-gray-500">{match.rec.deviceType} · {match.rec.quantity} unit{match.rec.quantity !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <ConditionBadge value={match.rec.condition} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      match.matchStrength === 'Strong' ? 'bg-green-100 text-green-700' :
                      match.matchStrength === 'Conditional' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {match.matchStrength} match
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{match.explanation}</p>
                {match.prerequisites.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Prerequisites</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {match.prerequisites.map((p, j) => <li key={j} className="text-xs text-gray-500">{p}</li>)}
                    </ul>
                  </div>
                )}
                {match.requiredChecks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Required Checks</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {match.requiredChecks.map((c, j) => <li key={j} className="text-xs text-gray-500">{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { RefreshCw, ArrowRight, Package, BarChart2, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SAMPLE_OPPORTUNITIES = [
  { title: 'Productivity Workstation', desc: 'Retired desktops repurposed for education and community programs.', tag: 'Computing' },
  { title: 'Network Training Lab', desc: 'Managed switches enabling hands-on network certification study.', tag: 'Infrastructure' },
  { title: 'Backup Storage Expansion', desc: 'Healthy SSDs adding redundant storage capacity to critical systems.', tag: 'Storage' },
];

export function HomePage() {
  const { navigate, loadDemo, inventory, runAnalysis } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  function handleTryDemo() {
    const result = loadDemo();
    if (result === 'confirm') {
      setShowConfirm(true);
    } else {
      runAnalysis();
      setDemoLoaded(true);
      navigate('analysis');
    }
  }

  function handleConfirmDemo() {
    loadDemo(true);
    runAnalysis();
    setShowConfirm(false);
    setDemoLoaded(true);
    navigate('analysis');
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12 lg:py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-mint rounded-full mb-6">
          <RefreshCw size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-apptext mb-4 tracking-tight">
          Give technology a second life.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Discover the hidden potential in retired IT equipment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('inventory')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-forest transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Analyze Equipment
            <ArrowRight size={18} />
          </button>
          <button
            onClick={handleTryDemo}
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl font-medium hover:bg-mint transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <RefreshCw size={18} />
            Try Demo
          </button>
        </div>
        {demoLoaded && (
          <p className="mt-4 text-sm text-green-700 bg-mint px-4 py-2 rounded-lg inline-block">
            ✓ Demo loaded with 10 equipment records — viewing analysis results.
          </p>
        )}
        {inventory.length > 0 && !demoLoaded && (
          <p className="mt-4 text-sm text-gray-500">
            You have <strong>{inventory.length}</strong> equipment record{inventory.length !== 1 ? 's' : ''} in inventory.{' '}
            <button onClick={() => navigate('inventory')} className="text-primary underline hover:no-underline">View Inventory →</button>
          </p>
        )}
      </section>

      {/* Confirm demo replacement dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-apptext mb-3">Replace existing inventory?</h2>
            <p className="text-sm text-gray-600 mb-6">
              You have {inventory.length} existing record{inventory.length !== 1 ? 's' : ''}. Loading the demo will replace your current inventory. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDemo}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Replace & Load Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process cards */}
      <section>
        <h2 className="text-xl font-semibold text-apptext mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: <Package size={24} className="text-primary" />, title: 'Add Equipment', desc: 'Enter your retired IT assets with type-specific specifications. Incomplete specs are fine — ReBoot explains what\'s needed.' },
            { step: '2', icon: <BarChart2 size={24} className="text-primary" />, title: 'Discover Potential', desc: 'Run analysis to classify equipment and surface hidden opportunities using deterministic, explainable rules.' },
            { step: '3', icon: <Lightbulb size={24} className="text-primary" />, title: 'Explore Opportunities', desc: 'See matched second-life uses with prerequisites, required checks, and links back to each equipment record.' },
          ].map(card => (
            <div key={card.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-mint text-primary text-xs font-bold flex items-center justify-center">{card.step}</span>
                {card.icon}
              </div>
              <h3 className="font-semibold text-apptext mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample opportunities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-apptext">Example second-life opportunities</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Illustrative examples</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_OPPORTUNITIES.map(opp => (
            <div key={opp.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <span className="text-xs font-medium text-primary bg-mint px-2 py-0.5 rounded-full">{opp.tag}</span>
              <h3 className="font-semibold text-apptext mt-3 mb-1">{opp.title}</h3>
              <p className="text-sm text-gray-500">{opp.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400 text-center">
          These are illustrative examples. Actual opportunities depend on your inventory — run an analysis to see real matches.
        </p>
      </section>

      {/* About */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-apptext mb-3">About ReBoot</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          ReBoot helps organizations make informed decisions about retired IT equipment. It provides technical guidance on reuse potential, refurbishment feasibility, and component salvage — based on the information you enter, using documented illustrative heuristics.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>ReBoot does not make disposition decisions</strong> — your organization decides whether to retain, redeploy, refurbish, donate, sell, or recycle equipment. ReBoot gives you the technical context to make that decision confidently.
        </p>
      </section>
    </div>
  );
}

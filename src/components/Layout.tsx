import { useState } from 'react';
import { Menu, X, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types/equipment';

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'analysis', label: 'Analysis Dashboard', icon: '📊' },
  { id: 'opportunities', label: 'Second Life Opportunities', icon: '♻️' },
];

function NavItem({ item, active, onClick }: { item: typeof NAV_ITEMS[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left
        ${active
          ? 'bg-primary text-white'
          : 'text-green-100 hover:bg-white/10 focus:bg-white/10'
        }`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate, saveFailed } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-forest text-white shrink-0 fixed top-0 left-0 h-full z-20">
        <SidebarContent currentPage={currentPage} navigate={navigate} />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 bg-forest text-white z-30 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-mint" />
          <span className="font-bold text-lg tracking-tight">ReBoot</span>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="lg:hidden fixed top-0 left-0 h-full w-72 bg-forest text-white z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-mint" />
                <span className="font-bold text-lg">ReBoot</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md hover:bg-white/10"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={currentPage === item.id}
                  onClick={() => { navigate(item.id); setMobileOpen(false); }}
                />
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-xs text-green-300 italic">Give technology a second life.</p>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {saveFailed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800" role="alert">
            ⚠️ Changes may not be saved — localStorage is unavailable. Data will not persist after refresh.
          </div>
        )}
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ currentPage, navigate }: { currentPage: Page; navigate: (p: Page) => void }) {
  return (
    <>
      {/* Brand */}
      <div className="px-4 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-primary rounded-full p-1.5">
          <RefreshCw size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">ReBoot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={currentPage === item.id}
            onClick={() => navigate(item.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-green-300 italic">Give technology a second life.</p>
      </div>
    </>
  );
}

import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { AnalysisDashboardPage } from './pages/AnalysisDashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { SurplusPage } from './pages/SurplusPage';

function Pages() {
  const { currentPage } = useApp();
  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'inventory': return <InventoryPage />;
    case 'analysis': return <AnalysisDashboardPage />;
    case 'opportunities': return <OpportunitiesPage />;
    case 'surplus': return <SurplusPage />;
    default: return <HomePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Pages />
      </Layout>
    </AppProvider>
  );
}

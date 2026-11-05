import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { EquipmentRecord, AnalysisResult, AppState, Page } from '../types/equipment';
import { loadState, saveState } from '../utils/storage';
import { analyzeAll } from '../analysis/engine';
import { DEMO_RECORDS } from '../data/demoData';

interface AppContextValue {
  inventory: EquipmentRecord[];
  customCategories: string[];
  analysisResults: AnalysisResult[];
  analysisRunAt?: string;
  saveFailed: boolean;
  currentPage: Page;
  navigate: (page: Page) => void;
  addRecord: (r: EquipmentRecord) => void;
  updateRecord: (r: EquipmentRecord) => void;
  deleteRecord: (id: string) => void;
  loadDemo: (force?: boolean) => 'loaded' | 'confirm';
  runAnalysis: () => void;
  addCustomCategory: (name: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_RECORD'; payload: EquipmentRecord }
  | { type: 'UPDATE_RECORD'; payload: EquipmentRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'SET_ANALYSIS'; payload: { results: AnalysisResult[]; runAt: string } }
  | { type: 'LOAD_DEMO'; payload: EquipmentRecord[] }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'SET_SAVE_FAILED'; payload: boolean };

interface State extends AppState {
  saveFailed: boolean;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'ADD_RECORD':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_RECORD':
      return {
        ...state,
        inventory: state.inventory.map(r => r.id === action.payload.id ? action.payload : r),
        // Mark analysis stale
        analysisResults: state.analysisResults.map(ar =>
          ar.recordId === action.payload.id ? { ...ar, _stale: true } as AnalysisResult : ar
        ),
      };
    case 'DELETE_RECORD':
      return {
        ...state,
        inventory: state.inventory.filter(r => r.id !== action.payload),
        analysisResults: state.analysisResults.filter(ar => ar.recordId !== action.payload),
      };
    case 'SET_ANALYSIS':
      return { ...state, analysisResults: action.payload.results, analysisRunAt: action.payload.runAt };
    case 'LOAD_DEMO':
      return { ...state, inventory: action.payload, analysisResults: [], analysisRunAt: undefined };
    case 'ADD_CATEGORY':
      if (state.customCategories.includes(action.payload)) return state;
      return { ...state, customCategories: [...state.customCategories, action.payload] };
    case 'SET_SAVE_FAILED':
      return { ...state, saveFailed: action.payload };
    default:
      return state;
  }
}

const initial: State = {
  inventory: [],
  customCategories: [],
  analysisResults: [],
  analysisRunAt: undefined,
  saveFailed: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [currentPage, setCurrentPage] = React.useState<Page>('home');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Persist on every state change
  useEffect(() => {
    const ok = saveState({
      inventory: state.inventory,
      customCategories: state.customCategories,
      analysisResults: state.analysisResults,
      analysisRunAt: state.analysisRunAt,
    });
    dispatch({ type: 'SET_SAVE_FAILED', payload: !ok });
  }, [state.inventory, state.customCategories, state.analysisResults, state.analysisRunAt]);

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);

  const addRecord = useCallback((r: EquipmentRecord) => {
    dispatch({ type: 'ADD_RECORD', payload: r });
  }, []);

  const updateRecord = useCallback((r: EquipmentRecord) => {
    dispatch({ type: 'UPDATE_RECORD', payload: r });
  }, []);

  const deleteRecord = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RECORD', payload: id });
  }, []);

  const loadDemo = useCallback((force = false): 'loaded' | 'confirm' => {
    if (state.inventory.length > 0 && !force) return 'confirm';
    const now = new Date().toISOString();
    const records = DEMO_RECORDS.map(r => ({ ...r, id: `demo-${Date.now()}-${r.id}`, createdAt: now, updatedAt: now }));
    dispatch({ type: 'LOAD_DEMO', payload: records });
    return 'loaded';
  }, [state.inventory.length]);

  const runAnalysis = useCallback(() => {
    const results = analyzeAll(state.inventory);
    dispatch({ type: 'SET_ANALYSIS', payload: { results, runAt: new Date().toISOString() } });
  }, [state.inventory]);

  const addCustomCategory = useCallback((name: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: name });
  }, []);

  return (
    <AppContext.Provider value={{
      inventory: state.inventory,
      customCategories: state.customCategories,
      analysisResults: state.analysisResults,
      analysisRunAt: state.analysisRunAt,
      saveFailed: state.saveFailed,
      currentPage,
      navigate,
      addRecord,
      updateRecord,
      deleteRecord,
      loadDemo,
      runAnalysis,
      addCustomCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

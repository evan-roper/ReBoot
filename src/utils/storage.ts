import type { EquipmentRecord, AppState } from '../types/equipment';

const STORAGE_KEY = 'reboot_v1';

function isValidRecord(r: unknown): r is EquipmentRecord {
  if (!r || typeof r !== 'object') return false;
  const rec = r as Record<string, unknown>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.name === 'string' &&
    typeof rec.deviceType === 'string' &&
    typeof rec.quantity === 'number' &&
    rec.quantity > 0 &&
    typeof rec.condition === 'string' &&
    typeof rec.specs === 'object' &&
    typeof rec.createdAt === 'string' &&
    typeof rec.updatedAt === 'string'
  );
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const inventory = Array.isArray(parsed.inventory)
      ? parsed.inventory.filter(isValidRecord)
      : [];
    return {
      inventory,
      customCategories: Array.isArray(parsed.customCategories)
        ? parsed.customCategories.filter((c): c is string => typeof c === 'string')
        : [],
      analysisResults: Array.isArray(parsed.analysisResults) ? parsed.analysisResults : [],
      analysisRunAt: parsed.analysisRunAt,
      boardListings: Array.isArray(parsed.boardListings) ? parsed.boardListings : [],
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

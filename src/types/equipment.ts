export type Condition = 'Working' | 'Needs repair' | 'Untested' | 'Nonfunctional';

export type StorageType = 'HDD' | 'SSD' | 'NVMe' | 'eMMC' | 'Unknown';
export type StorageSubtype = 'Internal HDD' | 'Internal SSD' | 'NVMe' | 'External' | 'Unknown';
export type DDRGen = 'DDR3' | 'DDR4' | 'DDR5' | 'Unknown';
export type FormFactor = 'DIMM' | 'SO-DIMM' | 'Unknown';
export type NetSubtype = 'Switch' | 'Router' | 'Access Point' | 'Firewall' | 'Other' | 'Unknown';
export type PortSpeed = '10/100' | '1GbE' | '2.5GbE' | '10GbE' | 'Mixed' | 'Unknown';
export type PrinterType = 'Laser' | 'Inkjet' | 'Other' | 'Unknown';
export type PrinterConn = 'USB' | 'Network' | 'Wi-Fi' | 'Bluetooth' | 'Unknown';
export type GPUInterface = 'PCIe' | 'AGP' | 'Other' | 'Unknown';
export type CPUSocket = 'LGA1151' | 'LGA1200' | 'LGA1700' | 'AM4' | 'AM5' | 'TR4' | 'Other' | 'Unknown';
export type GPUPresence = 'Present' | 'Absent' | 'Unknown';
export type TestStatus = 'Passed' | 'Failed' | 'Not tested';
export type DataSanitization = 'Complete' | 'Pending' | 'Not required' | 'Unknown';

export type DeviceType =
  | 'Desktop'
  | 'Laptop'
  | 'Server'
  | 'Monitor'
  | 'UPS'
  | 'Networking'
  | 'Storage'
  | 'GPU'
  | 'CPU'
  | 'RAM'
  | 'Printer'
  | 'Custom';

export interface BaseSpecs {
  manufacturer?: string;
  model?: string;
  assetTag?: string;
  approximateAgeYears?: number;
  notes?: string;
}

export interface ComputerSpecs extends BaseSpecs {
  cpuModel?: string;
  coreCount?: number;
  ramGB?: number;
  storageGB?: number;
  storageType?: StorageType;
  dedicatedGPU?: GPUPresence;
  gpuModel?: string;
  gpuVramGB?: number;
  dataSanitization?: DataSanitization;
}

export interface MonitorSpecs extends BaseSpecs {
  screenSizeInch?: number;
  resolution?: string;
  connectionPorts?: string;
  displayTestStatus?: TestStatus;
}

export interface UPSSpecs extends BaseSpecs {
  vaRating?: number;
  wattRating?: number;
  batteryAgeYears?: number;
  batteryTestStatus?: TestStatus;
}

export interface NetworkingSpecs extends BaseSpecs {
  subtype?: NetSubtype;
  portCount?: number;
  portSpeed?: PortSpeed;
  managed?: boolean;
  poeCapable?: boolean;
}

export interface StorageSpecs extends BaseSpecs {
  subtype?: StorageSubtype;
  capacityGB?: number;
  interface?: string;
  healthStatus?: TestStatus;
  dataSanitization?: DataSanitization;
}

export interface GPUSpecs extends BaseSpecs {
  gpuModel?: string;
  vramGB?: number;
  interface?: GPUInterface;
  powerRequirementW?: number;
}

export interface CPUSpecs extends BaseSpecs {
  cpuModel?: string;
  coreCount?: number;
  socket?: CPUSocket;
}

export interface RAMSpecs extends BaseSpecs {
  totalCapacityGB?: number;
  ddrGen?: DDRGen;
  moduleCount?: number;
  formFactor?: FormFactor;
}

export interface PrinterSpecs extends BaseSpecs {
  printerType?: PrinterType;
  connectivity?: PrinterConn;
  printTestStatus?: TestStatus;
  consumablesStatus?: string;
  dataSanitization?: DataSanitization;
}

export interface CustomSpecs extends BaseSpecs {
  categoryName?: string;
  description?: string;
  specNotes?: string;
}

export type DeviceSpecs =
  | ComputerSpecs
  | MonitorSpecs
  | UPSSpecs
  | NetworkingSpecs
  | StorageSpecs
  | GPUSpecs
  | CPUSpecs
  | RAMSpecs
  | PrinterSpecs
  | CustomSpecs;

export interface EquipmentRecord {
  id: string;
  name: string;
  deviceType: DeviceType;
  quantity: number;
  condition: Condition;
  specs: DeviceSpecs;
  createdAt: string;
  updatedAt: string;
  analysisStatus?: 'analyzed' | 'pending' | 'stale';
  photoDataUrl?: string; // base64 data URL, resized for storage
}

export type Classification =
  | 'Reuse Candidate'
  | 'Refurbish Candidate'
  | 'Parts Candidate'
  | 'Needs Assessment';

export type Readiness = 'Candidate' | 'Conditional' | 'Blocked';

export interface AnalysisResult {
  recordId: string;
  classification: Classification;
  readiness: Readiness;
  reasons: string[];
  missingInfo: string[];
  requiredChecks: string[];
  potentialApplications: string[];
  hiddenPotential: HiddenPotentialItem[];
}

export interface HiddenPotentialItem {
  opportunityId: string;
  opportunityTitle: string;
  explanation: string;
  prerequisites: string[];
  requiredChecks: string[];
  matchStrength: 'Strong' | 'Conditional' | 'Speculative';
}

export type Page = 'home' | 'inventory' | 'analysis' | 'opportunities' | 'surplus' | 'marketplace';

// ── Board listings (surplus / missing) ──────────────────────────────────────

export type BoardListingStatus = 'available' | 'fulfilled' | 'expired';

export interface BoardListing {
  id: string;
  kind: 'surplus' | 'missing';
  companyName: string;
  contactEmail: string;
  deviceType: DeviceType;
  name: string;
  quantity: number;
  condition?: Condition;
  specs: string;
  location?: string;
  status: BoardListingStatus;
  postedAt: string;
  updatedAt: string;
  inventoryRecordId?: string;
  isPublic?: boolean;             // posted to public marketplace
  price?: number;                 // asking price (undefined = free / not set)
  isNonProfit?: boolean;          // non-profit donation listing
}

export interface AppState {
  inventory: EquipmentRecord[];
  customCategories: string[];
  analysisResults: AnalysisResult[];
  analysisRunAt?: string;
  boardListings: BoardListing[];
}

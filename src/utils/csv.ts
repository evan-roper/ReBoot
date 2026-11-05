/**
 * CSV Import/Export utility for ReBoot inventory.
 *
 * Schema version: 1
 * One row = one EquipmentRecord. All spec fields are flat columns.
 * Columns that don't apply to a device type are left blank.
 * Text values containing commas or quotes are properly quoted per RFC 4180.
 * All user-entered text fields are prefixed with a tab character to prevent
 * spreadsheet formula injection (Excel/Sheets treat leading = + - @ as formulas).
 */

import type {
  EquipmentRecord,
  DeviceType,
  Condition,
  StorageType,
  StorageSubtype,
  DDRGen,
  FormFactor,
  NetSubtype,
  PortSpeed,
  PrinterType,
  PrinterConn,
  GPUInterface,
  CPUSocket,
  GPUPresence,
  TestStatus,
  DataSanitization,
} from '../types/equipment';

// ─── Column definitions ──────────────────────────────────────────────────────

export const CSV_COLUMNS = [
  // Core
  'name',
  'device_type',
  'quantity',
  'condition',
  // Identification
  'manufacturer',
  'model',
  'asset_tag',
  'approximate_age_years',
  'notes',
  // Computer (Desktop / Laptop / Server)
  'cpu_model',
  'core_count',
  'ram_gb',
  'storage_gb',
  'storage_type',
  'dedicated_gpu',
  'gpu_model',
  'gpu_vram_gb',
  'data_sanitization',
  // Monitor
  'screen_size_inch',
  'resolution',
  'connection_ports',
  'display_test_status',
  // UPS
  'va_rating',
  'watt_rating',
  'battery_age_years',
  'battery_test_status',
  // Networking
  'net_subtype',
  'port_count',
  'port_speed',
  'managed',
  'poe_capable',
  // Storage device
  'storage_subtype',
  'storage_capacity_gb',
  'storage_interface',
  'health_status',
  // GPU
  'gpu_vram_gb_standalone',
  'gpu_interface',
  'power_requirement_w',
  // CPU
  'cpu_socket',
  // RAM
  'ram_total_capacity_gb',
  'ddr_gen',
  'module_count',
  'form_factor',
  // Printer
  'printer_type',
  'printer_connectivity',
  'print_test_status',
  'consumables_status',
  // Custom
  'custom_category_name',
  'custom_description',
  'custom_spec_notes',
] as const;

export type CsvColumn = typeof CSV_COLUMNS[number];

// ─── Injection-safe quoting ───────────────────────────────────────────────────

/** Prefix user-entered free text with tab to block spreadsheet formula injection. */
function safeText(v: string | undefined): string {
  if (!v) return '';
  // Only prefix if it looks like it could be a formula trigger
  const triggers = ['=', '+', '-', '@', '\t'];
  return triggers.some(t => v.startsWith(t)) ? `\t${v}` : v;
}

/** RFC 4180 CSV cell quoting. */
function quoteCell(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function cell(v: string | number | boolean | undefined): string {
  if (v === undefined || v === null) return '';
  return quoteCell(String(v));
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportToCSV(inventory: EquipmentRecord[]): string {
  const rows: string[][] = [CSV_COLUMNS.slice() as unknown as string[]];

  for (const rec of inventory) {
    const s = rec.specs as Record<string, unknown>;
    const str = (k: string) => s[k] !== undefined ? safeText(String(s[k])) : '';
    const num = (k: string) => s[k] !== undefined ? String(s[k]) : '';
    const bool = (k: string) => s[k] !== undefined ? (s[k] ? 'true' : 'false') : '';

    const isComputer = ['Desktop', 'Laptop', 'Server'].includes(rec.deviceType);
    const isMonitor = rec.deviceType === 'Monitor';
    const isUPS = rec.deviceType === 'UPS';
    const isNet = rec.deviceType === 'Networking';
    const isStorage = rec.deviceType === 'Storage';
    const isGPU = rec.deviceType === 'GPU';
    const isCPU = rec.deviceType === 'CPU';
    const isRAM = rec.deviceType === 'RAM';
    const isPrinter = rec.deviceType === 'Printer';
    const isCustom = rec.deviceType === 'Custom';

    rows.push([
      // Core
      cell(safeText(rec.name)),
      cell(rec.deviceType),
      cell(rec.quantity),
      cell(rec.condition),
      // Identification
      cell(str('manufacturer')),
      cell(str('model')),
      cell(str('assetTag')),
      cell(num('approximateAgeYears')),
      cell(str('notes')),
      // Computer
      cell(isComputer ? str('cpuModel') : ''),
      cell(isComputer ? num('coreCount') : ''),
      cell(isComputer ? num('ramGB') : ''),
      cell(isComputer ? num('storageGB') : ''),
      cell(isComputer ? str('storageType') : ''),
      cell(isComputer ? str('dedicatedGPU') : ''),
      cell(isComputer ? str('gpuModel') : ''),
      cell(isComputer ? num('gpuVramGB') : ''),
      cell(isComputer || isPrinter || isStorage ? str('dataSanitization') : ''),
      // Monitor
      cell(isMonitor ? num('screenSizeInch') : ''),
      cell(isMonitor ? str('resolution') : ''),
      cell(isMonitor ? str('connectionPorts') : ''),
      cell(isMonitor ? str('displayTestStatus') : ''),
      // UPS
      cell(isUPS ? num('vaRating') : ''),
      cell(isUPS ? num('wattRating') : ''),
      cell(isUPS ? num('batteryAgeYears') : ''),
      cell(isUPS ? str('batteryTestStatus') : ''),
      // Networking
      cell(isNet ? str('subtype') : ''),
      cell(isNet ? num('portCount') : ''),
      cell(isNet ? str('portSpeed') : ''),
      cell(isNet ? bool('managed') : ''),
      cell(isNet ? bool('poeCapable') : ''),
      // Storage device
      cell(isStorage ? str('subtype') : ''),
      cell(isStorage ? num('capacityGB') : ''),
      cell(isStorage ? str('interface') : ''),
      cell(isStorage || isMonitor || isUPS || isPrinter ? str('healthStatus') : ''),
      // GPU standalone
      cell(isGPU ? num('vramGB') : ''),
      cell(isGPU ? str('interface') : ''),
      cell(isGPU ? num('powerRequirementW') : ''),
      // CPU
      cell(isCPU ? str('socket') : ''),
      // RAM
      cell(isRAM ? num('totalCapacityGB') : ''),
      cell(isRAM ? str('ddrGen') : ''),
      cell(isRAM ? num('moduleCount') : ''),
      cell(isRAM ? str('formFactor') : ''),
      // Printer
      cell(isPrinter ? str('printerType') : ''),
      cell(isPrinter ? str('connectivity') : ''),
      cell(isPrinter ? str('printTestStatus') : ''),
      cell(isPrinter ? str('consumablesStatus') : ''),
      // Custom
      cell(isCustom ? str('categoryName') : ''),
      cell(isCustom ? str('description') : ''),
      cell(isCustom ? str('specNotes') : ''),
    ]);
  }

  return rows.map(r => r.join(',')).join('\r\n');
}

export function downloadCSV(inventory: EquipmentRecord[]): void {
  const csv = exportToCSV(inventory);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reboot-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Parse ────────────────────────────────────────────────────────────────────

/** Minimal RFC 4180 CSV parser (handles quoted fields, embedded commas, double-quote escapes). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();
  if (!normalized) return rows;

  for (const line of normalized.split('\n')) {
    const cells: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let value = '';
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            value += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            value += line[i++];
          }
        }
        cells.push(value);
        if (line[i] === ',') i++;
      } else {
        const end = line.indexOf(',', i);
        if (end === -1) {
          cells.push(line.slice(i));
          break;
        } else {
          cells.push(line.slice(i, end));
          i = end + 1;
        }
      }
    }
    rows.push(cells);
  }
  return rows;
}

// ─── Validation & Import ──────────────────────────────────────────────────────

export interface ImportRowResult {
  rowNumber: number; // 1-based, header = 1
  record?: EquipmentRecord;
  errors: string[];
  warnings: string[];
  rawData: Record<string, string>;
}

export interface ImportResult {
  rows: ImportRowResult[];
  validCount: number;
  errorCount: number;
}

const VALID_DEVICE_TYPES = new Set<string>([
  'Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Networking',
  'Storage', 'GPU', 'CPU', 'RAM', 'Printer', 'Custom',
]);
const VALID_CONDITIONS = new Set<string>(['Working', 'Needs repair', 'Untested', 'Nonfunctional']);

/** Strip injection-prevention tab prefix if present. */
function cleanText(v: string): string {
  return v.startsWith('\t') ? v.slice(1).trim() : v.trim();
}

function optStr(v: string): string | undefined {
  const c = cleanText(v);
  return c !== '' ? c : undefined;
}

function optNum(v: string, field: string): { value?: number; error?: string } {
  const c = cleanText(v);
  if (!c) return {};
  const n = Number(c);
  if (isNaN(n) || n < 0) return { error: `${field}: "${c}" is not a valid non-negative number` };
  return { value: n };
}

function optEnum<T extends string>(v: string, valid: string[], field: string): { value?: T; error?: string } {
  const c = cleanText(v);
  if (!c) return {};
  if (!valid.includes(c)) return { error: `${field}: "${c}" is not a valid value. Allowed: ${valid.join(', ')}` };
  return { value: c as T };
}

function optBool(v: string): boolean | undefined {
  const c = cleanText(v).toLowerCase();
  if (c === 'true' || c === 'yes' || c === '1') return true;
  if (c === 'false' || c === 'no' || c === '0') return false;
  return undefined;
}

function genId() {
  return `csv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseRow(raw: Record<string, string>, rowNumber: number): ImportRowResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: name
  const name = cleanText(raw['name'] ?? '');
  if (!name) errors.push('name: required field is empty');

  // Required: device_type
  const deviceTypeRaw = cleanText(raw['device_type'] ?? '');
  if (!deviceTypeRaw) {
    errors.push('device_type: required field is empty');
  } else if (!VALID_DEVICE_TYPES.has(deviceTypeRaw)) {
    errors.push(`device_type: "${deviceTypeRaw}" is not valid. Allowed: ${[...VALID_DEVICE_TYPES].join(', ')}`);
  }
  const deviceType = VALID_DEVICE_TYPES.has(deviceTypeRaw) ? deviceTypeRaw as DeviceType : null;

  // Required: quantity
  const qtyRaw = cleanText(raw['quantity'] ?? '');
  let quantity = 1;
  if (!qtyRaw) {
    errors.push('quantity: required field is empty');
  } else {
    const q = Number(qtyRaw);
    if (!Number.isInteger(q) || q < 1) {
      errors.push(`quantity: "${qtyRaw}" must be a positive whole number`);
    } else {
      quantity = q;
    }
  }

  // Required: condition
  const condRaw = cleanText(raw['condition'] ?? '');
  if (!condRaw) {
    errors.push('condition: required field is empty');
  } else if (!VALID_CONDITIONS.has(condRaw)) {
    errors.push(`condition: "${condRaw}" is not valid. Allowed: ${[...VALID_CONDITIONS].join(', ')}`);
  }
  const condition = VALID_CONDITIONS.has(condRaw) ? condRaw as Condition : 'Untested';

  if (errors.length > 0 || !deviceType || !name) {
    return { rowNumber, errors, warnings, rawData: raw };
  }

  // Common specs
  const ageResult = optNum(raw['approximate_age_years'] ?? '', 'approximate_age_years');
  if (ageResult.error) warnings.push(ageResult.error);

  const commonSpecs = {
    manufacturer: optStr(raw['manufacturer'] ?? ''),
    model: optStr(raw['model'] ?? ''),
    assetTag: optStr(raw['asset_tag'] ?? ''),
    approximateAgeYears: ageResult.value,
    notes: optStr(raw['notes'] ?? ''),
  };

  let specs: Record<string, unknown> = { ...commonSpecs };

  if (['Desktop', 'Laptop', 'Server'].includes(deviceType)) {
    const coreResult = optNum(raw['core_count'] ?? '', 'core_count');
    const ramResult = optNum(raw['ram_gb'] ?? '', 'ram_gb');
    const storageResult = optNum(raw['storage_gb'] ?? '', 'storage_gb');
    const vramResult = optNum(raw['gpu_vram_gb'] ?? '', 'gpu_vram_gb');
    const sanitResult = optEnum<DataSanitization>(raw['data_sanitization'] ?? '', ['Complete', 'Pending', 'Not required', 'Unknown'], 'data_sanitization');
    const gpuPresResult = optEnum<GPUPresence>(raw['dedicated_gpu'] ?? '', ['Present', 'Absent', 'Unknown'], 'dedicated_gpu');
    const storTypeResult = optEnum<StorageType>(raw['storage_type'] ?? '', ['HDD', 'SSD', 'NVMe', 'eMMC', 'Unknown'], 'storage_type');
    [coreResult, ramResult, storageResult, vramResult, sanitResult, gpuPresResult, storTypeResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = {
      ...commonSpecs,
      cpuModel: optStr(raw['cpu_model'] ?? ''),
      coreCount: coreResult.value,
      ramGB: ramResult.value,
      storageGB: storageResult.value,
      storageType: storTypeResult.value,
      dedicatedGPU: gpuPresResult.value,
      gpuModel: gpuPresResult.value === 'Present' ? optStr(raw['gpu_model'] ?? '') : undefined,
      gpuVramGB: gpuPresResult.value === 'Present' ? vramResult.value : undefined,
      dataSanitization: sanitResult.value,
    };
  } else if (deviceType === 'Monitor') {
    const sizeResult = optNum(raw['screen_size_inch'] ?? '', 'screen_size_inch');
    const testResult = optEnum<TestStatus>(raw['display_test_status'] ?? '', ['Passed', 'Failed', 'Not tested'], 'display_test_status');
    [sizeResult, testResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, screenSizeInch: sizeResult.value, resolution: optStr(raw['resolution'] ?? ''), connectionPorts: optStr(raw['connection_ports'] ?? ''), displayTestStatus: testResult.value };
  } else if (deviceType === 'UPS') {
    const vaResult = optNum(raw['va_rating'] ?? '', 'va_rating');
    const wattResult = optNum(raw['watt_rating'] ?? '', 'watt_rating');
    const batAgeResult = optNum(raw['battery_age_years'] ?? '', 'battery_age_years');
    const batTestResult = optEnum<TestStatus>(raw['battery_test_status'] ?? '', ['Passed', 'Failed', 'Not tested'], 'battery_test_status');
    [vaResult, wattResult, batAgeResult, batTestResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, vaRating: vaResult.value, wattRating: wattResult.value, batteryAgeYears: batAgeResult.value, batteryTestStatus: batTestResult.value };
  } else if (deviceType === 'Networking') {
    const subtypeResult = optEnum<NetSubtype>(raw['net_subtype'] ?? '', ['Switch', 'Router', 'Access Point', 'Firewall', 'Other', 'Unknown'], 'net_subtype');
    const portResult = optNum(raw['port_count'] ?? '', 'port_count');
    const speedResult = optEnum<PortSpeed>(raw['port_speed'] ?? '', ['10/100', '1GbE', '2.5GbE', '10GbE', 'Mixed', 'Unknown'], 'port_speed');
    [subtypeResult, portResult, speedResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, subtype: subtypeResult.value, portCount: portResult.value, portSpeed: speedResult.value, managed: optBool(raw['managed'] ?? ''), poeCapable: optBool(raw['poe_capable'] ?? '') };
  } else if (deviceType === 'Storage') {
    const subtypeResult = optEnum<StorageSubtype>(raw['storage_subtype'] ?? '', ['Internal SSD', 'Internal HDD', 'NVMe', 'External', 'Unknown'], 'storage_subtype');
    const capResult = optNum(raw['storage_capacity_gb'] ?? '', 'storage_capacity_gb');
    const healthResult = optEnum<TestStatus>(raw['health_status'] ?? '', ['Passed', 'Failed', 'Not tested'], 'health_status');
    const sanitResult = optEnum<DataSanitization>(raw['data_sanitization'] ?? '', ['Complete', 'Pending', 'Not required', 'Unknown'], 'data_sanitization');
    [subtypeResult, capResult, healthResult, sanitResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, subtype: subtypeResult.value, capacityGB: capResult.value, interface: optStr(raw['storage_interface'] ?? ''), healthStatus: healthResult.value, dataSanitization: sanitResult.value };
  } else if (deviceType === 'GPU') {
    const vramResult = optNum(raw['gpu_vram_gb_standalone'] ?? '', 'gpu_vram_gb_standalone');
    const ifaceResult = optEnum<GPUInterface>(raw['gpu_interface'] ?? '', ['PCIe', 'AGP', 'Other', 'Unknown'], 'gpu_interface');
    const pwrResult = optNum(raw['power_requirement_w'] ?? '', 'power_requirement_w');
    [vramResult, ifaceResult, pwrResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, gpuModel: optStr(raw['cpu_model'] ?? '') || optStr(raw['gpu_model'] ?? ''), vramGB: vramResult.value, interface: ifaceResult.value, powerRequirementW: pwrResult.value };
  } else if (deviceType === 'CPU') {
    const coreResult = optNum(raw['core_count'] ?? '', 'core_count');
    const socketResult = optEnum<CPUSocket>(raw['cpu_socket'] ?? '', ['LGA1151', 'LGA1200', 'LGA1700', 'AM4', 'AM5', 'TR4', 'Other', 'Unknown'], 'cpu_socket');
    [coreResult, socketResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, cpuModel: optStr(raw['cpu_model'] ?? ''), coreCount: coreResult.value, socket: socketResult.value };
  } else if (deviceType === 'RAM') {
    const capResult = optNum(raw['ram_total_capacity_gb'] ?? '', 'ram_total_capacity_gb');
    const ddrResult = optEnum<DDRGen>(raw['ddr_gen'] ?? '', ['DDR3', 'DDR4', 'DDR5', 'Unknown'], 'ddr_gen');
    const modResult = optNum(raw['module_count'] ?? '', 'module_count');
    const ffResult = optEnum<FormFactor>(raw['form_factor'] ?? '', ['DIMM', 'SO-DIMM', 'Unknown'], 'form_factor');
    [capResult, ddrResult, modResult, ffResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, totalCapacityGB: capResult.value, ddrGen: ddrResult.value, moduleCount: modResult.value, formFactor: ffResult.value };
  } else if (deviceType === 'Printer') {
    const typeResult = optEnum<PrinterType>(raw['printer_type'] ?? '', ['Laser', 'Inkjet', 'Other', 'Unknown'], 'printer_type');
    const connResult = optEnum<PrinterConn>(raw['printer_connectivity'] ?? '', ['USB', 'Network', 'Wi-Fi', 'Bluetooth', 'Unknown'], 'printer_connectivity');
    const testResult = optEnum<TestStatus>(raw['print_test_status'] ?? '', ['Passed', 'Failed', 'Not tested'], 'print_test_status');
    const sanitResult = optEnum<DataSanitization>(raw['data_sanitization'] ?? '', ['Complete', 'Pending', 'Not required', 'Unknown'], 'data_sanitization');
    [typeResult, connResult, testResult, sanitResult].forEach(r => { if (r.error) warnings.push(r.error); });
    specs = { ...commonSpecs, printerType: typeResult.value, connectivity: connResult.value, printTestStatus: testResult.value, consumablesStatus: optStr(raw['consumables_status'] ?? ''), dataSanitization: sanitResult.value };
  } else if (deviceType === 'Custom') {
    const catName = cleanText(raw['custom_category_name'] ?? '');
    if (!catName) errors.push('custom_category_name: required for Custom device type');
    specs = { ...commonSpecs, categoryName: optStr(raw['custom_category_name'] ?? ''), description: optStr(raw['custom_description'] ?? ''), specNotes: optStr(raw['custom_spec_notes'] ?? '') };
  }

  if (errors.length > 0) return { rowNumber, errors, warnings, rawData: raw };

  const now = new Date().toISOString();
  const record: EquipmentRecord = {
    id: genId(),
    name,
    deviceType,
    quantity,
    condition,
    specs,
    createdAt: now,
    updatedAt: now,
  };

  return { rowNumber, record, errors, warnings, rawData: raw };
}

export function parseImportCSV(text: string): ImportResult {
  const rows = parseCSV(text);
  if (rows.length === 0) {
    return { rows: [], validCount: 0, errorCount: 0 };
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const results: ImportRowResult[] = [];

  for (let i = 1; i < rows.length; i++) {
    const dataRow = rows[i];
    // Skip fully empty rows
    if (dataRow.every(c => !c.trim())) continue;

    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h] = dataRow[idx] ?? ''; });

    // Validate all expected columns are present in header
    const missingCols = CSV_COLUMNS.filter(c => !headers.includes(c));
    if (missingCols.length > 0 && i === 1) {
      // Report once on first data row
      results.push({
        rowNumber: i + 1,
        errors: [`Missing required columns in header: ${missingCols.join(', ')}`],
        warnings: [],
        rawData: raw,
      });
      break;
    }

    results.push(parseRow(raw, i + 1));
  }

  return {
    rows: results,
    validCount: results.filter(r => r.record && r.errors.length === 0).length,
    errorCount: results.filter(r => r.errors.length > 0).length,
  };
}

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  EquipmentRecord, DeviceType, Condition, StorageType, StorageSubtype,
  DDRGen, FormFactor, NetSubtype, PortSpeed, PrinterType, PrinterConn,
  GPUInterface, CPUSocket, GPUPresence, TestStatus, DataSanitization,
} from '../types/equipment';
import { useApp } from '../context/AppContext';

const CONDITIONS: Condition[] = ['Working', 'Needs repair', 'Untested', 'Nonfunctional'];
const DEVICE_TYPES: DeviceType[] = [
  'Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Networking',
  'Storage', 'GPU', 'CPU', 'RAM', 'Printer', 'Custom',
];

function genId() {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  existing?: EquipmentRecord;
  onClose: () => void;
  onSaved: () => void;
}

type FormData = Record<string, string | boolean | number>;

function initialFormData(rec?: EquipmentRecord): FormData {
  if (!rec) return { quantity: '1', condition: 'Working' };
  const base: FormData = {
    name: rec.name,
    deviceType: rec.deviceType,
    quantity: String(rec.quantity),
    condition: rec.condition,
    manufacturer: (rec.specs as Record<string, unknown>).manufacturer as string ?? '',
    model: (rec.specs as Record<string, unknown>).model as string ?? '',
    assetTag: (rec.specs as Record<string, unknown>).assetTag as string ?? '',
    approximateAgeYears: String((rec.specs as Record<string, unknown>).approximateAgeYears ?? ''),
    notes: (rec.specs as Record<string, unknown>).notes as string ?? '',
  };
  // Spread all spec fields as strings
  const specs = rec.specs as Record<string, unknown>;
  for (const [k, v] of Object.entries(specs)) {
    if (v !== undefined && v !== null) {
      base[k] = typeof v === 'boolean' ? v : String(v);
    }
  }
  return base;
}

function Field({
  label, name, type = 'text', required, value, onChange, options, hint, min, placeholder
}: {
  label: string; name: string; type?: string; required?: boolean;
  value: string | boolean; onChange: (name: string, val: string | boolean) => void;
  options?: string[]; hint?: string; min?: number; placeholder?: string;
}) {
  const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-apptext focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

  return (
    <div>
      <label className="block text-sm font-medium text-apptext mb-1">
        {label}{required && <span className="text-red-500 ml-0.5" aria-label="required">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={String(value)}
          onChange={e => onChange(name, e.target.value)}
          required={required}
          className={inputClass}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          name={name}
          checked={Boolean(value)}
          onChange={e => onChange(name, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={String(value)}
          onChange={e => onChange(name, e.target.value)}
          required={required}
          min={min}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function ComputerFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const storageTypes: StorageType[] = ['SSD', 'NVMe', 'HDD', 'eMMC', 'Unknown'];
  const gpuPresence: GPUPresence[] = ['Present', 'Absent', 'Unknown'];
  const sanitization: DataSanitization[] = ['Complete', 'Pending', 'Not required', 'Unknown'];
  return (
    <>
      <Field label="CPU Model" name="cpuModel" value={data.cpuModel as string ?? ''} onChange={onChange} placeholder="e.g. Intel Core i5-8365U" />
      <Field label="CPU Core Count" name="coreCount" type="number" min={1} value={data.coreCount as string ?? ''} onChange={onChange} />
      <Field label="RAM (GB)" name="ramGB" type="number" min={1} value={data.ramGB as string ?? ''} onChange={onChange} />
      <Field label="Storage (GB)" name="storageGB" type="number" min={1} value={data.storageGB as string ?? ''} onChange={onChange} />
      <Field label="Storage Type" name="storageType" options={storageTypes} value={data.storageType as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Dedicated GPU" name="dedicatedGPU" options={gpuPresence} value={data.dedicatedGPU as string ?? 'Unknown'} onChange={onChange} />
      {data.dedicatedGPU === 'Present' && (
        <>
          <Field label="GPU Model" name="gpuModel" value={data.gpuModel as string ?? ''} onChange={onChange} placeholder="e.g. NVIDIA RTX 3060" />
          <Field label="GPU VRAM (GB)" name="gpuVramGB" type="number" min={1} value={data.gpuVramGB as string ?? ''} onChange={onChange} />
        </>
      )}
      <Field label="Data Sanitization Status" name="dataSanitization" options={sanitization} value={data.dataSanitization as string ?? 'Unknown'} onChange={onChange} hint="Required before deployment" />
    </>
  );
}

function MonitorFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const tests: TestStatus[] = ['Passed', 'Failed', 'Not tested'];
  return (
    <>
      <Field label="Screen Size (inches)" name="screenSizeInch" type="number" min={1} value={data.screenSizeInch as string ?? ''} onChange={onChange} />
      <Field label="Resolution" name="resolution" value={data.resolution as string ?? ''} onChange={onChange} placeholder="e.g. 1920x1080" />
      <Field label="Connection Ports" name="connectionPorts" value={data.connectionPorts as string ?? ''} onChange={onChange} placeholder="e.g. HDMI, DisplayPort" />
      <Field label="Display Test Status" name="displayTestStatus" options={tests} value={data.displayTestStatus as string ?? 'Not tested'} onChange={onChange} />
    </>
  );
}

function UPSFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const tests: TestStatus[] = ['Passed', 'Failed', 'Not tested'];
  return (
    <>
      <Field label="VA Rating" name="vaRating" type="number" min={1} value={data.vaRating as string ?? ''} onChange={onChange} />
      <Field label="Watt Rating" name="wattRating" type="number" min={1} value={data.wattRating as string ?? ''} onChange={onChange} />
      <Field label="Battery Age (years)" name="batteryAgeYears" type="number" min={0} value={data.batteryAgeYears as string ?? ''} onChange={onChange} />
      <Field label="Battery Test Status" name="batteryTestStatus" options={tests} value={data.batteryTestStatus as string ?? 'Not tested'} onChange={onChange} />
    </>
  );
}

function NetworkingFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const subtypes: NetSubtype[] = ['Switch', 'Router', 'Access Point', 'Firewall', 'Other', 'Unknown'];
  const speeds: PortSpeed[] = ['10/100', '1GbE', '2.5GbE', '10GbE', 'Mixed', 'Unknown'];
  return (
    <>
      <Field label="Device Subtype" name="subtype" options={subtypes} value={data.subtype as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Port Count" name="portCount" type="number" min={1} value={data.portCount as string ?? ''} onChange={onChange} />
      <Field label="Port Speed" name="portSpeed" options={speeds} value={data.portSpeed as string ?? 'Unknown'} onChange={onChange} />
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-apptext flex items-center gap-2">
          <input type="checkbox" checked={Boolean(data.managed)} onChange={e => onChange('managed', e.target.checked)} className="rounded border-gray-300" />
          Managed Switch
        </label>
        <label className="text-sm font-medium text-apptext flex items-center gap-2">
          <input type="checkbox" checked={Boolean(data.poeCapable)} onChange={e => onChange('poeCapable', e.target.checked)} className="rounded border-gray-300" />
          PoE Capable
        </label>
      </div>
    </>
  );
}

function StorageFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const subtypes: StorageSubtype[] = ['Internal SSD', 'Internal HDD', 'NVMe', 'External', 'Unknown'];
  const tests: TestStatus[] = ['Passed', 'Failed', 'Not tested'];
  const sanitization: DataSanitization[] = ['Complete', 'Pending', 'Not required', 'Unknown'];
  return (
    <>
      <Field label="Storage Subtype" name="subtype" options={subtypes} value={data.subtype as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Capacity (GB)" name="capacityGB" type="number" min={1} value={data.capacityGB as string ?? ''} onChange={onChange} />
      <Field label="Interface" name="interface" value={data.interface as string ?? ''} onChange={onChange} placeholder="e.g. SATA, NVMe, USB" />
      <Field label="Health Status" name="healthStatus" options={tests} value={data.healthStatus as string ?? 'Not tested'} onChange={onChange} />
      <Field label="Data Sanitization Status" name="dataSanitization" options={sanitization} value={data.dataSanitization as string ?? 'Unknown'} onChange={onChange} />
    </>
  );
}

function GPUFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const interfaces: GPUInterface[] = ['PCIe', 'AGP', 'Other', 'Unknown'];
  return (
    <>
      <Field label="GPU Model" name="gpuModel" value={data.gpuModel as string ?? ''} onChange={onChange} placeholder="e.g. NVIDIA RTX 3080" />
      <Field label="VRAM (GB)" name="vramGB" type="number" min={1} value={data.vramGB as string ?? ''} onChange={onChange} />
      <Field label="Interface" name="interface" options={interfaces} value={data.interface as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Power Requirement (W, optional)" name="powerRequirementW" type="number" min={1} value={data.powerRequirementW as string ?? ''} onChange={onChange} />
    </>
  );
}

function CPUFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const sockets: CPUSocket[] = ['LGA1151', 'LGA1200', 'LGA1700', 'AM4', 'AM5', 'TR4', 'Other', 'Unknown'];
  return (
    <>
      <Field label="CPU Model" name="cpuModel" value={data.cpuModel as string ?? ''} onChange={onChange} placeholder="e.g. Intel Core i7-8700K" />
      <Field label="Core Count" name="coreCount" type="number" min={1} value={data.coreCount as string ?? ''} onChange={onChange} />
      <Field label="Socket" name="socket" options={sockets} value={data.socket as string ?? 'Unknown'} onChange={onChange} />
    </>
  );
}

function RAMFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const ddrGens: DDRGen[] = ['DDR3', 'DDR4', 'DDR5', 'Unknown'];
  const formFactors: FormFactor[] = ['DIMM', 'SO-DIMM', 'Unknown'];
  return (
    <>
      <Field label="Total Capacity (GB)" name="totalCapacityGB" type="number" min={1} value={data.totalCapacityGB as string ?? ''} onChange={onChange} hint="Total GB per unit or kit" />
      <Field label="DDR Generation" name="ddrGen" options={ddrGens} value={data.ddrGen as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Module Count" name="moduleCount" type="number" min={1} value={data.moduleCount as string ?? ''} onChange={onChange} />
      <Field label="Form Factor" name="formFactor" options={formFactors} value={data.formFactor as string ?? 'Unknown'} onChange={onChange} />
    </>
  );
}

function PrinterFields({ data, onChange }: { data: FormData; onChange: (n: string, v: string | boolean) => void }) {
  const types: PrinterType[] = ['Laser', 'Inkjet', 'Other', 'Unknown'];
  const conns: PrinterConn[] = ['USB', 'Network', 'Wi-Fi', 'Bluetooth', 'Unknown'];
  const tests: TestStatus[] = ['Passed', 'Failed', 'Not tested'];
  const sanitization: DataSanitization[] = ['Complete', 'Pending', 'Not required', 'Unknown'];
  return (
    <>
      <Field label="Printer Type" name="printerType" options={types} value={data.printerType as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Connectivity" name="connectivity" options={conns} value={data.connectivity as string ?? 'Unknown'} onChange={onChange} />
      <Field label="Print Test Status" name="printTestStatus" options={tests} value={data.printTestStatus as string ?? 'Not tested'} onChange={onChange} />
      <Field label="Consumables Status" name="consumablesStatus" value={data.consumablesStatus as string ?? ''} onChange={onChange} placeholder="e.g. Toner low, Ink full" />
      <Field label="Data Sanitization" name="dataSanitization" options={sanitization} value={data.dataSanitization as string ?? 'Unknown'} onChange={onChange} hint="Clear stored print jobs before reuse" />
    </>
  );
}

function CustomFields({ data, onChange, categories }: { data: FormData; onChange: (n: string, v: string | boolean) => void; categories: string[] }) {
  return (
    <>
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-apptext mb-1">Category (saved)</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-apptext focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={data.categoryName as string ?? ''}
            onChange={e => onChange('categoryName', e.target.value)}
          >
            <option value="">— New category —</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <Field label="Category Name" name="categoryName" value={data.categoryName as string ?? ''} onChange={onChange} placeholder="e.g. KVM Switch, Barcode Scanner" required />
      <Field label="Description" name="description" value={data.description as string ?? ''} onChange={onChange} placeholder="Brief description of the device" />
      <Field label="Specification Notes (optional)" name="specNotes" value={data.specNotes as string ?? ''} onChange={onChange} placeholder="Any relevant specs" hint="Custom devices receive conservative assessment — free-text notes do not affect analysis" />
    </>
  );
}

function buildSpecs(deviceType: DeviceType, data: FormData): Record<string, unknown> {
  const common = {
    manufacturer: data.manufacturer || undefined,
    model: data.model || undefined,
    assetTag: data.assetTag || undefined,
    approximateAgeYears: data.approximateAgeYears ? Number(data.approximateAgeYears) : undefined,
    notes: data.notes || undefined,
  };
  function n(k: string) { return data[k] ? Number(data[k]) : undefined; }
  function s(k: string) { return data[k] || undefined; }

  switch (deviceType) {
    case 'Desktop': case 'Laptop': case 'Server':
      return {
        ...common,
        cpuModel: s('cpuModel'), coreCount: n('coreCount'), ramGB: n('ramGB'),
        storageGB: n('storageGB'), storageType: s('storageType') ?? 'Unknown',
        dedicatedGPU: s('dedicatedGPU') ?? 'Unknown',
        gpuModel: data.dedicatedGPU === 'Present' ? s('gpuModel') : undefined,
        gpuVramGB: data.dedicatedGPU === 'Present' ? n('gpuVramGB') : undefined,
        dataSanitization: s('dataSanitization') ?? 'Unknown',
      };
    case 'Monitor':
      return { ...common, screenSizeInch: n('screenSizeInch'), resolution: s('resolution'), connectionPorts: s('connectionPorts'), displayTestStatus: s('displayTestStatus') ?? 'Not tested' };
    case 'UPS':
      return { ...common, vaRating: n('vaRating'), wattRating: n('wattRating'), batteryAgeYears: n('batteryAgeYears'), batteryTestStatus: s('batteryTestStatus') ?? 'Not tested' };
    case 'Networking':
      return { ...common, subtype: s('subtype') ?? 'Unknown', portCount: n('portCount'), portSpeed: s('portSpeed') ?? 'Unknown', managed: Boolean(data.managed), poeCapable: Boolean(data.poeCapable) };
    case 'Storage':
      return { ...common, subtype: s('subtype') ?? 'Unknown', capacityGB: n('capacityGB'), interface: s('interface'), healthStatus: s('healthStatus') ?? 'Not tested', dataSanitization: s('dataSanitization') ?? 'Unknown' };
    case 'GPU':
      return { ...common, gpuModel: s('gpuModel'), vramGB: n('vramGB'), interface: s('interface') ?? 'Unknown', powerRequirementW: n('powerRequirementW') };
    case 'CPU':
      return { ...common, cpuModel: s('cpuModel'), coreCount: n('coreCount'), socket: s('socket') ?? 'Unknown' };
    case 'RAM':
      return { ...common, totalCapacityGB: n('totalCapacityGB'), ddrGen: s('ddrGen') ?? 'Unknown', moduleCount: n('moduleCount'), formFactor: s('formFactor') ?? 'Unknown' };
    case 'Printer':
      return { ...common, printerType: s('printerType') ?? 'Unknown', connectivity: s('connectivity') ?? 'Unknown', printTestStatus: s('printTestStatus') ?? 'Not tested', consumablesStatus: s('consumablesStatus'), dataSanitization: s('dataSanitization') ?? 'Unknown' };
    default:
      return { ...common, categoryName: s('categoryName'), description: s('description'), specNotes: s('specNotes') };
  }
}

export function EquipmentForm({ existing, onClose, onSaved }: Props) {
  const { addRecord, updateRecord, customCategories, addCustomCategory } = useApp();
  const [data, setData] = useState<FormData>(() => initialFormData(existing));
  const [errors, setErrors] = useState<string[]>([]);

  // When device type changes, reset type-specific fields
  const [prevType, setPrevType] = useState<string>(data.deviceType as string ?? '');
  useEffect(() => {
    if (prevType && prevType !== data.deviceType) {
      const preserve = ['name', 'deviceType', 'quantity', 'condition', 'manufacturer', 'model', 'assetTag', 'approximateAgeYears', 'notes'];
      const clean: FormData = {};
      for (const k of preserve) {
        if (data[k] !== undefined) clean[k] = data[k];
      }
      setData(clean);
      setPrevType(data.deviceType as string);
    }
  }, [data, prevType]);

  function handleChange(name: string, value: string | boolean) {
    setData(prev => ({ ...prev, [name]: value }));
    if (name === 'deviceType') setPrevType(prev => prev);
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!String(data.name ?? '').trim()) errs.push('Name is required.');
    if (!data.deviceType) errs.push('Device type is required.');
    const qty = Number(data.quantity);
    if (!Number.isInteger(qty) || qty < 1) errs.push('Quantity must be a positive whole number.');
    if (data.deviceType === 'Custom' && !String(data.categoryName ?? '').trim()) errs.push('Category name is required for custom devices.');
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }

    const deviceType = data.deviceType as DeviceType;
    const specs = buildSpecs(deviceType, data);
    const now = new Date().toISOString();

    // Save custom category
    if (deviceType === 'Custom' && data.categoryName) {
      addCustomCategory(String(data.categoryName));
    }

    if (existing) {
      updateRecord({
        ...existing,
        name: String(data.name).trim(),
        deviceType,
        quantity: Number(data.quantity),
        condition: data.condition as Condition,
        specs,
        updatedAt: now,
      });
    } else {
      addRecord({
        id: genId(),
        name: String(data.name).trim(),
        deviceType,
        quantity: Number(data.quantity),
        condition: data.condition as Condition,
        specs,
        createdAt: now,
        updatedAt: now,
      });
    }
    onSaved();
  }

  const deviceType = (data.deviceType as string) || undefined as DeviceType | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8 pb-4 px-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Equipment form">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-apptext">{existing ? 'Edit Equipment' : 'Add Equipment'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <Field label="Name" name="name" required value={data.name as string ?? ''} onChange={handleChange} placeholder="e.g. Dell OptiPlex 3060 Batch A" />

          <Field
            label="Device Type" name="deviceType" required
            options={['', ...DEVICE_TYPES]}
            value={data.deviceType as string ?? ''}
            onChange={handleChange}
          />

          {deviceType === 'Custom' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              Custom devices receive a conservative assessment. Free-text notes do not affect analysis classifications.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" name="quantity" type="number" required min={1} value={data.quantity as string ?? '1'} onChange={handleChange} hint="Number of identical units" />
            <Field label="Condition" name="condition" required options={CONDITIONS} value={data.condition as string ?? 'Working'} onChange={handleChange} />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Identification (optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Manufacturer" name="manufacturer" value={data.manufacturer as string ?? ''} onChange={handleChange} />
              <Field label="Model" name="model" value={data.model as string ?? ''} onChange={handleChange} />
              <Field label="Asset Tag / Batch Ref" name="assetTag" value={data.assetTag as string ?? ''} onChange={handleChange} />
              <Field label="Approx. Age (years)" name="approximateAgeYears" type="number" min={0} value={data.approximateAgeYears as string ?? ''} onChange={handleChange} />
            </div>
          </div>

          {deviceType && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {deviceType} Specifications
                <span className="normal-case font-normal ml-2 text-gray-400">(incomplete specs limit analysis)</span>
              </p>
              <div className="space-y-4">
                {['Desktop', 'Laptop', 'Server'].includes(deviceType) && <ComputerFields data={data} onChange={handleChange} />}
                {deviceType === 'Monitor' && <MonitorFields data={data} onChange={handleChange} />}
                {deviceType === 'UPS' && <UPSFields data={data} onChange={handleChange} />}
                {deviceType === 'Networking' && <NetworkingFields data={data} onChange={handleChange} />}
                {deviceType === 'Storage' && <StorageFields data={data} onChange={handleChange} />}
                {deviceType === 'GPU' && <GPUFields data={data} onChange={handleChange} />}
                {deviceType === 'CPU' && <CPUFields data={data} onChange={handleChange} />}
                {deviceType === 'RAM' && <RAMFields data={data} onChange={handleChange} />}
                {deviceType === 'Printer' && <PrinterFields data={data} onChange={handleChange} />}
                {deviceType === 'Custom' && <CustomFields data={data} onChange={handleChange} categories={customCategories} />}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <Field label="Notes (optional)" name="notes" value={data.notes as string ?? ''} onChange={handleChange} placeholder="Any additional context" />
          </div>

          {deviceType && ['Desktop', 'Laptop', 'Server'].includes(deviceType) && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              💡 Create separate records for units with different configurations or conditions — each record represents identical units.
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-forest focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {existing ? 'Save Changes' : 'Add Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
}

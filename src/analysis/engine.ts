import type {
  EquipmentRecord,
  AnalysisResult,
  Classification,
  Readiness,
  HiddenPotentialItem,
  ComputerSpecs,
  MonitorSpecs,
  UPSSpecs,
  NetworkingSpecs,
  StorageSpecs,
  GPUSpecs,
  CPUSpecs,
  RAMSpecs,
  PrinterSpecs,
} from '../types/equipment';

// ─── Opportunity IDs ────────────────────────────────────────────────────────
export const OPPORTUNITY_IDS = {
  PRODUCTIVITY: 'productivity',
  DEVELOPMENT: 'development',
  VIRTUALIZATION: 'virtualization',
  LOCAL_AI: 'local_ai',
  SECONDARY_DISPLAY: 'secondary_display',
  NETWORK_LAB: 'network_lab',
  STORAGE_EXPANSION: 'storage_expansion',
  COMPONENT_UPGRADE: 'component_upgrade',
  PRINT_STATION: 'print_station',
  BACKUP_POWER: 'backup_power',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────
function num(v: unknown): number | undefined {
  return typeof v === 'number' && v > 0 ? v : undefined;
}

// ─── Per-type analysis ──────────────────────────────────────────────────────
function analyzeComputer(
  rec: EquipmentRecord,
  specs: ComputerSpecs
): Omit<AnalysisResult, 'recordId'> {
  const reasons: string[] = [];
  const missingInfo: string[] = [];
  const requiredChecks: string[] = [];
  const potentialApplications: string[] = [];
  const hiddenPotential: HiddenPotentialItem[] = [];

  // Common checks
  requiredChecks.push('Functional diagnostics and power-on test');
  requiredChecks.push('Electrical safety inspection');

  if (rec.deviceType === 'Laptop') {
    requiredChecks.push('Battery condition assessment');
  }
  if (rec.deviceType === 'Server') {
    requiredChecks.push('Power consumption, heat, and noise evaluation');
    requiredChecks.push('Management access reset and configuration wipe');
  }

  // Condition gate
  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment',
      readiness: 'Blocked',
      reasons: ['Equipment is untested — condition and functionality unknown'],
      missingInfo: ['Functional test results', 'Hardware diagnostics'],
      requiredChecks,
      potentialApplications: [],
      hiddenPotential: [],
    };
  }

  if (rec.condition === 'Nonfunctional') {
    reasons.push('Equipment is nonfunctional');
    reasons.push('Component usability still requires individual testing');
    return {
      classification: 'Parts Candidate',
      readiness: 'Blocked',
      reasons,
      missingInfo,
      requiredChecks: ['Individual component testing before any reuse'],
      potentialApplications: ['Spare parts for compatible systems'],
      hiddenPotential: [],
    };
  }

  if (rec.condition === 'Needs repair') {
    reasons.push('Equipment requires repair before operational use');
    const postRepairPotentials: HiddenPotentialItem[] = [];
    if ((specs.coreCount ?? 0) >= 2 && (specs.ramGB ?? 0) >= 4 && (specs.storageGB ?? 0) >= 64) {
      postRepairPotentials.push({
        opportunityId: OPPORTUNITY_IDS.PRODUCTIVITY,
        opportunityTitle: 'Everyday Productivity & Learning',
        explanation: 'If successfully repaired, meets minimum specs for productivity use.',
        prerequisites: ['Successful repair', 'Data sanitization', 'OS installation'],
        requiredChecks: ['Repair verification', 'Full functional test post-repair'],
        matchStrength: 'Conditional',
      });
    }
    return {
      classification: 'Refurbish Candidate',
      readiness: 'Conditional',
      reasons,
      missingInfo,
      requiredChecks: ['Diagnosis and repair', 'Post-repair functional test', ...requiredChecks],
      potentialApplications: postRepairPotentials.length > 0
        ? ['Conditional post-repair reuse']
        : ['Refurbishment assessment needed'],
      hiddenPotential: postRepairPotentials,
    };
  }

  // Working — check specifications
  const cores = num(specs.coreCount);
  const ram = num(specs.ramGB);
  const storage = num(specs.storageGB);

  if (!cores) missingInfo.push('CPU core count');
  if (!ram) missingInfo.push('RAM amount (GB)');
  if (!storage) missingInfo.push('Storage capacity (GB)');
  if (!specs.storageType || specs.storageType === 'Unknown') missingInfo.push('Storage type');
  if (!specs.cpuModel) missingInfo.push('CPU model');

  if (!specs.dataSanitization || specs.dataSanitization === 'Unknown') {
    requiredChecks.push('Data sanitization (status unknown — required before reuse)');
  } else if (specs.dataSanitization === 'Pending') {
    requiredChecks.push('Data sanitization must be completed before deployment');
  }

  const sanitizationBlocked =
    !specs.dataSanitization ||
    specs.dataSanitization === 'Unknown' ||
    specs.dataSanitization === 'Pending';

  const hasEssentialSpecs = cores && ram && storage;

  let classification: Classification;
  let readiness: Readiness;

  if (!hasEssentialSpecs) {
    classification = 'Needs Assessment';
    readiness = 'Blocked';
    reasons.push('Missing essential specifications — cannot fully evaluate reuse potential');
  } else {
    classification = 'Reuse Candidate';
    readiness = sanitizationBlocked ? 'Conditional' : 'Candidate';
    reasons.push(`Working condition with ${cores} cores, ${ram} GB RAM, ${storage} GB storage`);
    if (sanitizationBlocked) {
      reasons.push('Data sanitization not confirmed — deployment blocked until complete');
    }
  }

  // Opportunities
  if (hasEssentialSpecs && cores && ram && storage) {
    // Productivity
    if (cores >= 2 && ram >= 4 && storage >= 64) {
      potentialApplications.push('Everyday productivity and learning');
      hiddenPotential.push({
        opportunityId: OPPORTUNITY_IDS.PRODUCTIVITY,
        opportunityTitle: 'Everyday Productivity & Learning',
        explanation: `${cores} cores, ${ram} GB RAM, and ${storage} GB storage meet minimum requirements for general productivity, web browsing, and learning tasks.`,
        prerequisites: ['Data sanitization', 'OS installation or verification'],
        requiredChecks: ['Confirm storage health', ...(sanitizationBlocked ? ['Complete data sanitization'] : [])],
        matchStrength: 'Strong',
      });
    }

    // Development
    if (cores >= 4 && ram >= 8 && storage >= 128) {
      potentialApplications.push('Software development workstation');
      hiddenPotential.push({
        opportunityId: OPPORTUNITY_IDS.DEVELOPMENT,
        opportunityTitle: 'Software Development Workstation',
        explanation: `${cores} cores, ${ram} GB RAM, and ${storage} GB storage are sufficient for a developer workstation running IDEs, build tools, and local services.`,
        prerequisites: ['Data sanitization', 'OS and toolchain installation'],
        requiredChecks: ['Storage health check', ...(sanitizationBlocked ? ['Complete data sanitization'] : [])],
        matchStrength: 'Strong',
      });
    }

    // Virtualization
    if (cores >= 4 && ram >= 16 && storage >= 256) {
      potentialApplications.push('Virtualization or home lab');
      hiddenPotential.push({
        opportunityId: OPPORTUNITY_IDS.VIRTUALIZATION,
        opportunityTitle: 'Virtualization / Home Lab',
        explanation: `${cores} cores, ${ram} GB RAM, and ${storage} GB storage enable running multiple virtual machines for testing or learning.`,
        prerequisites: ['Data sanitization', 'Verify CPU virtualization support in firmware'],
        requiredChecks: ['Verify virtualization support (VT-x/AMD-V)', 'Assess workload power and thermal requirements', ...(sanitizationBlocked ? ['Complete data sanitization'] : [])],
        matchStrength: 'Strong',
      });
    }

    // Local AI
    const hasGPU = specs.dedicatedGPU === 'Present';
    const vram = num(specs.gpuVramGB);
    if (ram >= 16 && hasGPU && vram && vram >= 8) {
      potentialApplications.push('Local AI experimentation');
      hiddenPotential.push({
        opportunityId: OPPORTUNITY_IDS.LOCAL_AI,
        opportunityTitle: 'Local AI Experimentation',
        explanation: `${ram} GB system RAM and a dedicated GPU with ${vram} GB VRAM meet illustrative minimums for running small local language models.`,
        prerequisites: ['Data sanitization', 'Compatible GPU drivers', 'Supported AI framework'],
        requiredChecks: [
          'Verify GPU software/driver compatibility',
          'Check model size against VRAM',
          'Assess power supply and thermal capacity',
          ...(sanitizationBlocked ? ['Complete data sanitization'] : []),
        ],
        matchStrength: 'Conditional',
      });
    } else if (ram >= 16 && hasGPU && !vram) {
      missingInfo.push('GPU VRAM amount — needed to evaluate local AI potential');
    }
  }

  return { classification, readiness, reasons, missingInfo, requiredChecks, potentialApplications, hiddenPotential };
}

function analyzeMonitor(rec: EquipmentRecord, specs: MonitorSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks: string[] = ['Visual inspection for physical damage'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested — display quality and functionality unknown'],
      missingInfo: ['Display test results'], requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Component testing before any reuse'], potentialApplications: ['Spare parts'], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair before use'], missingInfo: [],
      requiredChecks: ['Repair and post-repair test'], potentialApplications: [], hiddenPotential: [],
    };
  }

  if (!specs.screenSizeInch) missingInfo.push('Screen size (inches)');
  if (!specs.resolution) missingInfo.push('Resolution');
  if (!specs.connectionPorts) missingInfo.push('Connection ports');
  if (!specs.displayTestStatus || specs.displayTestStatus === 'Not tested') missingInfo.push('Display test result');

  const hasDisplay = specs.displayTestStatus === 'Passed';
  const hasResolution = !!specs.resolution;
  const hasPorts = !!specs.connectionPorts;

  if (hasDisplay && hasResolution && hasPorts) {
    potentialApplications.push('Secondary display');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.SECONDARY_DISPLAY,
      opportunityTitle: 'Secondary Display Setup',
      explanation: `Passed display test, resolution ${specs.resolution}, ports: ${specs.connectionPorts}. Suitable as a secondary monitor.`,
      prerequisites: ['Verify adapter compatibility with target source device'],
      requiredChecks: ['Confirm cable/adapter compatibility'],
      matchStrength: 'Strong',
    });
  } else if (specs.displayTestStatus === 'Failed') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Display test failed'],
      missingInfo, requiredChecks: ['Diagnosis of display failure'], potentialApplications: [], hiddenPotential: [],
    };
  }

  const classification: Classification = missingInfo.length > 0 ? 'Needs Assessment' : 'Reuse Candidate';
  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [classification === 'Reuse Candidate' ? 'Working monitor with verified display' : 'Missing specifications limit evaluation'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeUPS(rec: EquipmentRecord, specs: UPSSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks: string[] = ['Electrical safety inspection', 'Qualified service for battery handling'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested UPS — battery condition unknown'],
      missingInfo: ['Battery test results', 'Load test'], requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Battery disposal by qualified service'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Qualified service inspection and repair'], potentialApplications: [], hiddenPotential: [],
    };
  }

  const va = num(specs.vaRating);
  const watts = num(specs.wattRating);
  const batteryOk = specs.batteryTestStatus === 'Passed';
  const batteryFailed = specs.batteryTestStatus === 'Failed';
  const batteryUnknown = !specs.batteryTestStatus || specs.batteryTestStatus === 'Not tested';

  if (!va) missingInfo.push('VA rating');
  if (!watts) missingInfo.push('Watt rating');
  if (batteryUnknown) missingInfo.push('Battery test result');

  if (batteryFailed) {
    requiredChecks.push('Battery replacement by qualified service — SAFETY BLOCKER');
    return {
      classification: 'Needs Assessment',
      readiness: 'Blocked',
      reasons: ['Battery test failed — operational use blocked for safety'],
      missingInfo, requiredChecks, potentialApplications: [],
      hiddenPotential: [{
        opportunityId: OPPORTUNITY_IDS.BACKUP_POWER,
        opportunityTitle: 'Backup Power Support',
        explanation: 'Could provide backup power after battery replacement by qualified service.',
        prerequisites: ['Battery replacement and certification by qualified technician'],
        requiredChecks: ['Battery replacement', 'Load test after replacement'],
        matchStrength: 'Conditional',
      }],
    };
  }

  if (batteryUnknown || !va || !watts) {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Missing essential UPS information — cannot confirm safe operational use'],
      missingInfo, requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }

  if (batteryOk && va && watts) {
    potentialApplications.push('Backup power support');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.BACKUP_POWER,
      opportunityTitle: 'Backup Power Support',
      explanation: `${va}VA / ${watts}W UPS with passed battery test. Suitable for protecting critical equipment during brief power interruptions.`,
      prerequisites: ['Verify actual load requirements of protected equipment'],
      requiredChecks: ['Load compatibility test', 'Check battery age and condition', 'Qualified service sign-off'],
      matchStrength: 'Strong',
    });
  }

  return {
    classification: 'Reuse Candidate', readiness: 'Candidate',
    reasons: [`Working UPS, ${va}VA / ${watts}W, battery test passed`],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeNetworking(rec: EquipmentRecord, specs: NetworkingSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks: string[] = [
    'Verify firmware version and support status',
    'Perform secure configuration reset and credential wipe',
    'Network isolation during initial testing',
  ];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested networking device'],
      missingInfo: ['Functional test'], requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Component test before reuse'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and post-repair test', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  if (!specs.subtype || specs.subtype === 'Unknown') missingInfo.push('Device subtype');
  if (!specs.portCount) missingInfo.push('Port count');
  if (!specs.portSpeed || specs.portSpeed === 'Unknown') missingInfo.push('Port speed');

  const hasEssentials = specs.subtype && specs.subtype !== 'Unknown' && specs.portCount && specs.portSpeed && specs.portSpeed !== 'Unknown';

  if (hasEssentials) {
    potentialApplications.push('Network training lab');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.NETWORK_LAB,
      opportunityTitle: 'Network Training Lab',
      explanation: `${specs.subtype} with ${specs.portCount} ports at ${specs.portSpeed}. Suitable for network training and lab environments after secure reset.`,
      prerequisites: ['Secure configuration and credential reset', 'Firmware update or version verification'],
      requiredChecks: [...requiredChecks],
      matchStrength: 'Strong',
    });
  }

  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';
  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [classification === 'Reuse Candidate' ? `Working ${specs.subtype}, ${specs.portCount} ports at ${specs.portSpeed}` : 'Missing essential specifications'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeStorage(rec: EquipmentRecord, specs: StorageSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks: string[] = ['Data sanitization (required before reuse)', 'Compatibility check with target system'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested storage — health unknown'],
      missingInfo: ['Health status test'], requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional storage device'],
      missingInfo: [],
      requiredChecks: ['Safe disposal — do not assume data is inaccessible'],
      potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair assessment', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  const cap = num(specs.capacityGB);
  if (!cap) missingInfo.push('Storage capacity (GB)');
  if (!specs.subtype || specs.subtype === 'Unknown') missingInfo.push('Storage subtype');
  if (!specs.interface) missingInfo.push('Interface type');
  if (!specs.healthStatus || specs.healthStatus === 'Not tested') missingInfo.push('Health status test result');
  if (!specs.dataSanitization || specs.dataSanitization === 'Unknown') {
    requiredChecks.push('Data sanitization status must be confirmed');
  }

  const healthPassed = specs.healthStatus === 'Passed';
  const healthFailed = specs.healthStatus === 'Failed';

  if (healthFailed) {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Health check failed — drive may be unreliable'],
      missingInfo, requiredChecks: ['Immediate data recovery assessment', 'Do not use as sole backup'], potentialApplications: [], hiddenPotential: [],
    };
  }

  const sanitized = specs.dataSanitization === 'Complete';
  const sanitizationBlocked = !sanitized;
  if (sanitizationBlocked) requiredChecks.push('Data sanitization must be completed before reuse');

  if (healthPassed && cap && specs.interface) {
    potentialApplications.push('Backup or storage expansion');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.STORAGE_EXPANSION,
      opportunityTitle: 'Backup / Storage Expansion',
      explanation: `Healthy ${cap} GB drive (${specs.interface}). Suitable for backup or secondary storage after sanitization. Never rely on a single drive as the only backup.`,
      prerequisites: ['Data sanitization', 'Compatibility with target system interface'],
      requiredChecks: ['Interface compatibility check', ...(sanitizationBlocked ? ['Complete data sanitization'] : [])],
      matchStrength: 'Strong',
    });
  }

  const hasEssentials = cap && specs.interface && healthPassed;
  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';

  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? (sanitizationBlocked ? 'Conditional' : 'Candidate') : 'Blocked',
    reasons: [hasEssentials ? `Working ${specs.subtype ?? 'storage'}, ${cap} GB, ${specs.interface}` : 'Missing essential information for evaluation'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeGPU(rec: EquipmentRecord, specs: GPUSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks: string[] = [
    'Host system compatibility check (PCIe slot, power connectors)',
    'Thermal and power supply assessment',
  ];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested GPU'], missingInfo: ['Functional test'],
      requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Component test before reuse'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and test', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  const vram = num(specs.vramGB);
  if (!specs.gpuModel) missingInfo.push('GPU model');
  if (!vram) missingInfo.push('VRAM amount (GB)');
  if (!specs.interface || specs.interface === 'Unknown') missingInfo.push('Interface type');

  if (specs.gpuModel && vram && specs.interface && specs.interface !== 'Unknown') {
    potentialApplications.push('Component upgrade');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.COMPONENT_UPGRADE,
      opportunityTitle: 'Compatible Component Upgrade',
      explanation: `${specs.gpuModel} with ${vram} GB VRAM (${specs.interface}). Could upgrade a compatible system.`,
      prerequisites: ['Verify PCIe slot and form factor compatibility', 'Verify power connector availability'],
      requiredChecks: [...requiredChecks],
      matchStrength: 'Conditional',
    });
  }

  const hasEssentials = specs.gpuModel && vram && specs.interface && specs.interface !== 'Unknown';
  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';

  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [hasEssentials ? `Working GPU: ${specs.gpuModel}, ${vram} GB VRAM` : 'Missing essential GPU specifications'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeCPU(rec: EquipmentRecord, specs: CPUSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks = ['Host system socket compatibility check', 'Thermal paste and cooling solution assessment'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested CPU'], missingInfo: ['Functional test'],
      requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Test before reuse'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and test', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  if (!specs.cpuModel) missingInfo.push('CPU model');
  if (!specs.coreCount) missingInfo.push('Core count');
  if (!specs.socket || specs.socket === 'Unknown') missingInfo.push('CPU socket type');

  if (specs.cpuModel && specs.coreCount && specs.socket && specs.socket !== 'Unknown') {
    potentialApplications.push('Component upgrade');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.COMPONENT_UPGRADE,
      opportunityTitle: 'Compatible Component Upgrade',
      explanation: `${specs.cpuModel} (${specs.coreCount} cores, ${specs.socket}). Could upgrade a compatible motherboard.`,
      prerequisites: ['Socket compatibility with target motherboard', 'BIOS/firmware support'],
      requiredChecks: [...requiredChecks],
      matchStrength: 'Conditional',
    });
  }

  const hasEssentials = specs.cpuModel && specs.coreCount && specs.socket && specs.socket !== 'Unknown';
  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';

  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [hasEssentials ? `Working CPU: ${specs.cpuModel}, ${specs.coreCount} cores, ${specs.socket}` : 'Missing essential CPU specifications'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeRAM(rec: EquipmentRecord, specs: RAMSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks = ['Host system DDR generation and slot compatibility check', 'Form factor compatibility (DIMM/SO-DIMM)'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested RAM'], missingInfo: ['Functional test'],
      requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Test before reuse'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and test', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  const cap = num(specs.totalCapacityGB);
  if (!cap) missingInfo.push('Total capacity (GB)');
  if (!specs.ddrGen || specs.ddrGen === 'Unknown') missingInfo.push('DDR generation');
  if (!specs.formFactor || specs.formFactor === 'Unknown') missingInfo.push('Form factor (DIMM/SO-DIMM)');

  if (cap && specs.ddrGen && specs.ddrGen !== 'Unknown' && specs.formFactor && specs.formFactor !== 'Unknown') {
    potentialApplications.push('Component upgrade');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.COMPONENT_UPGRADE,
      opportunityTitle: 'Compatible Component Upgrade',
      explanation: `${cap} GB ${specs.ddrGen} ${specs.formFactor} RAM. Could upgrade a compatible system's memory.`,
      prerequisites: ['DDR generation compatibility with target motherboard', 'Available slots'],
      requiredChecks: [...requiredChecks],
      matchStrength: 'Conditional',
    });
  }

  const hasEssentials = cap && specs.ddrGen && specs.ddrGen !== 'Unknown' && specs.formFactor && specs.formFactor !== 'Unknown';
  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';

  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [hasEssentials ? `Working RAM: ${cap} GB ${specs.ddrGen} ${specs.formFactor}` : 'Missing essential RAM specifications'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzePrinter(rec: EquipmentRecord, specs: PrinterSpecs): Omit<AnalysisResult, 'recordId'> {
  const missingInfo: string[] = [];
  const requiredChecks = ['Driver compatibility check', 'Network configuration verification'];
  const hiddenPotential: HiddenPotentialItem[] = [];
  const potentialApplications: string[] = [];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested printer'], missingInfo: ['Print test result'],
      requiredChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: ['Component test before reuse'], potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and post-repair test', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  if (!specs.printerType || specs.printerType === 'Unknown') missingInfo.push('Printer type');
  if (!specs.connectivity || specs.connectivity === 'Unknown') missingInfo.push('Connectivity method');
  if (!specs.printTestStatus || specs.printTestStatus === 'Not tested') missingInfo.push('Print test result');
  if (specs.printTestStatus === 'Failed') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Print test failed'], missingInfo,
      requiredChecks: ['Diagnosis of print failure', ...requiredChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  const printOk = specs.printTestStatus === 'Passed';
  const dataSanReq = specs.dataSanitization === 'Pending' || !specs.dataSanitization;
  if (dataSanReq) requiredChecks.push('Clear stored print jobs and configuration data');

  if (printOk && specs.printerType && specs.connectivity) {
    potentialApplications.push('Print station');
    hiddenPotential.push({
      opportunityId: OPPORTUNITY_IDS.PRINT_STATION,
      opportunityTitle: 'Print Station',
      explanation: `Working ${specs.printerType} printer (${specs.connectivity}) with passed print test. Suitable as a shared print station.`,
      prerequisites: ['Verify consumable supplies', 'Install appropriate drivers on connected systems'],
      requiredChecks: [...requiredChecks, 'Verify consumables status'],
      matchStrength: 'Strong',
    });
  }

  const hasEssentials = printOk && specs.printerType && specs.connectivity;
  const classification: Classification = !hasEssentials ? 'Needs Assessment' : 'Reuse Candidate';

  return {
    classification,
    readiness: classification === 'Reuse Candidate' ? 'Candidate' : 'Blocked',
    reasons: [hasEssentials ? `Working ${specs.printerType} printer, print test passed` : 'Missing essential printer information'],
    missingInfo, requiredChecks, potentialApplications, hiddenPotential,
  };
}

function analyzeCustom(rec: EquipmentRecord): Omit<AnalysisResult, 'recordId'> {
  const baseChecks = ['Manual assessment required — custom device type', 'Verify device function and condition'];

  if (rec.condition === 'Untested') {
    return {
      classification: 'Needs Assessment', readiness: 'Blocked',
      reasons: ['Untested custom device'], missingInfo: ['Functional test'],
      requiredChecks: baseChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Nonfunctional') {
    return {
      classification: 'Parts Candidate', readiness: 'Blocked',
      reasons: ['Nonfunctional'], missingInfo: [],
      requiredChecks: baseChecks, potentialApplications: [], hiddenPotential: [],
    };
  }
  if (rec.condition === 'Needs repair') {
    return {
      classification: 'Refurbish Candidate', readiness: 'Conditional',
      reasons: ['Requires repair'], missingInfo: [],
      requiredChecks: ['Repair and test', ...baseChecks], potentialApplications: [], hiddenPotential: [],
    };
  }

  return {
    classification: 'Needs Assessment', readiness: 'Blocked',
    reasons: ['Custom device type — structured analysis unavailable'],
    missingInfo: ['Structured specifications needed for evaluation'],
    requiredChecks: baseChecks, potentialApplications: [], hiddenPotential: [],
  };
}

// ─── Main export ────────────────────────────────────────────────────────────
export function analyzeRecord(rec: EquipmentRecord): AnalysisResult {
  let result: Omit<AnalysisResult, 'recordId'>;

  switch (rec.deviceType) {
    case 'Desktop':
    case 'Laptop':
    case 'Server':
      result = analyzeComputer(rec, rec.specs as ComputerSpecs);
      break;
    case 'Monitor':
      result = analyzeMonitor(rec, rec.specs as MonitorSpecs);
      break;
    case 'UPS':
      result = analyzeUPS(rec, rec.specs as UPSSpecs);
      break;
    case 'Networking':
      result = analyzeNetworking(rec, rec.specs as NetworkingSpecs);
      break;
    case 'Storage':
      result = analyzeStorage(rec, rec.specs as StorageSpecs);
      break;
    case 'GPU':
      result = analyzeGPU(rec, rec.specs as GPUSpecs);
      break;
    case 'CPU':
      result = analyzeCPU(rec, rec.specs as CPUSpecs);
      break;
    case 'RAM':
      result = analyzeRAM(rec, rec.specs as RAMSpecs);
      break;
    case 'Printer':
      result = analyzePrinter(rec, rec.specs as PrinterSpecs);
      break;
    default:
      result = analyzeCustom(rec);
  }

  return { recordId: rec.id, ...result };
}

export function analyzeAll(inventory: EquipmentRecord[]): AnalysisResult[] {
  return inventory.map(analyzeRecord);
}

export function totalUnits(inventory: EquipmentRecord[]): number {
  return inventory.reduce((sum, r) => sum + r.quantity, 0);
}

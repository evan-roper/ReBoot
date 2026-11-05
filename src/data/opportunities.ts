import { OPPORTUNITY_IDS } from '../analysis/engine';

export interface OpportunityDefinition {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string; // lucide icon name
  category: string;
}

export const OPPORTUNITIES: OpportunityDefinition[] = [
  {
    id: OPPORTUNITY_IDS.PRODUCTIVITY,
    title: 'Everyday Productivity & Learning',
    shortDescription: 'General-purpose computing for office tasks, education, and web browsing.',
    description:
      'Retired desktops and laptops meeting minimum specifications can support everyday tasks: document editing, email, web browsing, video conferencing, and online learning platforms. Organizations can donate or redeploy these machines to staff, community programs, or schools.',
    icon: 'Monitor',
    category: 'Computing',
  },
  {
    id: OPPORTUNITY_IDS.DEVELOPMENT,
    title: 'Software Development Workstation',
    shortDescription: 'A capable machine for developers running IDEs, build tools, and local services.',
    description:
      'Machines with sufficient cores, memory, and storage can serve as developer workstations running integrated development environments, build systems, version control, containerized services, and local databases.',
    icon: 'Code2',
    category: 'Computing',
  },
  {
    id: OPPORTUNITY_IDS.VIRTUALIZATION,
    title: 'Virtualization / Home Lab',
    shortDescription: 'Run multiple virtual machines for testing, learning, and experimentation.',
    description:
      'Higher-spec desktops and servers with adequate CPU cores, RAM, and storage can host hypervisors like Proxmox, ESXi, or KVM. This enables virtualization training, isolated testing environments, and home lab setups for IT professionals and learners.',
    icon: 'Layers',
    category: 'Computing',
  },
  {
    id: OPPORTUNITY_IDS.LOCAL_AI,
    title: 'Local AI Experimentation',
    shortDescription: 'Run small language models locally using GPU acceleration.',
    description:
      'Systems with sufficient system RAM and a dedicated GPU with adequate VRAM may support running small open-source language models or inference frameworks locally. This is illustrative and conditional on GPU/driver compatibility, supported software frameworks, model size, power, and thermal capacity.',
    icon: 'Cpu',
    category: 'Computing',
  },
  {
    id: OPPORTUNITY_IDS.SECONDARY_DISPLAY,
    title: 'Secondary Display Setup',
    shortDescription: 'Extend a workstation with a tested monitor as a secondary screen.',
    description:
      'Working monitors with verified display quality, known resolution, and compatible connection ports can be added as secondary displays to extend productivity. Always verify adapter and cable compatibility with the source device before deployment.',
    icon: 'ScreenShare',
    category: 'Peripherals',
  },
  {
    id: OPPORTUNITY_IDS.NETWORK_LAB,
    title: 'Network Training Lab',
    shortDescription: 'Use managed networking equipment for hands-on network training.',
    description:
      'Working managed switches, routers, and access points with known specifications can be repurposed for network training labs, certification study environments, or isolated test networks. Requires secure configuration reset, firmware verification, and network isolation during initial setup.',
    icon: 'Network',
    category: 'Infrastructure',
  },
  {
    id: OPPORTUNITY_IDS.STORAGE_EXPANSION,
    title: 'Backup / Storage Expansion',
    shortDescription: 'Add verified healthy storage drives for backups or secondary storage.',
    description:
      'Drives that pass health checks can expand storage capacity in compatible systems or serve as backup media. Always verify interface compatibility and complete data sanitization before reuse. Never rely on a single drive as the sole backup copy.',
    icon: 'HardDrive',
    category: 'Storage',
  },
  {
    id: OPPORTUNITY_IDS.COMPONENT_UPGRADE,
    title: 'Compatible Component Upgrade',
    shortDescription: 'Reuse working GPUs, CPUs, or RAM in compatible host systems.',
    description:
      'Working discrete components — graphics cards, processors, and memory modules — can upgrade compatible host systems. Interface, socket, DDR generation, and form factor must all be verified against the target system before installation.',
    icon: 'CircuitBoard',
    category: 'Components',
  },
  {
    id: OPPORTUNITY_IDS.PRINT_STATION,
    title: 'Print Station',
    shortDescription: 'Deploy a verified working printer as a shared print station.',
    description:
      'Printers that pass a print quality test can be redeployed as shared print stations with appropriate drivers and network configuration. Verify consumable availability (toner/ink, paper) and clear any stored configuration data before redeployment.',
    icon: 'Printer',
    category: 'Peripherals',
  },
  {
    id: OPPORTUNITY_IDS.BACKUP_POWER,
    title: 'Backup Power Support',
    shortDescription: 'Protect critical equipment with a tested UPS during power interruptions.',
    description:
      'UPS units with known VA/watt ratings and a passed battery test can protect servers, networking equipment, or workstations during brief power interruptions. Always verify the actual load requirements of protected equipment and have battery condition assessed by a qualified service provider.',
    icon: 'Zap',
    category: 'Infrastructure',
  },
];

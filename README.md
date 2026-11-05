# ReBoot — Give Technology a Second Life

ReBoot helps organizations analyze retired IT equipment, discover realistic reuse potential, and understand what needs checking before equipment can be reused.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Production build
npm run build
npm run preview   # preview the production build locally
```

## Demo Journey

1. Open the app and click **Try Demo** on the Home page
2. Confirm to load 10 realistic equipment records
3. The analysis runs automatically — you land on **Analysis Dashboard**
4. Explore classifications, Hidden Potential cards, and per-record breakdowns
5. Navigate to **Second Life Opportunities** to browse matched uses
6. Return to **Inventory** to add, edit, or delete equipment

## Features

- **Inventory management** — Add, edit, delete equipment records with type-specific specification forms
- **12 device types** — Desktop, Laptop, Server, Monitor, UPS, Networking, Storage, GPU, CPU, RAM, Printer, Custom
- **Deterministic analysis engine** — Explainable classification with reasons, missing info, and required checks
- **4 classifications** — Reuse Candidate, Refurbish Candidate, Parts Candidate, Needs Assessment
- **10 opportunity categories** — Productivity, Development, Virtualization, Local AI, Secondary Display, Network Lab, Storage Expansion, Component Upgrade, Print Station, Backup Power
- **Hidden Potential** — Surfaces specific equipment-to-opportunity matches with prerequisites
- **Quantity awareness** — Records represent identical units; unit totals reflect quantities correctly
- **localStorage persistence** — Inventory and custom categories survive page refresh
- **Custom device categories** — Save and reuse custom category names
- **Search & filters** — Search by name, manufacturer, model, asset tag; filter by type and condition
- **Mobile-responsive** — Collapsible navigation drawer, card layout on small screens

## Classification Rules

Rules are applied in this order:

| Priority | Condition | Classification |
|---|---|---|
| 1 | Untested condition | Needs Assessment |
| 2 | Nonfunctional | Parts Candidate (component usability still requires testing) |
| 3 | Needs repair | Refurbish Candidate (post-repair possibilities shown conditionally) |
| 4 | Working + missing essential type specs or failed critical tests | Needs Assessment |
| 5 | Working + sufficient information | Reuse Candidate |

Deployment readiness (Candidate / Conditional / Blocked) is tracked separately from hardware classification. A working computer can be a Reuse Candidate while deployment is Blocked pending data sanitization.

## Illustrative Heuristics

These are **hackathon heuristics for demonstration purposes only** — not certifications or guaranteed performance assessments:

| Opportunity | Minimum requirements |
|---|---|
| Productivity/Learning | ≥2 cores, ≥4 GB RAM, ≥64 GB storage |
| Development Workstation | ≥4 cores, ≥8 GB RAM, ≥128 GB storage |
| Virtualization Lab | ≥4 cores, ≥16 GB RAM, ≥256 GB storage + firmware virtualization verification |
| Local AI Experimentation | ≥16 GB system RAM + dedicated GPU with ≥8 GB known VRAM |
| Secondary Display | Working monitor + passed display test + known resolution + known ports |
| Network Training Lab | Known subtype + port count + port speed + secure reset |
| Backup/Storage Expansion | Healthy drive with known capacity + interface + passed health check |
| Component Upgrade | Working component with identifying specs + host compatibility checks |
| Print Station | Working printer + passed print test + consumables verification |
| Backup Power | Working UPS + known VA/watt + passed battery test |

ReBoot does not fabricate resale prices, carbon savings, security certifications, or recycling compliance figures.

## localStorage Behavior

- Key: `reboot_v1`
- Stores: inventory records, custom device categories, analysis results, last analysis timestamp
- On startup: validates and restores saved records; malformed records are silently dropped
- On save failure: a visible warning banner appears — changes may not survive refresh
- Demo reset: explicit action only — never silently overwrites existing inventory

## Limitations

- All analysis uses illustrative heuristics — not certified assessments
- Custom device types receive conservative (Needs Assessment) classification; free-text notes do not influence analysis
- No backend, authentication, marketplace, or external API
- No CSV import/export in current version
- Unknown GPU VRAM blocks Local AI recommendation even if a GPU is present
- UPS battery test failure blocks operational recommendations as a safety measure

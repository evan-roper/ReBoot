---
name: reboot-design
description: Design rules for the ReBoot web app — enforces the brand palette, typography, component patterns, layout structure, and accessibility requirements when building new pages or components for ReBoot.
---

# ReBoot Design System

## Brand

- Product name: **ReBoot**
- Tagline: "Give technology a second life."
- Brand icon: circular-arrow (lucide-react `RefreshCw`)
- Brand mark in sidebar and mobile header: `RefreshCw` icon + "ReBoot" in bold

## Colour Palette

All custom colours are defined in `tailwind.config.js` and must be used via Tailwind classes:

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `forest` | `#143D2B` | `bg-forest`, `text-forest` | Sidebar background, primary nav |
| `primary` | `#247A50` | `bg-primary`, `text-primary` | Primary buttons, links, active states |
| `mint` | `#E6F3EA` | `bg-mint`, `text-mint` | Icon backgrounds, highlights, subtle accents |
| `background` | `#F6F8F6` | `bg-background` | Page background |
| `apptext` | `#18251E` | `text-apptext` | All body text, headings |

Status colours (use Tailwind utilities, always pair with a text label):

| Status | Background | Text |
|---|---|---|
| Reuse Candidate / Success | `bg-green-100` | `text-green-800` |
| Refurbish Candidate / Warning | `bg-amber-100` | `text-amber-800` |
| Parts Candidate / Info | `bg-blue-100` | `text-blue-800` |
| Needs Assessment / Neutral | `bg-gray-100` | `text-gray-700` |
| Blocked / Error | `bg-red-100` | `text-red-800` |

Never use decorative gradients, shadows heavier than `shadow-sm`/`shadow`, or emojis as primary UI elements.

## Typography

- Font: `Inter` (loaded from Google Fonts), system-font fallback via `font-sans`
- Body text: `text-sm` (14px), `text-apptext`, line-height `leading-relaxed`
- Headings:
  - Page h1: `text-2xl font-bold text-apptext`
  - Section h2: `text-xl font-semibold text-apptext` or `text-base font-semibold text-apptext`
  - Card h3: `font-semibold text-apptext`
- Muted/secondary text: `text-gray-500` or `text-gray-400`
- Labels: `text-sm font-medium text-apptext`
- Micro labels / tags: `text-xs font-medium`

## Layout

- **Desktop sidebar**: fixed, 240px (`w-60`), `bg-forest` — always visible on `lg:` and up
- **Main content**: left margin `lg:ml-60`, padding `p-4 lg:p-8`, max width `max-w-7xl`
- **Mobile header**: fixed 56px height, `bg-forest`, hamburger menu, brand mark
- **Mobile nav**: full-height drawer, `w-72`, overlay backdrop
- Page background: `bg-background`
- Do not create nested scroll areas that compete with the page scroll

## Cards & Surfaces

```
Standard card:       bg-white rounded-2xl border border-gray-100 shadow-sm p-6
Compact card:        bg-white rounded-xl border border-gray-100 shadow-sm p-4 or p-5
Highlighted card:    border-green-100 or border-amber-100 instead of border-gray-100
```

- Cards use `rounded-2xl` (large) or `rounded-xl` (medium)
- Inner sections use `rounded-lg`
- Inputs use `rounded-lg border border-gray-200`
- Buttons use `rounded-lg` or `rounded-xl`
- Never use `rounded-none` or sharp corners on card surfaces

## Buttons

```
Primary:    bg-primary text-white hover:bg-forest   px-4 py-2 or px-5 py-2.5 or px-6 py-3
Secondary:  bg-white text-gray-700 border border-gray-200 hover:bg-gray-50
Outline:    bg-white text-primary border-2 border-primary hover:bg-mint
Danger:     bg-red-600 text-white hover:bg-red-700
Ghost:      text-gray-500 hover:text-apptext (no background, no border)
Icon-only:  p-1.5 rounded-md hover:bg-gray-100
```

All buttons must have:
- `focus:outline-none focus:ring-2 focus:ring-primary` (or `focus:ring-red-400` for danger)
- `transition-colors` or `transition-shadow`
- Visible text or `aria-label`

## Badges

Use the shared `Badges.tsx` components — never inline ad-hoc status colours:

```tsx
import { ClassificationBadge, ReadinessBadge, ConditionBadge } from '../components/Badges';
```

Badge pattern: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`

## Forms & Inputs

```
Input/Select:  w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-apptext
               focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
Label:         block text-sm font-medium text-apptext mb-1
Required mark: <span className="text-red-500 ml-0.5" aria-label="required">*</span>
Hint text:     mt-1 text-xs text-gray-500
Error list:    bg-red-50 border border-red-200 rounded-lg p-3 role="alert"
```

- Every input has a visible `<label>` with matching `name`/`htmlFor`
- Group related fields with a section header: `text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Modals/dialogs: fixed inset-0, z-50, black/40 backdrop, `role="dialog" aria-modal="true"`

## Sidebar Navigation

Active page indicator:
```
Active:   bg-primary text-white
Inactive: text-green-100 hover:bg-white/10 focus:bg-white/10
```

Nav items: `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium`

Sidebar footer: `text-xs text-green-300 italic` — "Give technology a second life."

## Spacing & Sizing

- Page-level section spacing: `space-y-6` or `space-y-8`
- Card inner spacing: `p-5` or `p-6`
- Grid gaps: `gap-4` or `gap-6`
- Form field spacing: `space-y-4`
- Generous padding over tight layouts

## Empty States

Every list or data view must have an empty state:
- Centred container inside a `bg-white rounded-2xl` card
- Icon in a `w-16 h-16 bg-mint rounded-full` container
- Short `text-lg font-semibold text-apptext` heading
- Brief `text-gray-500 text-sm` explanation
- CTA button(s) using the primary button style

## Accessibility

- All interactive elements: visible focus ring (`focus:ring-2 focus:ring-primary`)
- Icon-only buttons: `aria-label`
- Tables: proper `<th>` elements
- Modals: `role="dialog" aria-modal="true" aria-label`
- Status bars: `role="alert"` or `role="status" aria-live="polite"`
- Progress bars: `role="progressbar" aria-valuenow aria-valuemin aria-valuemax aria-label`
- Colour never the sole indicator of meaning — always pair with a text label

## What NOT to do

- Do not add animations or transitions beyond `transition-colors` and `transition-shadow`
- Do not use gradients
- Do not use heavy shadows (`shadow-xl` on non-modal surfaces, `shadow-2xl` anywhere)
- Do not use emojis as structural UI elements (they may appear in content text but not as icons)
- Do not add new pages outside the four-page navigation structure without updating `Layout.tsx` and `App.tsx`
- Do not bypass the `EquipmentForm` component for equipment entry
- Do not hardcode analysis result cards — always use the analysis engine in `src/analysis/engine.ts`
- Do not store sensitive data in localStorage

## File Conventions

| What | Where |
|---|---|
| Page components | `src/pages/` |
| Shared UI components | `src/components/` |
| Types | `src/types/equipment.ts` |
| Analysis logic | `src/analysis/engine.ts` |
| Demo data | `src/data/demoData.ts` |
| Opportunity definitions | `src/data/opportunities.ts` |
| State/context | `src/context/AppContext.tsx` |
| localStorage util | `src/utils/storage.ts` |

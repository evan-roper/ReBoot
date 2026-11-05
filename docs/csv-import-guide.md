# ReBoot CSV Import/Export Guide

This document explains how to prepare and upload a CSV file to bulk-import equipment records into ReBoot.

---

## Quick Start

1. In ReBoot, go to **Inventory**
2. Click **Import CSV** and upload your file
3. Review the row-by-row validation preview
4. Click **Import** to confirm — valid rows are added, error rows are skipped

To export your current inventory as a starting-point template, click **Export CSV** from the Inventory page.

---

## File Format

- Plain text, UTF-8 encoded
- Comma-separated values (CSV), RFC 4180
- First row must be the exact column headers listed below
- One row = one equipment record
- Columns that don't apply to a device type should be left **blank** (not removed)
- All columns must be present in the header, even if unused

---

## Required Columns (every row)

| Column | Description | Allowed Values |
|---|---|---|
| `name` | Display name for the equipment | Any text |
| `device_type` | Type of device | `Desktop`, `Laptop`, `Server`, `Monitor`, `UPS`, `Networking`, `Storage`, `GPU`, `CPU`, `RAM`, `Printer`, `Custom` |
| `quantity` | Number of identical units this record represents | Positive whole number (e.g. `1`, `5`) |
| `condition` | Physical condition | `Working`, `Needs repair`, `Untested`, `Nonfunctional` |

---

## Optional Common Columns (any device type)

| Column | Description |
|---|---|
| `manufacturer` | Manufacturer name (e.g. `Dell`, `HP`) |
| `model` | Model name/number (e.g. `OptiPlex 3060`) |
| `asset_tag` | Asset tag or batch reference |
| `approximate_age_years` | Approximate age in whole years (e.g. `4`) |
| `notes` | Free-text notes |

---

## Device-Specific Columns

Leave columns blank if they don't apply to the device type in that row.

### Desktop / Laptop / Server

| Column | Description | Allowed Values |
|---|---|---|
| `cpu_model` | CPU model name | Any text (e.g. `Intel Core i5-8365U`) |
| `core_count` | Number of CPU cores | Number |
| `ram_gb` | RAM in GB | Number |
| `storage_gb` | Storage capacity in GB | Number |
| `storage_type` | Storage technology | `SSD`, `NVMe`, `HDD`, `eMMC`, `Unknown` |
| `dedicated_gpu` | Dedicated GPU present? | `Present`, `Absent`, `Unknown` |
| `gpu_model` | GPU model (only if `dedicated_gpu` = `Present`) | Any text |
| `gpu_vram_gb` | GPU VRAM in GB (only if `dedicated_gpu` = `Present`) | Number |
| `data_sanitization` | Data wipe status | `Complete`, `Pending`, `Not required`, `Unknown` |

### Monitor

| Column | Description | Allowed Values |
|---|---|---|
| `screen_size_inch` | Screen size in inches | Number (e.g. `24`) |
| `resolution` | Display resolution | Any text (e.g. `1920x1080`) |
| `connection_ports` | Available ports | Any text (e.g. `HDMI, DisplayPort`) |
| `display_test_status` | Display test result | `Passed`, `Failed`, `Not tested` |

### UPS

| Column | Description | Allowed Values |
|---|---|---|
| `va_rating` | VA rating | Number (e.g. `1500`) |
| `watt_rating` | Watt rating | Number (e.g. `1000`) |
| `battery_age_years` | Battery age in years | Number |
| `battery_test_status` | Battery self-test result | `Passed`, `Failed`, `Not tested` |

### Networking

| Column | Description | Allowed Values |
|---|---|---|
| `net_subtype` | Device subtype | `Switch`, `Router`, `Access Point`, `Firewall`, `Other`, `Unknown` |
| `port_count` | Number of ports | Number |
| `port_speed` | Port speed | `10/100`, `1GbE`, `2.5GbE`, `10GbE`, `Mixed`, `Unknown` |
| `managed` | Managed device? | `true`, `false` |
| `poe_capable` | PoE capable? | `true`, `false` |

### Storage Device

| Column | Description | Allowed Values |
|---|---|---|
| `storage_subtype` | Drive subtype | `Internal SSD`, `Internal HDD`, `NVMe`, `External`, `Unknown` |
| `storage_capacity_gb` | Capacity in GB | Number |
| `storage_interface` | Interface type | Any text (e.g. `SATA`, `NVMe`, `USB`) |
| `health_status` | Drive health test result | `Passed`, `Failed`, `Not tested` |
| `data_sanitization` | Data wipe status | `Complete`, `Pending`, `Not required`, `Unknown` |

### GPU

| Column | Description | Allowed Values |
|---|---|---|
| `gpu_vram_gb_standalone` | VRAM in GB | Number |
| `gpu_interface` | Interface type | `PCIe`, `AGP`, `Other`, `Unknown` |
| `power_requirement_w` | Power requirement in watts | Number |

> **Note:** For the GPU model name, use the `cpu_model` column (shared column for component name).

### CPU

| Column | Description | Allowed Values |
|---|---|---|
| `cpu_model` | CPU model name | Any text (e.g. `Intel Core i7-8700K`) |
| `core_count` | Number of cores | Number |
| `cpu_socket` | CPU socket type | `LGA1151`, `LGA1200`, `LGA1700`, `AM4`, `AM5`, `TR4`, `Other`, `Unknown` |

### RAM

| Column | Description | Allowed Values |
|---|---|---|
| `ram_total_capacity_gb` | Total capacity per unit/kit in GB | Number |
| `ddr_gen` | DDR generation | `DDR3`, `DDR4`, `DDR5`, `Unknown` |
| `module_count` | Number of modules | Number |
| `form_factor` | Physical form factor | `DIMM`, `SO-DIMM`, `Unknown` |

### Printer

| Column | Description | Allowed Values |
|---|---|---|
| `printer_type` | Printer technology | `Laser`, `Inkjet`, `Other`, `Unknown` |
| `printer_connectivity` | Connection method | `USB`, `Network`, `Wi-Fi`, `Bluetooth`, `Unknown` |
| `print_test_status` | Print test result | `Passed`, `Failed`, `Not tested` |
| `consumables_status` | Toner/ink status | Any text (e.g. `Toner low`) |
| `data_sanitization` | Stored data wipe status | `Complete`, `Pending`, `Not required`, `Unknown` |

### Custom Device

| Column | Description |
|---|---|
| `custom_category_name` | **Required.** Category name (e.g. `KVM Switch`) |
| `custom_description` | Brief description of the device |
| `custom_spec_notes` | Optional specification notes |

> Custom devices receive a **conservative (Needs Assessment)** classification. Free-text notes do not affect analysis results.

---

## Example Rows

```csv
name,device_type,quantity,condition,manufacturer,model,asset_tag,approximate_age_years,notes,cpu_model,core_count,ram_gb,storage_gb,storage_type,dedicated_gpu,gpu_model,gpu_vram_gb,data_sanitization,screen_size_inch,resolution,connection_ports,display_test_status,va_rating,watt_rating,battery_age_years,battery_test_status,net_subtype,port_count,port_speed,managed,poe_capable,storage_subtype,storage_capacity_gb,storage_interface,health_status,gpu_vram_gb_standalone,gpu_interface,power_requirement_w,cpu_socket,ram_total_capacity_gb,ddr_gen,module_count,form_factor,printer_type,printer_connectivity,print_test_status,consumables_status,custom_category_name,custom_description,custom_spec_notes
Dell OptiPlex 3060 Batch A,Desktop,5,Working,Dell,OptiPlex 3060,WS-001,4,,Intel Core i3-8100,4,8,256,SSD,Absent,,, Complete,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
HP UltraSharp 24",Monitor,2,Working,HP,Z24n G2,MON-010,3,,,,,,,,,,,24,1920x1200,HDMI DisplayPort,Passed,,,,,,,,,,,,,,,,,,,,,,,,,,,
Samsung 870 EVO Batch,Storage,10,Working,Samsung,870 EVO,SSD-BATCH-B,2,,,,,,,,,,,,,,,,,,,,,,,Internal SSD,500,SATA,Passed,,,,,,,,,,,,,,,,
Cisco 2960 Switch,Networking,1,Working,Cisco,2960-X,NET-005,7,Decommissioned,,,,,,,,,,,,,,,,,,Switch,48,1GbE,true,true,,,,,,,,,,,,,,,,,,,
KVM Switch,Custom,2,Working,ATEN,CS1816A,KVM-001,5,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,KVM Switch,8-port KVM switch for server room,8-port USB/HDMI
```

---

## Validation Rules

ReBoot validates every row before import. Invalid rows are **skipped** — they will not corrupt your inventory.

| Issue | Result |
|---|---|
| Missing required field (`name`, `device_type`, `quantity`, `condition`) | Row skipped with error |
| Invalid `device_type` value | Row skipped with error |
| Non-integer or zero/negative `quantity` | Row skipped with error |
| Invalid enum value (e.g. wrong `condition`) | Row skipped with error |
| Invalid number in a numeric field | Warning shown, field treated as blank |
| Blank spec fields | Accepted — analysis notes the missing information |
| Fully empty row | Silently ignored |

---

## Tips

- **One record = one set of identical units.** If you have 5 identical desktops, use `quantity = 5` on one row. Create separate rows for devices with different specs or conditions.
- **Unknown values:** Leave a field blank rather than typing "Unknown" for enum fields — the import will treat blank as unknown automatically.
- **Boolean fields** (`managed`, `poe_capable`): use `true` or `false` (case-insensitive). `yes`/`no` and `1`/`0` also work.
- **Text with commas:** Wrap the cell in double quotes (e.g. `"HDMI, DisplayPort"`). Most spreadsheet apps do this automatically when you save as CSV.
- **Spreadsheet formulas:** Do not start any text field with `=`, `+`, `-`, or `@` — these trigger formula execution in Excel and Google Sheets. ReBoot automatically prefixes such values with a tab on export to prevent this.
- **Encoding:** Save as UTF-8. Most modern spreadsheet apps default to this.

---

## Replace vs. Append

When importing, ReBoot offers two modes:

- **Append (default):** Imported records are added to your existing inventory
- **Replace:** Your existing inventory is cleared first, then the imported records are added. A confirmation dialog appears before any data is removed.

---

## Getting the Template

The fastest way to get a correctly structured CSV is to:

1. Load the demo inventory (10 sample records covering all major device types)
2. Click **Export CSV** from the Inventory page
3. Open the file in your spreadsheet app and edit the rows

This guarantees the column headers and ordering are exactly correct.

# Prospect and past-project CSV format (planned, not built)

CSV import is **not implemented yet**. This file fixes the column layout now, so spreadsheets of past
projects and prospects can be prepared ahead of time and the importer can be built against a known shape.

## File rules

- UTF-8, comma-separated, standard CSV quoting: wrap a value in double quotes if it contains a comma,
  quote or line break, and write a literal quote as `""`.
- The first row is the header, using the exact column names below in any order. Unknown columns are reported
  and ignored.
- One row per property. Blank cells mean "not known".
- Dates are `YYYY-MM-DD`. Numbers have no units; commas and `$` are allowed (`$1,200`).
- Do not put customer email addresses, phone numbers or other personal contact details in the file. There are no
  columns for them, and the importer will not look any up.

## Columns shared by both record types

These map one-to-one to the fields of the **Add Prospect** form and follow its validation rules.

| Column | Required | Allowed values / format | Form field |
| --- | --- | --- | --- |
| `record_type` | yes | `prospect` or `past_project` | n/a |
| `external_id` | no | Your own ID, up to 64 characters. Used to spot re-imports of the same row. | n/a |
| `property_name` | no | Up to 120 characters | Property name |
| `street` | yes | Street address, e.g. `120 N Elm St` (unit or suite can go here) | Street address |
| `city` | yes | Letters, spaces, `.`, `'`, `-` | City |
| `state` | yes | Two-letter code, e.g. `NC` | State |
| `zip` | yes | `27401` or `27401-1234` | ZIP code |
| `property_type` | yes | `residential`, `commercial`, `construction` | Property type |
| `window_count` | no | Whole number, 0 or more | Window count |
| `count_confidence` | when `window_count` is given | `low`, `medium`, `high`, `verified` | Count confidence |
| `source_type` | yes | `site_visit`, `client_provided`, `public_record`, `online_listing`, `drive_by`, `past_job`, `other` | Source type |
| `source_url` | one of these two | Full `https://` or `http://` link | Source link |
| `source_note` | one of these two | Up to 500 characters | Source note |
| `researched_date` | no (defaults to the import date) | `YYYY-MM-DD`, not in the future | Research date |
| `status` | no (defaults to `new`; `prospect` rows only) | `new`, `researching`, `ready_to_quote`, `quoted`, `follow_up`, `won`, `lost` | Status |
| `internal_notes` | no | Up to 2,000 characters | Internal notes |
| `latitude` | no (pair) | -90 to 90. Give both coordinates or neither. | Latitude |
| `longitude` | no (pair) | -180 to 180 | Longitude |
| `stories` | no | Whole number, 1 or more | Stories |
| `square_footage` | no | Whole number | Square footage |
| `access_notes` | no | Up to 2,000 characters | Access and job-complexity notes |
| `exterior_scope` | no | Up to 2,000 characters | Exterior scope notes |
| `interior_scope` | no | Up to 2,000 characters | Interior scope notes |
| `preliminary_price_low` | no (pair) | Dollars. Give both or neither; low ≤ high. | Preliminary price range |
| `preliminary_price_high` | no (pair) | Dollars | Preliminary price range |
| `reference_urls` | no | Up to 10 links separated by `\|` | Photo and reference links |
| `follow_up_date` | no | `YYYY-MM-DD` | Follow-up date |

## Extra columns for `past_project` rows

Leave these blank on `prospect` rows.

| Column | Required | Allowed values / format |
| --- | --- | --- |
| `completed_date` | yes | `YYYY-MM-DD` |
| `service_type` | yes | `final_cleaning`, `window_cleaning`, `pressure_washing`, `janitorial`, `other` |
| `estimator_project_type` | no | An estimator project type value, e.g. `office`, `retail`, `medical`, `restaurant`, `hotel` (see `ProjectType` in `src/lib/types.ts`) |
| `client_company` | no | Business name only, no personal contact details |
| `amount_charged` | no | Dollars actually invoiced. Kept for reference only; it never changes estimator pricing. |
| `invoice_number` | no | Up to 64 characters |

`status` is not used on `past_project` rows; they are stored as completed work.

## How the importer will behave

- **Preview first:** nothing is saved until you review a preview of every row and confirm.
- **No partial saves:** rows with errors are listed with their row number and the reason, and are not imported. You
  can fix them and import again.
- **Duplicates are flagged, never merged:** the same address check used by the form (same street after common
  abbreviations, plus the same ZIP) marks possible duplicates in the preview. Existing records are never
  overwritten.
- **Nothing is upgraded to verified:** confidence, sources and dates come from the file as written. Imported rows are
  marked as imported (`dataOrigin: "import"`), separate from both sample data and records typed in by hand.
- **No lookups:** no geocoding, web lookups or other external calls during import. Rows without coordinates are listed
  but not mapped.
- **Size:** records are kept in this browser's storage, so plan on up to about 2,000 rows per browser. Larger
  histories will need the server-side database planned for a later phase.

## Example

```csv
record_type,external_id,property_name,street,city,state,zip,property_type,window_count,count_confidence,source_type,source_url,source_note,researched_date,status,internal_notes,latitude,longitude,stories,square_footage,access_notes,exterior_scope,interior_scope,preliminary_price_low,preliminary_price_high,reference_urls,follow_up_date,completed_date,service_type,estimator_project_type,client_company,amount_charged,invoice_number
prospect,P-0001,Elm Street Lofts,120 N Elm St,Greensboro,NC,27401,commercial,84,medium,drive_by,,Counted street-facing windows,2026-10-03,researching,"Manager prefers email, ask about quarterly service",36.0726,-79.7920,4,32000,Alley access only,All street-side glass,,"$1,200","$1,800",https://example.com/photo-1|https://example.com/photo-2,2026-10-20,,,,,,
past_project,J-2024-118,,455 Market St,Winston-Salem,NC,27101,construction,212,verified,past_job,,Job folder 2024-118,2026-10-15,,Post-construction final clean for new retail shell,,,2,18500,Lift needed for clerestory windows,,Full final clean,,,,,2024-06-14,final_cleaning,retail,Example Builders LLC,"$9,450",INV-1182
```

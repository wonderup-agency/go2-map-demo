# Centers Map Components — Technical Reference

This document covers the two Google Maps components that display cancer center locations: **`centers-all.js`** (all categories) and **`centers-coe.js`** (COE-only with designations). Both run inside Webflow pages and share the same general architecture but differ in their API endpoints, data shapes, and filtering mechanisms.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Webflow Page (centers-all.html or centers-coe.html)    │
│                                                         │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Scrollable List │  │  Google Map                  │  │
│  │  (data-centers=  │  │  (data-centers="map")        │  │
│  │   "list")        │  │                              │  │
│  │                  │  │  ┌──────┐ ┌──────┐           │  │
│  │  ┌────────────┐  │  │  │ Pin  │ │ Pin  │ ...       │  │
│  │  │ List Item  │  │  │  └──────┘ └──────┘           │  │
│  │  │ (paginated │  │  │                              │  │
│  │  │  page)     │  │  │  ┌─────────────────┐         │  │
│  │  └────────────┘  │  │  │ Cluster Bubble  │         │  │
│  │  ...             │  │  └─────────────────┘         │  │
│  ├─────────────────┤  │                              │  │
│  │  Pagination     │  │  (All filtered pins shown    │  │
│  │  (data-centers= │  │   on map regardless of page) │  │
│  │   "pagination") │  │                              │  │
│  │  < [2] [3] [4] >│  │                              │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│                                                         │
│  Filters: ZIP input + Category Select (all) or          │
│           ZIP input + Designation Checkboxes (coe)       │
└─────────────────────────────────────────────────────────┘
```

Both components follow the same lifecycle:

1. Reorder layout for mobile if needed (`reorderMobileLayout`)
2. Query DOM for required elements
3. Initialize Google Maps via `@googlemaps/js-api-loader` (Vector Maps with mapId)
4. Fetch data from the GO2 worker API
5. Transform API response into internal "pin" objects
6. Initialize POSTAL_CODE feature layer (for zip boundary outlines)
7. Render pins on the map + paginated list items in the sidebar
8. Attach filter event listeners (search input, category select or designation checkboxes)
9. On filter change: reset to page 1, recompute visible pins, clear and re-render everything

---

## API Endpoints

Base URL: `https://go2-worker.nahuel-eba.workers.dev`

### `GET /centers/pins` (used by `centers-all.js`)

Returns **all categories combined** with each item normalized to a flat pin shape.

```json
{
  "total": 451,
  "lastFetchedAt": "2026-03-13T00:00:00.000Z",
  "pins": [
    {
      "name": "Example Cancer Center",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip": "62704",
      "phone": "(555) 123-4567",
      "website": "https://example.com",
      "lat": 39.7817,
      "lng": -89.6501,
      "category": "COE",
      "image_url": "https://..."
    }
  ]
}
```

**Key points:**

- Response key is `pins` (array)
- Each item has flat fields: `name`, `address`, `city`, `state`, `zip`, `phone`, `website`, `lat`, `lng`, `image_url`
- `category` is one of: `"COE"`, `"NCI"`, `"COC"`
- Some pins may have `null` lat/lng — these are skipped by `turnFacilitiesIntoPins()`
- No designations, no `fid`, no nested address object
- COC count reduced from ~1,500 to 70 (switched from FACS API to curated CSV). NCI count: 69 (was 70)

### `GET /centers` (normalized, all categories)

Returns all categories with each item normalized to a flat shape. This is the underlying endpoint that `/centers/pins` derives from.

NCI and COC entries include additional fields not present on COE entries:

```json
{
  "name": "Dana-Farber/Harvard Cancer Center",
  "address": "450 Brookline Ave",
  "city": "Boston",
  "state": "Massachussetts",
  "zip": "02215",
  "phone": "617-632-2100",
  "website": "https://www.dana-farber.org/cancer-care/treatment/thoracic-lung-cancer",
  "lat": 42.339174,
  "lng": -71.107988,
  "category": "NCI",
  "institution": "",
  "center_type": "NCI Cancer Center",
  "additional_notes": ""
}
```

**NCI/COC-specific fields** (not present on COE, not present on `/centers/pins`):

| Field | Type | Description |
| --- | --- | --- |
| `institution` | string | Parent institution name (may be empty) |
| `center_type` | string | e.g. `"NCI Cancer Center"`, `"CoC"` |
| `additional_notes` | string | Free-text notes (replaces old `notes` field on NCI) |

**Removed fields** (previously on COC via FACS API, no longer present):

- `coc_id`, `program_level`, `network_parent`

### `GET /centers?category=COE` (used by `centers-coe.js`)

Returns **raw COE centers** in the original GO2 API structure.

```json
{
  "total": 100,
  "lastFetchedAt": "2025-03-01T00:00:00.000Z",
  "centers": [
    {
      "fid": "abc123",
      "status": "active",
      "name": "Example Cancer Center",
      "address": {
        "line1": "123 Main St",
        "line2": "",
        "city": "Springfield",
        "state": "IL",
        "zip": "62704",
        "country": "US"
      },
      "latitude": 39.7817,
      "longitude": -89.6501,
      "phone": "(555) 123-4567",
      "website": "https://example.com",
      "type": "Academic Medical Center",
      "setting": "Urban",
      "image_url": "https://...",
      "designations": [
        {
          "type": "screening",
          "year": "2024",
          "overrides": {
            "address": {
              "line1": "456 Other St",
              "city": "Springfield",
              "state": "IL",
              "zip": "62705",
              "latitude": 39.79,
              "longitude": -89.65
            },
            "phone": "(555) 999-0000",
            "url": "https://screening.example.com"
          }
        },
        { "type": "cancer_care", "year": "2024" }
      ]
    }
  ]
}
```

**Key points:**

- Response key is `centers` (not `facilities`)
- Address is a nested object with `line1`, `line2`, `city`, `state`, `zip`
- Coordinates are `latitude`/`longitude` (not `lat`/`lng`)
- Has `designations` array with type, year, and optional `overrides`
- Has `fid`, `image_url`, `type`, `setting` fields

### `GET /centers/designations` (used by `centers-coe.js` only)

Returns the list of available designation types for checkbox generation.

```json
{
  "types": [{ "type": "screening" }, { "type": "cancer_care" }, { "type": "ipn" }, { "type": "biomarker" }]
}
```

### `GET /centers?category=NCI` (raw)

Returns raw NCI centers from curated CSV data (69 centers). URLs point to lung-cancer-specific pages.

```json
{
  "total": 69,
  "centers": [
    {
      "Center Name": "Dana-Farber/Harvard Cancer Center",
      "Institution": "",
      "Street Address": "450 Brookline Ave",
      "City": "Boston",
      "State": "Massachussetts",
      "Zip Code": "02215",
      "Center Type": "NCI Cancer Center",
      "Website URL": "https://...",
      "Phone Number": "617-632-2100",
      "Latitude": 42.339174,
      "Longitude": -71.107988,
      "Additional Notes": ""
    }
  ]
}
```

**Note:** The `Notes` field was renamed to `Additional Notes`.

### `GET /centers?category=COC` (raw)

Returns raw COC centers from curated CSV data (70 hand-picked centers with lung-cancer-specific URLs). Replaces the old FACS API source (~1,500+ results).

```json
{
  "total": 70,
  "source": "csv",
  "centers": [
    {
      "Center Name": "Hartford HealthCare Cancer Institute at Hartford Hospital",
      "Institution": "",
      "Street Address": "80 Seymour Street",
      "City": "Hartford",
      "State": "Connecticut",
      "Zip Code": "06102",
      "Center Type": "CoC",
      "Website URL": "https://...",
      "Phone Number": "860-545-5000",
      "Latitude": 41.7628,
      "Longitude": -72.6734,
      "Additional Notes": "Multiple locations all over CT"
    }
  ]
}
```

**Removed fields** (previously from FACS API): `id` (`coc_id`), `program_level`, `network_parent`, `webSite`, `addressLine1`, `locationPoint`, `childInstitutions`.

### `GET /centers?category=COC&source=api` (rollback)

Fetches live from the FACS API, bypassing the CSV data. Returns the old FACS API format (~1,500+ results). Use for comparison or rollback.

### `GET /centers/schema`

Returns the full schema reference for all endpoints (useful for debugging).

---

## Component: `centers-all.js`

### Purpose

Displays **all center categories** (COE, NCI, COC) on a single map with a category dropdown filter. The list is paginated to reduce DOM load.

### HTML Requirements

The component root element must have `data-component="centers-all"`. Required child elements:

| Selector | Type | Purpose |
| --- | --- | --- |
| `[data-centers="list"]` | Container | Scrollable list of center cards (paginated) |
| `[data-centers="map"]` | Div | Google Map render target |
| `[data-centers="pagination"]` | Container | Pagination controls (prev/next arrows + page buttons) |
| `[data-custom="centers-zip-field"]` | Input | Search field (zip, city, or address) |
| `[data-centers="categories-select"]` | Select | Category dropdown (All / GO2 / NCI / COC) |
| `[data-centers="search-message"]` | Element | Contextual message shown during zip search |
| `[data-centers="list-item"]` | Button/Div | Template element (cloned, then removed from DOM) |

List item template inner elements:

| Selector | Purpose |
| --- | --- |
| `[data-center="icon"]` | Pin icon image (set to category-specific pin) |
| `[data-center="image"]` | Center photo (from `image_url`; removed if missing) |
| `[data-custom="center-name"]` | Center name text |
| `[data-custom="center-type"]` | Category label (e.g. "GO2 Center of Excellence") |
| `[data-custom="center-address"]` | Street address |
| `[data-custom="center-city-state"]` | City, State text |
| `[data-centers="phone"]` | Phone link (`<a href="tel:...">`) |
| `[data-center="website"]` | Website link |
| `[data-centers="directions"]` | Google Maps directions link |

### Data Flow

```
GET /centers/pins
    │
    ▼
data.pins[]         ──→  turnFacilitiesIntoPins()  ──→  allPins[]
                              │                            │
                              │  Flat mapping:             │
                              │  lat/lng parsed            │
                              │  category preserved        │
                              │  invalid coords skipped    │
                              │                            ▼
                              │                      applyAllFilters()
                              │                        (resets page to 1)
                              │                            │
                              │              ┌─────────────┼──────────────────┐
                              │              ▼             ▼                  ▼
                              │       Category filter  ZIP / density     renderCenters()
                              │       (CATEGORY_MAP    search               │
                              │        lookup)         (see below)     ┌────┴────┐
                              │                                        ▼         ▼
                              │                                  ALL pins   renderListPage()
                              │                                  on map     (current page only)
                              │                                                  │
                              │                                                  ▼
                              │                                        Pagination controls
                              │                                        in [data-centers=
                              │                                         "pagination"]
                              ▼
                         Pin object shape:
                         { name, lat, lng, address, city, state,
                           zip, phone, website, imageUrl, category }
```

**Important:** The category filter runs _before_ the zip/density search so that the density-adaptive logic only considers facilities of the selected category.

### Category Select Mapping

The `<select>` dropdown option values map to API category strings:

| Select Option Value | API Category | Pin Icon |
| --- | --- | --- |
| `"all"` | (no filter) | Per-category |
| `"GO2 designated"` | `"COE"` | COE_PIN (52x52, green star) |
| `"NCI designated"` | `"NCI"` | NCI_PIN (32x32, purple) |
| `"COC"` | `"COC"` | COC_PIN (32x32, blue) |

This mapping is defined in `CATEGORY_MAP`. If the select value isn't in the map, all pins are shown.

### Category Labels

Displayed in the `[data-custom="center-type"]` element:

| Category | Label |
| --- | --- |
| `COE` | GO2 Center of Excellence |
| `NCI` | NCI Cancer Center |
| `COC` | COC Accredited |

Defined in `CATEGORY_LABELS`. Falls back to the raw category string.

---

## Component: `centers-coe.js`

### Purpose

Displays **COE centers only** with designation-level detail and filtering. Supports a "screening-only" mode. The list is paginated to reduce DOM load.

### HTML Requirements

Same base elements as `centers-all.js`, plus:

| Selector | Type | Purpose |
| --- | --- | --- |
| `[data-centers="pagination"]` | Container | Pagination controls (prev/next arrows + page buttons) |
| `.map_filters-right-category-nav` | Nav/Container | Holds dynamically generated designation checkboxes |
| `[data-centers="search-message"]` | Element | Contextual message shown during zip search |
| `data-show-only-screening` attribute | On component root | Set to `"true"` to lock to screening-only mode |

### Data Flow

```
GET /centers?category=COE          GET /centers/designations
         │                                    │
         ▼                                    ▼
data.centers[]                        designationsData.types[]
         │                                    │
         ▼                                    ▼
turnFacilitiesIntoPins()              Populate checkboxes
         │                            (or remove if screening-only)
         │
         ▼
   allPins[]  ──→  (screening filter if mode is on)  ──→  applyAllFilters()
                                                           (resets page to 1)
                                                               │
                                                    ┌──────────┼──────────┐
                                                    ▼          ▼          ▼
                                              Designation  ZIP / density  renderCenters()
                                              checkbox     search            │
                                              filter       (see below)  ┌────┴────┐
                                                                        ▼         ▼
                                                                  ALL pins   renderListPage()
                                                                  on map     (current page only)
                                                                                  │
                                                                                  ▼
                                                                        Pagination controls
                                                                        in [data-centers=
                                                                         "pagination"]
```

**Important:** The designation filter runs _before_ the zip/density search so that the density-adaptive logic only considers facilities of the selected designation types.

### The `turnFacilitiesIntoPins()` Function (COE-specific)

This is the most complex part. It handles the COE data's designation override system:

1. **Skip facilities with no designations** — a facility must have at least one designation to appear on the map.

2. **Collect designation types** — aggregates all unique `designation.type` values (e.g. `["screening", "cancer_care"]`) for filter matching.

3. **Handle override addresses** — each designation can optionally have an `overrides.address` with its own coordinates. This means a single facility can produce **multiple pins at different locations** (e.g. the main hospital + a separate screening clinic).

4. **Deduplicate by coordinates** — uses a `"lat,lng"` key to avoid placing two pins at the exact same spot for the same facility.

5. **Output pin shape:**
   ```
   {
     fid, name, lat, lng, address, streetAddress,
     phone, website, imageUrl, zip, city, state,
     designationTypes: ["screening", "cancer_care", ...]
   }
   ```

### Designation Checkboxes

Generated dynamically from the `/centers/designations` endpoint:

- Each type gets a checkbox with `name="designations"` and `value="<type>"`
- All checkboxes start **checked**
- When **no checkboxes are checked**, the list shows **no results** (empty state)
- Labels are resolved via `DESIGNATION_LABELS` map with a fallback that capitalizes and replaces underscores

Current known types: `screening`, `cancer_care`, `ipn`, `biomarker`

### Screening-Only Mode

Activated by setting `data-show-only-screening="true"` on the component root element.

When active:

- The designation checkbox filter is **removed from the DOM**
- The `.map_references` legend section is **removed**
- After pin creation, only pins with `"screening"` in their `designationTypes` are kept
- The designation filter step in `applyAllFilters()` is skipped

---

## Shared Patterns

### Google Maps Setup

Both components use the same approach:

- `@googlemaps/js-api-loader` for async loading (v: `"weekly"`)
- **Vector Maps** rendering via `mapId: '883ace1c7764e279269aed54'` (created in Google Cloud Console)
- `google.maps.marker.AdvancedMarkerElement` for all pins (including cluster bubbles and the search location marker)
- `google.maps.marker.PinElement` for colored pin styling (COE, NCI, COC each have distinct colors)
- Collision behavior: COE pins use `REQUIRED_AND_HIDES_OPTIONAL`, others use `OPTIONAL_AND_HIDES_LOWER_PRIORITY` — COE pins always stay visible
- `@googlemaps/markerclusterer` with `SuperClusterAlgorithm` for clustering (`minPoints: 3` to prevent 2-pin clusters)
- Single shared `InfoWindow` instance (only one popup open at a time), opened via `infoWindow.open({ map, anchor })`
- **POSTAL_CODE feature layer** for zip boundary outlines on search (when available)
- Map type control (Map/Satellite/Terrain toggle) is **disabled** via `mapTypeControl: false` — the map is always in standard roadmap mode
- Street View (Pegman drag-and-drop) is **disabled** via `streetViewControl: false`

### Pin Icons

**Map markers** use `PinElement` with colored backgrounds (via `createAdvancedPin()`):

| Category | Background | Border | Scale | Used For |
| --- | --- | --- | --- | --- |
| `COE` | `#BBCB32` | `#FFFFFF` | 1.5 | COE / GO2 centers |
| `NCI` | `#835A91` | `#FFFFFF` | 1.0 | NCI centers |
| `COC` | `#235189` | `#FFFFFF` | 1.0 | COC centers |

All pins use white glyphs. COE pins are larger (scale 1.5) for visual priority.

**List item icons** still use legacy image-based pin configs (`COE_PIN`, `NCI_PIN`, `COC_PIN`) with `createGoogleMapsIcon()` to set `<img>` src attributes in the sidebar and info windows.

### Cluster Bubbles

`createClusterSvg()` generates an SVG string — a white circle with blue (`#2c3495`) border and count text. The bubble size scales with digit count (36px for 1 digit, 40px for 2, 48px for 3+). The cluster renderer wraps this SVG in a `<div>` and returns an `AdvancedMarkerElement`. Clustering requires `minPoints: 3`, so pairs of 2 pins at the same address remain as individual markers.

### InfoWindow

- Default Google Maps styling is overridden via injected `<style>` to remove background, shadow, arrow, and close button
- Hover behavior: moving the mouse over the InfoWindow keeps it open; moving out starts a 300ms close timer
- Content is built by cloning the same list item template used for the sidebar

### Mobile Layout Reorder

Both components call `reorderMobileLayout(component)` before any rendering. This function:

- On **≤991px**: moves `.map_filters` to be the first child of the component (so zip search + map appear above results)
- On **>991px**: restores `.map_filters` as the first child of `.map_right` (original Webflow placement)
- Runs on load and on `resize`

### Webflow Form Handling

Both components strip Webflow's form handling attributes (`data-wf-page-id`, `data-wf-element-id`, `data-name`, `action`) and prevent form submission to avoid page reloads. The `.w-form-done` and `.w-form-fail` messages are removed.

### List Item Template

The `[data-centers="list-item"]` element is cloned once at init and then removed from the DOM **before the initial render** to avoid conflicts with rendered items. All subsequent list items and InfoWindow popups are created by cloning this template.

### Pagination

Both components paginate the sidebar list to reduce DOM load (configurable via `ITEMS_PER_PAGE`, default `3`):

- **List only** — only the list is paginated; all filtered pins remain on the map regardless of the current page.
- **Pagination controls** are rendered inside a dedicated `[data-centers="pagination"]` element in the HTML, separate from the list container.
- **Controls layout:** `< [prev] [current] [next] >` — a prev arrow, up to 3 page number buttons (current page ± 1 sibling), and a next arrow. Ellipsis (`...`) is shown when pages are skipped near the edges.
- **Filter reset:** When any filter changes (zip, category, or designation checkboxes), `currentPage` resets to `1`.
- **Page navigation** scrolls the list container back to the top (`centersList.scrollTop = 0`).

#### Pagination state variables

| Variable | Purpose |
| --- | --- |
| `currentPage` | The 1-based current page number |
| `currentFilteredPins` | The full filtered pin array (used by `renderListPage()` for slicing) |

#### Key functions

| Function | Purpose |
| --- | --- |
| `renderCenters(pins)` | Stores filtered pins, clears/rebuilds map markers, calls `renderListPage()` |
| `renderListPage()` | Clears and re-renders only the current page's list items + pagination controls |
| `buildPaginationControls(container, totalPages)` | Populates the pagination container with prev/next arrows and page number buttons |
| `getPageNumbers(current, total, maxButtons)` | Returns array of page numbers and `'...'` ellipses for the button row |

### Filter Execution

Both components use an `applyAllFilters()` function that:

1. Resets `currentPage` to `1`
2. Starts with all pins
3. Applies the **type-specific filter first** (category select or designation checkboxes) — this ensures the density-adaptive search only considers facilities of the selected type
4. Applies the **zip/density search** (see below)
5. Calls `renderCenters()` with the filtered result

`renderCenters()` rebuilds all map markers from the full filtered set, then calls `renderListPage()` which only renders the current page slice of list items.

### Geocode-Based Search

When a user types **3 or more characters** (zip code, city name, address, etc.), the component performs a **geocode-based distance search** using the Google Maps Geocoder client-side (`geocodeInput()`):

1. The input is **geocoded** via `google.maps.Geocoder` to get lat/lng, city/state, and placeId
2. **Haversine distances** are calculated from the search location to every (already type-filtered) facility
3. Facilities are sorted by distance
4. **Nearby facilities** within `NEARBY_RADIUS_MILES` (default 50) are collected
5. If there are nearby facilities, **all of them** are shown. If there are none, only the **single closest** facility is shown
6. The map uses `fitBounds()` with padding to fit the search location + all selected facilities, capped at `MAX_SEARCH_ZOOM` (13) to prevent over-zoom
7. If a `placeId` is returned and the POSTAL_CODE feature layer is available, a **zip boundary outline** is drawn (`#2c3495` stroke, 5% fill opacity)

For **1-2 characters**, no filtering is applied (input too short). For **empty input**, the search is reset.

Input is debounced at **500ms** to avoid excessive geocode calls while typing.

#### Search Location Marker

When a search is geocoded, a **blue circle marker** (20px `#4285F4` HTML div with white border, rendered as an `AdvancedMarkerElement`) is placed at the search location with `zIndex: 9999` so it always renders on top of facility pins.

#### Search Message

Both components look for a `[data-centers="search-message"]` element. When a search is active:

- **Nearby results:** `"5 centers near San Francisco, CA"`
- **No nearby results (fallback to closest):** `"Nearest center: 847 miles from Bismarck, ND"`
- **No search active:** The message element is hidden

#### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEARBY_RADIUS_MILES` | `50` | Radius (miles) for "nearby" threshold |
| `MAX_SEARCH_ZOOM` | `13` | Maximum zoom level after `fitBounds()` |

#### State Variables

| Variable | Purpose |
| --- | --- |
| `searchLocation` | `{ lat, lng, city, state }` from geocode, or `null` |
| `searchLocationMarker` | AdvancedMarkerElement for the blue circle, or `null` |
| `searchNearbyCount` | Number of facilities within the radius (0 = fallback mode) |
| `debounceTimer` | Timer ID for debouncing geocode calls (500ms) |
| `postalCodeLayer` | POSTAL_CODE feature layer for zip boundary outlines, or `null` |

### Initial Render vs Filter Render

Both components use an `isInitialRender` flag to control map viewport behavior:

- **Initial render**: The map uses the fixed `STARTING_LAT`/`STARTING_LNG` center and `STARTING_ZOOM` level (defaults to lat 37.5, lng -95.7, zoom 4 — showing the continental US). This prevents `fitBounds()` from zooming out too far to include outlier locations like Hawaii.
- **Search render**: The map uses `fitBounds()` with padding to fit the search location + all selected facilities, capped at `MAX_SEARCH_ZOOM` (13).
- **Non-search filter render**: The map uses `fitBounds()` to auto-zoom to fit all visible pins, or centers on a single pin at `CLICK_ZOOM` level.

---

## Configuration Reference

All configurable values are defined as `var` constants at the top of each file:

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | See above | Fetch endpoint |
| `DESIGNATIONS_URL` | `.../centers/designations` | COE only — designation types endpoint |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyDz...` | Google Maps JS API key |
| `STARTING_LAT` | `37.5` | Initial map center latitude |
| `STARTING_LNG` | `-95.7` | Initial map center longitude |
| `STARTING_ZOOM` | `4` | Initial zoom level |
| `CLICK_ZOOM` | `14` | Zoom level when clicking a center |
| `CLUSTER_RADIUS` | `60` | Pixel radius for marker clustering |
| `ITEMS_PER_PAGE` | `3` | Number of list items shown per page |
| `NEARBY_RADIUS_MILES` | `50` | Radius (miles) for geocode-based search |
| `MAX_SEARCH_ZOOM` | `13` | Maximum zoom after fitBounds on search |

---

## Common Modifications

### Adding a new category

1. In the worker API, add the new category to the `/centers/pins` response
2. In `centers-all.js`:
   - Add the pin config (e.g. `var NEW_PIN = { imageUrl: ..., size: ..., anchor: ... }`)
   - Add to `CATEGORY_MAP`: `'Select Label': 'API_CATEGORY'`
   - Add to `CATEGORY_LABELS`: `'API_CATEGORY': 'Human Label'`
   - Add to `getIconForCategory()`: `if (category === 'NEW') return newIcon`
3. In the HTML, add a new `<option>` to the `[data-centers="categories-select"]` select

### Adding a new designation type (COE)

1. Add the entry to `DESIGNATION_LABELS` in `centers-coe.js` if you want a custom label
2. No other changes needed — the checkboxes are generated dynamically from the API

### Changing pin colors

Update the `background` and `borderColor` values in `createAdvancedPin()`. The list item icons still use image-based configs (`COE_PIN`, `NCI_PIN`, `COC_PIN`) — update `imageUrl` there if the sidebar icons need changing too.

### Adding new fields to list items

1. Add a new element with a `data-*` attribute to the list item template in the HTML
2. In the `renderListPage()` and `buildInfoWindowElement()` functions, query for the new element and populate it from the pin object
3. If the field comes from the API, make sure it's included in the pin object created by `turnFacilitiesIntoPins()`

### Changing items per page

Update `ITEMS_PER_PAGE` at the top of the file. Both components use the same variable name.

---

## Debugging

Both components log extensively with `[ALL]` or `[COE]` prefixes. Key log points:

- DOM elements found (boolean check, includes `paginationContainer`, `searchMessage`)
- Google Maps load success/failure
- Facility count after fetch
- Pin count after transformation
- Filter application (category/designation matches, zip matches)
- Geocode request and response
- Distance search results (nearby count, fallback to closest)
- Search message text shown/hidden
- Final render count

Open the browser console and filter by `[ALL]` or `[COE]` to trace the full lifecycle.

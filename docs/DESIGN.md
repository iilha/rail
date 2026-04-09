# Taiwan Rail (TRA) Design Document

## Architecture Overview

Taiwan Rail (TRA) is a Progressive Web App (PWA) that displays train schedules and station information for Taiwan's conventional railway system. The app uses a fully static data approach with no live API integration. All 200+ stations across 13 railway lines are embedded as JSON within the HTML file, along with pre-compiled train schedules.

The app features tabbed navigation (Train Schedule / Stations), interactive Leaflet map, line/class filters, and bilingual support. It can be served via HTTP, loaded in native WebView wrappers, or installed as a PWA with full offline functionality from first load.

## Data Flow

### Data Sources
- **Embedded Static JSON**: All data hardcoded in `<script>` tags within `index.html`
  - 200+ stations across 13 lines (Western, Mountain, Coast, Eastern, etc.)
  - Pre-compiled train schedules (weekday/weekend patterns)
  - Train classes: Express, Limited Express, Local, Fast Local
  - Station info: name (Chinese/English), line code, coordinates, class (A/B/C/D)

### Data Structure
```javascript
const STATIONS = [
  {
    line: 'WL',          // Western Line (North)
    code: '1000',
    name: '基隆',
    nameEn: 'Keelung',
    lat: 25.1324,
    lng: 121.7395,
    class: 'A'           // Major station
  },
  // ... 199 more stations
];

const SCHEDULES = {
  'WL': [
    {
      trainNo: '1001',
      type: 'express',
      stops: ['1000', '1001', '1003', ...], // Station codes
      times: ['06:00', '06:15', '06:30', ...]
    },
    // ... more trains
  ]
};
```

### Render Cycle
1. Page load: Parse embedded `STATIONS` and `SCHEDULES` arrays
2. **Train Schedule Tab**: User selects line → render schedule table with departure times
3. **Stations Tab**: Apply line/class filters → render station list + map markers
4. No network requests required (instant rendering, fully offline)

## UI Components

### Navigation Header
- Language toggle button (EN/中文)
- Active state highlighting

### Tab Navigation
- **Train Schedule**: Browse train timetables by line
- **Stations**: Explore all stations with map and filters

### Train Schedule Tab
- **Line Selector**: Dropdown for 13 lines (WL, ML, CL, SL, YL, NL, TL, SLL, PX, NW, JJ, SH, LJ)
- **Direction Tabs**: Northbound / Southbound toggle
- **Schedule Table**: Shows train number, type, departure time, arrival time, duration
- **Train Type Filter**: Checkboxes for Express, Limited Express, Local, Fast Local
- Click train row to show full route with all stops

### Stations Tab
- **Line Filter**: Dropdown to filter by railway line (or All)
- **Class Filter**: Dropdown to filter by station class (A/B/C/D or All)
- **Search Box**: Text input for station name filtering (fuzzy match)
- **Station List**: Scrollable list with line badge, name, class, distance
- **Map View**: Leaflet map with color-coded markers by line
- **Locate Button**: Bottom-right floating button (📍) to center map on user GPS

### Map Visualization
- Leaflet 1.9.4 map with OpenStreetMap tiles
- Line-colored markers: Blue (Western), Green (Eastern), Red (Mountain/Coast), etc.
- Route polylines connecting stations by line
- Popup shows station name (bilingual), line, class, distance, navigation links

### Mobile Layout (≤768px)
- Bottom sheet with drag handle
- Snap points: collapsed (56px), half (50vh), full (90vh)
- Summary line: "🚂 Western Line • 42 stations"

## Caching Strategy

### Service Worker (`sw.js`)
| Resource Type | Strategy | TTL |
|---------------|----------|-----|
| Static assets (HTML, CSS, JS) | Cache-first | 24 hours |
| Map tiles (OSM) | Cache-first | 7 days |
| Station/schedule data | N/A (embedded) | Permanent |

### Cache Benefits
- **Zero API dependency**: No external data fetching, works offline immediately
- **Instant performance**: No network latency, data already in memory
- **No rate limits**: No API to throttle or fail
- **Version controlled**: Schedule updates via Git commit (rare updates)

### Update Strategy
- Schedule changes require HTML file update (pushed via GitHub)
- Service worker detects new version, prompts user to reload
- Update frequency: bi-annual (schedule changes with seasonal timetables)

## Localization

### Language Toggle
- Default: `navigator.language` (zh-TW/zh-CN → Chinese, else English)
- Persistence: `localStorage.setItem('rail-lang', lang)`
- Text elements: `data-en` and `data-zh` attributes
- Station names: dual fields `name` (Chinese) and `nameEn` (English)
- Train types: translated labels (Express → 自強號)

### Bilingual Rendering
```javascript
function renderStationName(station, lang) {
  return lang === 'zh' ? station.name : station.nameEn;
}
```

## Native Wrappers

### Android WebView
- Loads `file:///android_asset/index.html` from APK
- WebView settings: JavaScript enabled, geolocation permission, DOM storage
- No internet permission required (fully offline)
- JavaScript bridge: `Android.shareSchedule(trainNo)` for native share sheet

### iOS WKWebView
- Loads local HTML via `WKWebView.loadFileURL()` from app bundle
- Configuration: `allowsBackForwardNavigationGestures`, `allowsInlineMediaPlayback`
- Swift bridge: `window.webkit.messageHandlers.shareSchedule.postMessage(trainNo)`
- Core Location for GPS, Siri shortcuts for "next train to {station}"

### Asset Sync
- CI/CD: GitHub Actions copies `index.html` to native repos on merge
- Git submodule: `ios/Rail/Resources/` and `android/app/src/main/assets/`
- Build script validates station JSON and schedule data structure

## State Management

### localStorage Keys
| Key | Purpose | Values |
|-----|---------|--------|
| `rail-lang` | Language preference | `'en'` \| `'zh'` |
| `rail-line` | Selected railway line | Line code (e.g., `'WL'`, `'ML'`) or `'All'` |
| `rail-class` | Station class filter | `'A'` \| `'B'` \| `'C'` \| `'D'` \| `'All'` |
| `rail-tab` | Active tab | `'schedule'` \| `'stations'` |

### In-Memory State
- `STATIONS`: Immutable hardcoded array (loaded once on page load)
- `SCHEDULES`: Immutable hardcoded schedule object
- `filteredStations`: Subset after line/class/search filters applied
- `filteredTrains`: Trains for selected line/direction
- `userLocation`: GPS coordinates `{lat, lng}` from Geolocation API
- `markers`: Leaflet marker objects keyed by station code

### State Persistence
- Line, class, tab: persisted to localStorage on change
- User location: ephemeral, re-fetched each session
- Station/schedule data: immutable, no persistence needed
- Search query: not persisted (ephemeral UI state)

### Static Data Tradeoff
- TRA schedules change infrequently (seasonal updates, 2x per year)
- Static approach eliminates API complexity, downtime, CORS issues
- Tradeoff: Must redeploy app for schedule updates (acceptable for slow-changing data)
- Live train tracking not supported (would require real-time API)

## Future Plan

### Short-term
- Add real-time train position tracking via TDX API
- Show platform information per station
- Implement delay alerts and notifications
- Add express/local train indicators on map

### Medium-term
- Multi-train journey planner with transfers
- Scenic route recommendations
- Integration with bus/taxi for last-mile
- Offline schedules with sync

### Long-term
- Live train position map overlay
- Crowdsourcing delay reports
- Photography spot recommendations along scenic lines

## TODO

- [ ] Integrate TDX live train position API
- [ ] Add real-time delay information
- [ ] Implement journey planner with transfers
- [ ] Add station facility info
- [ ] Show train composition (car count)
- [ ] Add fare calculator for multi-segment trips
- [ ] Implement dark mode

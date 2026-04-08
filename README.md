English | [繁體中文](README_zh.md)

# Taiwan Rail (TRA)

Taiwan Rail (TRA) train schedules and station information for 200+ stations across Taiwan.

**Live URL:** https://oouyang.github.io/rail/ (GitHub Pages)

## Features

### Train Schedule Tab
- Origin and destination station selectors
- Departure time listings with fare and duration
- Train type indicators (Express, Limited Express, Local, Fast Local)
- Direction toggle (Northbound/Southbound)
- Real-time display with next train countdown

### Stations Tab
- Interactive Leaflet map with all 200+ TRA stations
- Line filters: 13 lines including Western (WL/ML/CL/SL), Yilan (YL), North-Link (NL), Taitung (TL), South-Link (SLL), and branch lines (PX/NW/JJ/SH/LJ)
- Station class filters (all classes supported)
- Station markers with popups showing station info
- Locate button to center map on user location

### General Features
- Bilingual support (English/Chinese) with language toggle
- Embedded schedule data (no external API required)
- Responsive design optimized for mobile and desktop
- PWA support with offline caching
- Native app packaging for Android and iOS

## Tech Stack

- **Frontend:** HTML5, CSS3 (inline styles), JavaScript ES6+
- **Maps:** Leaflet 1.9.4, OpenStreetMap tiles
- **Libraries:** common.js (shared utilities), bottom-sheet.js (mobile UI)
- **PWA:** Service worker (sw.js), manifest.webapp
- **Build:** No build system required (static HTML)

## Quick Start

### Development Server

```bash
python3 -m http.server 8005
```

Open http://localhost:8005 in your browser.

Alternative servers:
```bash
# Node.js
npx serve . -p 8005

# PHP
php -S localhost:8005
```

### Testing

```bash
npm install
npm test              # Run Playwright tests
npm run test:headed   # Run with browser visible
```

## File Structure

```
rail/
├── index.html              # Main page with schedule/stations tabs
├── js/
│   ├── common.js           # Shared utilities (distance, language, CITIES)
│   └── bottom-sheet.js     # Mobile bottom sheet component
├── android/                # Android WebView wrapper
│   ├── app/
│   │   └── build.gradle    # Package: tw.pwa.rail
│   └── sync-web.sh         # Sync web assets to Android
├── ios/                    # iOS WebView wrapper
│   ├── Rail/
│   └── sync-web.sh         # Sync web assets to iOS
├── tests/                  # Playwright test suite
├── img/                    # App icons (32-512px)
├── manifest.webapp         # PWA manifest
├── sw.js                   # Service worker
└── package.json            # Test dependencies
```

## Taiwan Rail Lines

| Code | Name | Description |
|------|------|-------------|
| WL | Western Line (North) | Keelung to Zhunan |
| ML | Mountain Line | Zhunan to Changhua (inland) |
| CL | Coast Line | Zhunan to Changhua (coastal) |
| SL | Western Line (South) | Changhua to Kaohsiung |
| YL | Yilan Line | Badu to Su'aoxin |
| NL | North-Link Line | Su'aoxin to Hualien |
| TL | Taitung Line | Hualien to Taitung |
| SLL | South-Link Line | Fangliao to Taitung |
| PX | Pingxi Line | Branch line |
| NW | Neiwan Line | Branch line |
| JJ | Jiji Line | Branch line |
| SH | Shalun Line | Branch line |
| LJ | Liujia Line | Branch line |

## Native Builds

### Android (tw.pwa.rail)

```bash
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/rail-1.0.0-1.apk
```

Requirements: Android SDK 35, JDK 17, minSdk 24

### iOS

Open `ios/Rail/Rail.xcodeproj` in Xcode and build for device/simulator.

## PWA Features

- **Offline Support:** Static assets cached via service worker
- **Install Prompt:** Add to home screen on mobile
- **Theme Color:** #3F51B5 (Indigo)
- **Icons:** 32px to 512px (maskable support)

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See repository license file.

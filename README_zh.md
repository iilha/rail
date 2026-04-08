[English](README.md) | 繁體中文

# 台灣鐵路 (TRA)

台灣鐵路（TRA）列車時刻表及全台 200 多個車站資訊。

**線上網址：** https://oouyang.github.io/rail/ (GitHub Pages)

## 功能特色

### 列車時刻表分頁
- 起訖站選擇器
- 發車時間列表，包含票價和行車時間
- 列車種類標示（自強、莒光、區間、區間快）
- 方向切換（北上/南下）
- 即時顯示與下班車倒數

### 車站分頁
- 互動式 Leaflet 地圖，顯示所有 200 多個台鐵車站
- 路線篩選：13 條路線包括西部幹線（WL/ML/CL/SL）、宜蘭線（YL）、北迴線（NL）、台東線（TL）、南迴線（SLL）及支線（PX/NW/JJ/SH/LJ）
- 車站等級篩選（支援所有等級）
- 車站標記與彈出視窗顯示車站資訊
- 定位按鈕可將地圖中心移至使用者位置

### 一般功能
- 雙語支援（英文/中文）與語言切換
- 內嵌時刻表資料（無需外部 API）
- 針對手機與桌面優化的響應式設計
- PWA 支援與離線快取
- Android 與 iOS 原生 App 封裝

## 技術架構

- **前端：** HTML5、CSS3（inline styles）、JavaScript ES6+
- **地圖：** Leaflet 1.9.4、OpenStreetMap 圖磚
- **函式庫：** common.js（共用工具）、bottom-sheet.js（手機版 UI）
- **PWA：** Service worker (sw.js)、manifest.webapp
- **建置：** 無需建置系統（靜態 HTML）

## 快速開始

### 開發伺服器

```bash
python3 -m http.server 8005
```

在瀏覽器開啟 http://localhost:8005

其他伺服器選項：
```bash
# Node.js
npx serve . -p 8005

# PHP
php -S localhost:8005
```

### 測試

```bash
npm install
npm test              # 執行 Playwright 測試
npm run test:headed   # 以可見瀏覽器執行
```

## 檔案結構

```
rail/
├── index.html              # 主頁面，包含時刻表/車站分頁
├── js/
│   ├── common.js           # 共用工具（距離、語言、城市）
│   └── bottom-sheet.js     # 手機版底部面板元件
├── android/                # Android WebView 封裝
│   ├── app/
│   │   └── build.gradle    # 套件：tw.pwa.rail
│   └── sync-web.sh         # 同步網頁資源至 Android
├── ios/                    # iOS WebView 封裝
│   ├── Rail/
│   └── sync-web.sh         # 同步網頁資源至 iOS
├── tests/                  # Playwright 測試套件
├── img/                    # App 圖示（32-512px）
├── manifest.webapp         # PWA manifest
├── sw.js                   # Service worker
└── package.json            # 測試相依套件
```

## 台灣鐵路路線

| Code | Name | Description |
|------|------|-------------|
| WL | Western Line (North) | 基隆至竹南 |
| ML | Mountain Line | 竹南至彰化（山線） |
| CL | Coast Line | 竹南至彰化（海線） |
| SL | Western Line (South) | 彰化至高雄 |
| YL | Yilan Line | 八堵至蘇澳新 |
| NL | North-Link Line | 蘇澳新至花蓮 |
| TL | Taitung Line | 花蓮至台東 |
| SLL | South-Link Line | 枋寮至台東 |
| PX | Pingxi Line | 支線 |
| NW | Neiwan Line | 支線 |
| JJ | Jiji Line | 支線 |
| SH | Shalun Line | 支線 |
| LJ | Liujia Line | 支線 |

## 原生建置

### Android (tw.pwa.rail)

```bash
cd android
./gradlew assembleRelease
# 輸出：app/build/outputs/apk/release/rail-1.0.0-1.apk
```

需求：Android SDK 35、JDK 17、minSdk 24

### iOS

在 Xcode 開啟 `ios/Rail/Rail.xcodeproj` 並建置至裝置/模擬器。

## PWA 功能

- **離線支援：** 透過 service worker 快取靜態資源
- **安裝提示：** 手機上可加入主畫面
- **主題色：** #3F51B5（Indigo）
- **圖示：** 32px 至 512px（支援 maskable）

## 瀏覽器支援

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- 行動瀏覽器（iOS Safari、Chrome Mobile）

## 授權

請參閱儲存庫授權檔案。

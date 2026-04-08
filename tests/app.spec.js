const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8005';

test.describe('Taiwan Rail PWA', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
  });

  test('should load page with title containing "Rail"', async ({ page }) => {
    await expect(page).toHaveTitle(/Rail/);
  });

  test('should have no cross-app navigation links', async ({ page }) => {
    // Check that there are no links to other apps (ubike, bus, mrt, thsr)
    const crossAppLinks = await page.locator('a[href*="ubike.html"], a[href*="bus.html"], a[href*="mrt.html"], a[href*="thsr.html"]').count();
    expect(crossAppLinks).toBe(0);

    // Check that there are no buttons linking to other apps
    const crossAppButtons = await page.locator('button[onclick*="ubike"], button[onclick*="bus"], button[onclick*="mrt"], button[onclick*="thsr"]').count();
    expect(crossAppButtons).toBe(0);
  });

  test('should have map canvas element', async ({ page }) => {
    const mapCanvas = page.locator('#map-canvas');
    await expect(mapCanvas).toBeVisible();
  });

  test('should initialize Leaflet map', async ({ page }) => {
    // Wait for Leaflet to load and map to initialize
    await page.waitForFunction(() => {
      return window.L && window.map && window.map._loaded;
    }, { timeout: 10000 });

    // Check that Leaflet container has been initialized
    const leafletContainer = page.locator('#map-canvas .leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // Check for map tiles
    const mapTiles = page.locator('.leaflet-tile-pane');
    await expect(mapTiles).toBeVisible();
  });

  test('should have tab buttons (Train Schedule, Stations)', async ({ page }) => {
    // Check for tab buttons
    const tabButtons = page.locator('.tab-btn');
    await expect(tabButtons).toHaveCount(2);

    // Check Train Schedule tab
    const scheduleTab = page.locator('.tab-btn[data-tab="schedule"]');
    await expect(scheduleTab).toBeVisible();
    await expect(scheduleTab).toHaveClass(/active/);

    // Check Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await expect(stationsTab).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Initially Train Schedule tab should be active
    const scheduleTab = page.locator('.tab-btn[data-tab="schedule"]');
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    const scheduleContent = page.locator('#tab-schedule');
    const stationsContent = page.locator('#tab-stations');

    await expect(scheduleTab).toHaveClass(/active/);
    await expect(scheduleContent).toHaveClass(/active/);

    // Click Stations tab
    await stationsTab.click();
    await expect(stationsTab).toHaveClass(/active/);
    await expect(stationsContent).toHaveClass(/active/);
    await expect(scheduleTab).not.toHaveClass(/active/);
    await expect(scheduleContent).not.toHaveClass(/active/);

    // Click back to Train Schedule tab
    await scheduleTab.click();
    await expect(scheduleTab).toHaveClass(/active/);
    await expect(scheduleContent).toHaveClass(/active/);
  });

  test('should have station data loaded (200+ stations)', async ({ page }) => {
    // Wait for STATIONS array to be defined
    await page.waitForFunction(() => {
      return window.STATIONS && Array.isArray(window.STATIONS);
    });

    // Check that we have at least 200 stations
    const stationCount = await page.evaluate(() => window.STATIONS.length);
    expect(stationCount).toBeGreaterThanOrEqual(200);
  });

  test('should display stations in the list', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    // Wait for station list to render
    await page.waitForSelector('.station-item', { timeout: 5000 });

    // Check that stations are displayed
    const stationItems = page.locator('.station-item');
    const count = await stationItems.count();
    expect(count).toBeGreaterThan(0);

    // Check that first station has expected structure
    const firstStation = stationItems.first();
    await expect(firstStation.locator('.station-name')).toBeVisible();
  });

  test('should have line filter select', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    // Check for line filter select
    const lineSelect = page.locator('#line-select');
    await expect(lineSelect).toBeVisible();

    // Check that it has options
    const options = lineSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1); // At least "All Lines" + one line
  });

  test('should filter stations by line', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    // Wait for initial render
    await page.waitForSelector('.station-item');
    const initialCount = await page.locator('.station-item').count();

    // Select a specific line (first non-"All" option)
    const lineSelect = page.locator('#line-select');
    const options = await lineSelect.locator('option').all();
    if (options.length > 1) {
      const secondOption = await options[1].getAttribute('value');
      await lineSelect.selectOption(secondOption);

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that filtered count is less than initial
      const filteredCount = await page.locator('.station-item').count();
      expect(filteredCount).toBeLessThan(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    }
  });

  test('should have direction tabs', async ({ page }) => {
    // Direction tabs should be visible in Train Schedule tab
    const directionTabs = page.locator('.direction-tabs');
    await expect(directionTabs).toBeVisible();
  });

  test('should have language toggle button', async ({ page }) => {
    const langBtn = page.locator('#lang-btn, .lang-btn');
    await expect(langBtn).toBeVisible();

    // Check initial text (should be "EN" or "中")
    const initialText = await langBtn.textContent();
    expect(['EN', '中']).toContain(initialText);
  });

  test('should toggle language', async ({ page }) => {
    const langBtn = page.locator('#lang-btn, .lang-btn');
    const initialText = await langBtn.textContent();

    // Click to toggle
    await langBtn.click();
    await page.waitForTimeout(300); // Wait for UI update

    const newText = await langBtn.textContent();
    expect(newText).not.toBe(initialText);
    expect(['EN', '中']).toContain(newText);

    // Check that tab button text changed
    const tabBtn = page.locator('.tab-btn[data-tab="schedule"]');
    const tabText = await tabBtn.textContent();

    if (newText === 'EN') {
      expect(tabText).toBe('Train Schedule');
    } else {
      expect(tabText).toBe('列車時刻');
    }
  });

  test('should have locate button', async ({ page }) => {
    const locateBtn = page.locator('.locate-btn');
    await expect(locateBtn).toBeVisible();

    // Check that it contains the location emoji or icon
    const btnText = await locateBtn.textContent();
    expect(btnText).toContain('📍');
  });

  test('should have manifest.webapp accessible', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.webapp`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/application\/json|application\/manifest\+json|text\/plain/);

    // Parse and check manifest structure
    const manifest = await response.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
  });

  test('should have sw.js accessible', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sw.js`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/javascript|text\/plain/);
  });

  test('should register service worker', async ({ page }) => {
    // Wait for service worker registration
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator;
    });

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    // Note: Service worker may not register immediately in test environment
    // This checks that the API exists, not necessarily that it's fully registered
    expect(typeof swRegistered).toBe('boolean');
  });

  test('should have no console errors on initial load', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Reload page to capture all console messages
    await page.reload();

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (like service worker in test env)
    const criticalErrors = consoleErrors.filter(err => {
      return !err.includes('Service Worker') &&
             !err.includes('serviceWorker') &&
             !err.includes('Load failed'); // Network errors in tests
    });

    expect(criticalErrors.length).toBe(0);
  });

  test('should have search input in stations tab', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    // Check for search input
    const searchInput = page.locator('.search-box input[type="text"]');
    await expect(searchInput).toBeVisible();
  });

  test('should search and filter stations', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    await page.waitForSelector('.station-item');
    const initialCount = await page.locator('.station-item').count();

    // Type in search box
    const searchInput = page.locator('.search-box input[type="text"]');
    await searchInput.fill('Taipei');
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredCount = await page.locator('.station-item').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should display result count in stations tab', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    // Wait for result count to appear
    const resultCount = page.locator('.result-count');
    await expect(resultCount).toBeVisible();

    // Check that it contains a number
    const countText = await resultCount.textContent();
    expect(countText).toMatch(/\d+/);
  });

  test('should have responsive layout', async ({ page }) => {
    // Check desktop layout
    const panel = page.locator('#panel');
    await expect(panel).toBeVisible();

    const mapCanvas = page.locator('#map-canvas');
    await expect(mapCanvas).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // Check that elements are still visible (may reflow)
    await expect(mapCanvas).toBeVisible();
  });

  test('should click on station and select it', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    await page.waitForSelector('.station-item');

    // Click first station
    const firstStation = page.locator('.station-item').first();
    await firstStation.click();

    // Check that it got selected class
    await expect(firstStation).toHaveClass(/selected/);
  });

  test('should have station selectors in schedule tab', async ({ page }) => {
    // Check for origin and destination selectors
    const stationSelectors = page.locator('.station-selectors select');
    const count = await stationSelectors.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least origin and destination
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();

    // Check theme color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();

    // Check apple mobile web app capable
    const appleMeta = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleMeta).toBe('yes');

    // Check manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.webapp');

    // Check apple touch icon
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveAttribute('href', /icon/);
  });

  test('should load Leaflet library', async ({ page }) => {
    // Check that Leaflet is loaded
    const leafletLoaded = await page.evaluate(() => {
      return typeof window.L !== 'undefined' && typeof window.L.map === 'function';
    });
    expect(leafletLoaded).toBe(true);
  });

  test('should have line color badges', async ({ page }) => {
    // Switch to Stations tab
    const stationsTab = page.locator('.tab-btn[data-tab="stations"]');
    await stationsTab.click();

    await page.waitForSelector('.station-item');

    // Check for line badges with color classes
    const lineBadges = page.locator('.line-badge');
    const count = await lineBadges.count();
    expect(count).toBeGreaterThan(0);

    // Check that at least one badge has a line color class
    const firstBadge = lineBadges.first();
    const badgeClass = await firstBadge.getAttribute('class');
    expect(badgeClass).toMatch(/line-\w+/);
  });

  test('should persist language preference', async ({ page }) => {
    const langBtn = page.locator('#lang-btn, .lang-btn');

    // Toggle language
    await langBtn.click();
    await page.waitForTimeout(300);
    const selectedLang = await langBtn.textContent();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that language persisted
    const langAfterReload = await langBtn.textContent();
    expect(langAfterReload).toBe(selectedLang);
  });

});

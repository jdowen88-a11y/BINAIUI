const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

const routes = [
  { hash: 'home', name: 'Home' },
  { hash: 'archive', name: 'Archive' },
  { hash: 'projects', name: 'Projects' },
  { hash: 'about', name: 'About' }
];
const artworks = ['Helix', 'Prism', 'Seed', 'Intersection', 'Lattice', 'Current'];

async function clickVisible(locator) {
  for (let i = 0; i < await locator.count(); i++) {
    if (await locator.nth(i).isVisible()) {
      await locator.nth(i).click();
      return;
    }
  }
  throw new Error('No visible matching control: ' + locator);
}

async function goToRoute(page, name) {
  await clickVisible(page.getByRole('link', { name, exact: true }));
}

async function checkArt(dialog) {
  const art = dialog.locator('img, svg, canvas').filter({ visible: true }).first();
  await expect(art).toBeVisible();
  await expect.poll(() => art.evaluate(element => {
    if (element instanceof HTMLImageElement) return element.complete && element.naturalWidth > 0;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  })).toBe(true);
}

for (const prefix of ['/', '/BINAIUI/']) {
  test.describe('Website at ' + prefix, () => {
    test('public routes navigate and survive refresh without JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(prefix);
      for (const route of routes) {
        await goToRoute(page, route.name);
        await expect(page).toHaveURL(new RegExp('#' + route.hash + '$'));
        const main = page.locator('#main');
        await expect(main).toBeVisible();
        await expect(main.getByRole('heading').first()).toBeVisible();
        const renderedText = await main.innerText();
        expect(renderedText.trim().length).toBeGreaterThan(20);
        await page.reload();
        await expect(page).toHaveURL(new RegExp('#' + route.hash + '$'));
        await expect(main).toContainText(renderedText.trim().slice(0, 25));
      }
      expect(errors).toEqual([]);
    });

    test('320px and 390px layouts fit the screen', async ({ page }, testInfo) => {
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(prefix);
        for (const route of routes) {
          await goToRoute(page, route.name);
          await expect(page.locator('#main')).toBeVisible();
          const dimensions = await page.evaluate(() => ({
            screen: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth
          }));
          expect(dimensions.document).toBeLessThanOrEqual(dimensions.screen + 1);
          expect(dimensions.body).toBeLessThanOrEqual(dimensions.screen + 1);
          if (route.hash === 'home') {
            const filename = testInfo.outputPath('home-' + width + '.png');
            await page.screenshot({ path: filename, fullPage: true });
            await testInfo.attach('Homepage ' + width + 'px', {
              path: filename, contentType: 'image/png'
            });
          }
        }
      }
    });

    test('archive search, categories and native image viewer work', async ({ page }) => {
      await page.goto(prefix + '#archive');
      const main = page.locator('#main');
      const openButtons = main.getByRole('button', { name: /^Open / });
      await expect(openButtons).toHaveCount(6);
      const search = page.getByRole('textbox', { name: 'Search archive', exact: true });
      await search.fill('helix');
      await expect(openButtons).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Open Helix', exact: true })).toBeVisible();
      await search.fill('not-an-existing-artwork');
      await expect(openButtons).toHaveCount(0);
      await search.fill('');
      for (const [category, title] of [['Geometry', 'Prism'], ['Organic', 'Seed'], ['Systems', 'Lattice']]) {
        await main.getByRole('button', { name: category, exact: true }).click();
        await expect(main.getByRole('button', { name: 'Open ' + title, exact: true })).toBeVisible();
        expect(await openButtons.count()).toBeLessThan(6);
      }
      await main.getByRole('button', { name: 'All', exact: true }).click();
      await expect(openButtons).toHaveCount(6);
      const trigger = main.getByRole('button', { name: 'Open Helix', exact: true });
      await trigger.click();
      const viewer = page.locator('#viewer');
      await expect(viewer).toBeVisible();
      await checkArt(viewer);
      await viewer.getByRole('button', { name: 'Close image', exact: true }).click();
      await expect(viewer).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(viewer).not.toBeVisible();
    });

    test('research filters and expandable project details work', async ({ page }) => {
      await page.goto(prefix + '#projects');
      const main = page.locator('#main');
      await expect(main.locator('details').filter({ visible: true }).first()).toBeVisible();
      const allCount = await main.locator('details').filter({ visible: true }).count();
      expect(allCount).toBeGreaterThanOrEqual(3);
      for (const category of ['Prototype', 'Concept']) {
        await main.getByRole('button', { name: category, exact: true }).click();
        const items = main.locator('details').filter({ visible: true });
        expect(await items.count()).toBeGreaterThan(0);
        expect(await items.count()).toBeLessThan(allCount);
        const item = items.first();
        await item.locator('summary').click();
        await expect(item).toHaveAttribute('open', '');
        expect((await item.innerText()).length).toBeGreaterThan((await item.locator('summary').innerText()).length);
        await item.locator('summary').click();
        await expect(item).not.toHaveAttribute('open', '');
      }
      await main.getByRole('button', { name: 'All', exact: true }).click();
      await expect(main.locator('details').filter({ visible: true })).toHaveCount(allCount);
    });

    test('manifest, iPhone metadata and real PNG icons use the deployment prefix', async ({ page, request }) => {
      await page.goto(prefix);
      const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(manifestHref).toBeTruthy();
      expect(manifestHref).not.toMatch(/^(\/|https?:)/);
      const manifestURL = new URL(manifestHref, page.url());
      const response = await request.get(manifestURL.href);
      expect(response.ok()).toBe(true);
      const manifest = await response.json();
      expect(manifest.name).toBe('BINAIUI');
      expect(manifest.display).toBe('standalone');
      for (const key of ['start_url', 'scope']) {
        expect(manifest[key]).toBeTruthy();
        expect(manifest[key]).not.toMatch(/^(\/|https?:)/);
        expect(new URL(manifest[key], manifestURL).pathname).toBe(prefix);
      }
      for (const size of [192, 512]) {
        const icon = manifest.icons.find(item => item.sizes.split(/\s+/).includes(size + 'x' + size));
        expect(icon).toBeTruthy();
        expect(icon.src).not.toMatch(/^(\/|https?:)/);
        const iconURL = new URL(icon.src, manifestURL);
        expect(iconURL.pathname.startsWith(prefix)).toBe(true);
        const iconResponse = await request.get(iconURL.href);
        expect(iconResponse.ok()).toBe(true);
        const bytes = await iconResponse.body();
        expect(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
        expect(bytes.readUInt32BE(16)).toBe(size);
        expect(bytes.readUInt32BE(20)).toBe(size);
      }
      const touchHref = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
      expect(touchHref).not.toMatch(/^(\/|https?:)/);
      const touchResponse = await request.get(new URL(touchHref, page.url()).href);
      expect(touchResponse.ok()).toBe(true);
      const touchBytes = await touchResponse.body();
      expect(touchBytes.readUInt32BE(16)).toBeGreaterThanOrEqual(180);
      expect(touchBytes.readUInt32BE(16)).toBe(touchBytes.readUInt32BE(20));
      await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
    });

    test('service worker reloads the public shell and all archive art offline', async ({ page, context }) => {
      await page.goto(prefix);
      await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.getRegistration()), null, { timeout: 15000 });
      const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
      expect(new URL(scope).pathname).toBe(prefix);
      await page.reload();
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await context.setOffline(true);
      try {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('#main')).toBeVisible();
        for (const route of routes) {
          await goToRoute(page, route.name);
          await expect(page.locator('#main').getByRole('heading').first()).toBeVisible();
        }
        await goToRoute(page, 'Archive');
        for (const title of artworks) {
          await page.getByRole('button', { name: 'Open ' + title, exact: true }).click();
          const viewer = page.locator('#viewer');
          await expect(viewer).toBeVisible();
          await checkArt(viewer);
          await viewer.getByRole('button', { name: 'Close image', exact: true }).click();
        }
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('button', { name: 'Open Helix', exact: true })).toBeVisible();
      } finally {
        await context.setOffline(false);
      }
    });

    test('studio drafts persist locally, preview, export and restore without changing published content', async ({ page, request }, testInfo) => {
      const publishedBefore = await (await request.get(prefix + 'content.json')).text();
      await page.goto(prefix + '#studio');
      const introduction = page.getByLabel('Introduction', { exact: true });
      await expect(introduction).toBeVisible();
      const publishedIntroduction = await introduction.inputValue();
      const draftIntroduction = 'A local mobile draft for BINAIUI browser verification.';
      await introduction.fill(draftIntroduction);
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      await page.reload();
      await expect(introduction).toHaveValue(draftIntroduction);
      await goToRoute(page, 'Home');
      await expect(page.locator('#main')).not.toContainText(draftIntroduction);
      await page.goto(prefix + '#studio');
      await page.getByRole('button', { name: 'Preview draft', exact: true }).click();
      await expect(page.getByText('Local draft preview', { exact: true })).toBeVisible();
      await goToRoute(page, 'Home');
      await expect(page.locator('#main')).toContainText(draftIntroduction);
      await page.evaluate(() => { location.hash = 'studio'; });
      await expect(introduction).toBeVisible();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download = await downloadPromise;
      const filename = testInfo.outputPath('draft-content.json');
      await download.saveAs(filename);
      const exported = await fs.readFile(filename, 'utf8');
      expect(() => JSON.parse(exported)).not.toThrow();
      expect(exported).toContain(draftIntroduction);
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Restore published', exact: true }).click();
      await expect(introduction).toHaveValue(publishedIntroduction);
      await goToRoute(page, 'Home');
      await expect(page.locator('#main')).not.toContainText(draftIntroduction);
      const publishedAfter = await (await request.get(prefix + 'content.json')).text();
      expect(publishedAfter).toBe(publishedBefore);
    });
  });
}

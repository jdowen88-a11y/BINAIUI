const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const { execFileSync } = require('node:child_process');

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
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
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
      const search = page.getByLabel('Search archive', { exact: true });
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
        const decoded = await page.evaluate(src => new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => resolve(null);
          image.src = src;
        }), iconURL.href);
        expect(decoded).toEqual({ width: size, height: size });
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

    test('website ZIP is complete, has valid checksums and contains the current saved draft', async ({ page }, testInfo) => {
      await page.goto(prefix + '#studio');
      const draftIntroduction = 'The saved iPhone draft must travel inside the full website ZIP.';
      await page.getByLabel('Introduction', { exact: true }).fill(draftIntroduction);
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download website ZIP', exact: true }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('BINAIUI.zip');
      const filename = testInfo.outputPath('BINAIUI.zip');
      await download.saveAs(filename);
      const python = [
        'import sys, zipfile, json, struct, zlib, binascii, math',
        'with zipfile.ZipFile(sys.argv[1]) as archive:',
        '    assert archive.testzip() is None, "ZIP CRC failure"',
        '    names = archive.namelist()',
        '    assert len(names) == len(set(names)), "Duplicate archive filenames"',
        '    assert all("/" not in name and "\\\\" not in name for name in names), "Website ZIP must be flat"',
        '    required = {"index.html", "styles.css", "app.js", "content.json", "manifest.webmanifest", "sw.js", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "helix.svg", "prism.svg", "seed.svg", "intersection.svg", "lattice.svg", "current.svg", "README.md", "PUBLICATION-CHECKLIST.md", "TEST-REPORT.md", ".nojekyll"}',
        '    assert required <= set(names), "Missing static site files: " + str(required - set(names))',
        '    assert archive.read(".nojekyll") == b"", ".nojekyll must be included"',
        '    content = json.loads(archive.read("content.json"))',
        '    assert content["site"]["introduction"] == sys.argv[2], "ZIP contains stale content"',
        '    for item in content["archive"]:',
        '        if item["image"].startswith("./"): assert item["image"][2:] in names, "Missing artwork"',
        '    decoded = {}',
        '    for name, expected in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:',
        '        image = archive.read(name)',
        '        assert image[:8] == b"\\x89PNG\\r\\n\\x1a\\n", "PNG signature failure"',
        '        cursor = 8',
        '        compressed = bytearray()',
        '        width = height = depth = color = interlace = None',
        '        ended = False',
        '        while cursor < len(image):',
        '            length = struct.unpack(">I", image[cursor:cursor+4])[0]',
        '            kind = image[cursor+4:cursor+8]',
        '            data = image[cursor+8:cursor+8+length]',
        '            crc = struct.unpack(">I", image[cursor+8+length:cursor+12+length])[0]',
        '            assert binascii.crc32(kind + data) & 0xffffffff == crc, "PNG chunk CRC failure"',
        '            if kind == b"IHDR":',
        '                width, height, depth, color, compression, filtering, interlace = struct.unpack(">IIBBBBB", data)',
        '                assert width == height == expected, "Incorrect icon dimensions"',
        '                assert compression == filtering == interlace == 0, "Unexpected PNG encoding"',
        '            if kind == b"IDAT": compressed.extend(data)',
        '            if kind == b"IEND": ended = True',
        '            cursor += length + 12',
        '        assert ended and cursor == len(image), "Incomplete PNG"',
        '        channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]',
        '        row = math.ceil(width * depth * channels / 8)',
        '        pixels = zlib.decompress(compressed)',
        '        assert len(pixels) == height * (row + 1), "PNG pixels cannot be decoded"',
        '        assert all(pixels[y * (row + 1)] in range(5) for y in range(height)), "Invalid PNG row filter"',
        '        decoded[name] = [width, height]',
        '    print(json.dumps({"flat_files": len(names), "zip_crc": "valid", "saved_draft": "current", "decoded_icons": decoded}))'
      ].join('\n');
      const verification = execFileSync('python', ['-c', python, filename, draftIntroduction], { encoding: 'utf8' });
      await testInfo.attach('Website ZIP verification', { body: verification, contentType: 'text/plain' });
    });

    test('content import accepts a valid backup and preserves the draft when invalid backups are rejected', async ({ page, request }) => {
      const published = await (await request.get(prefix + 'content.json')).json();
      const valid = JSON.parse(JSON.stringify(published));
      valid.site.introduction = 'A restored mobile backup with literal <img src=x onerror="window.__binaiuiImportExecuted=true"> text.';
      await page.goto(prefix + '#studio');
      const input = page.getByLabel('Import content', { exact: true });
      await input.setInputFiles({ name: 'content.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(valid)) });
      await expect(page.locator('#toast')).toContainText('Content imported as a local draft.');
      await expect(page.getByLabel('Introduction', { exact: true })).toHaveValue(valid.site.introduction);
      const badVersion = JSON.parse(JSON.stringify(valid)); badVersion.version = 99;
      const badLink = JSON.parse(JSON.stringify(valid)); badLink.site.contactUrl = 'javascript:alert(1)';
      const duplicateID = JSON.parse(JSON.stringify(valid)); duplicateID.archive[1].id = duplicateID.archive[0].id;
      const missingArt = JSON.parse(JSON.stringify(valid)); missingArt.archive[0].image = './missing.svg';
      for (const invalid of ['{this is not JSON', JSON.stringify(badVersion), JSON.stringify(badLink), JSON.stringify(duplicateID), JSON.stringify(missingArt)]) {
        await input.setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(invalid) });
        await expect(input).toHaveValue('');
        await expect(page.locator('#toast')).toContainText('Import failed:');
        await expect(page.getByLabel('Introduction', { exact: true })).toHaveValue(valid.site.introduction);
      }
      await page.reload();
      await expect(page.getByLabel('Introduction', { exact: true })).toHaveValue(valid.site.introduction);
      await goToRoute(page, 'Home');
      await expect(page.locator('#main')).not.toContainText(valid.site.introduction);
      await page.evaluate(() => { location.hash = 'studio'; });
      await page.getByRole('button', { name: 'Preview draft', exact: true }).click();
      await expect(page.locator('#main')).toContainText(valid.site.introduction);
      expect(await page.evaluate(() => window.__binaiuiImportExecuted)).toBeUndefined();
      await expect(page.locator('#main img[src="x"]')).toHaveCount(0);
    });

    test('a real PNG upload is resized, exported with alt text and displayed in draft preview', async ({ page, request }, testInfo) => {
      const icon = await (await request.get(prefix + 'icon-192.png')).body();
      await page.goto(prefix + '#studio');
      const entry = page.locator('.editor-entry').first();
      await entry.locator('summary').click();
      const description = 'A violet and emerald BINAIUI PNG uploaded during mobile browser verification.';
      await entry.getByLabel('Image description (alt text)', { exact: true }).fill(description);
      await entry.getByLabel('Choose image from Photos or Files', { exact: true }).setInputFiles({
        name: 'binaiui-test.png', mimeType: 'image/png', buffer: icon
      });
      await expect(entry.locator('input[name="a0-image"]')).toHaveValue(/^data:image\/jpeg;base64,/);
      await expect.poll(() => entry.locator('.editor-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download = await downloadPromise;
      const filename = testInfo.outputPath('photo-content.json');
      await download.saveAs(filename);
      const exported = JSON.parse(await fs.readFile(filename, 'utf8'));
      expect(exported.archive[0].alt).toBe(description);
      expect(exported.archive[0].image).toMatch(/^data:image\/jpeg;base64,/);
      expect(exported.archive[0].sample).toBe(false);
      await page.getByRole('button', { name: 'Preview draft', exact: true }).click();
      await goToRoute(page, 'Archive');
      await page.getByRole('button', { name: 'Open Helix', exact: true }).click();
      await expect(page.locator('#viewer-image')).toHaveAttribute('alt', description);
      await checkArt(page.locator('#viewer'));
    });

    test('contact editing rejects executable URLs and saves valid https links', async ({ page }, testInfo) => {
      await page.goto(prefix + '#studio');
      const introduction = page.getByLabel('Introduction', { exact: true });
      await expect(introduction).toBeVisible();
      const original = await introduction.inputValue();
      await introduction.fill('This edit must remain unsaved when the contact link is invalid.');
      await page.getByLabel('Contact link', { exact: true }).fill('javascript:alert(1)');
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      await expect(page.locator('#form-error')).toContainText('https://');
      await page.reload();
      await expect(introduction).toHaveValue(original);
      await page.getByLabel('Contact link', { exact: true }).fill('https://github.com/jdowen88-a11y/BINAIUI');
      await page.getByLabel('Contact email', { exact: true }).fill('studio@example.com');
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download = await downloadPromise;
      const filename = testInfo.outputPath('contact-content.json');
      await download.saveAs(filename);
      const exported = JSON.parse(await fs.readFile(filename, 'utf8'));
      expect(exported.site.contactUrl).toBe('https://github.com/jdowen88-a11y/BINAIUI');
      expect(exported.site.email).toBe('studio@example.com');
      await page.getByRole('button', { name: 'Preview draft', exact: true }).click();
      await goToRoute(page, 'About');
      await expect(page.getByRole('link', { name: /^Contact link/ })).toHaveAttribute('href', exported.site.contactUrl);
      await expect(page.getByRole('link', { name: /Email BINAIUI/ })).toHaveAttribute('href', 'mailto:studio%40example.com');
    });

    test('storage failure preserves valid edits for Files export and a session preview', async ({ page }, testInfo) => {
      await page.addInitScript(() => {
        Storage.prototype.setItem = function () {
          throw new DOMException('Browser verification simulates full device storage.', 'QuotaExceededError');
        };
      });
      await page.goto(prefix + '#studio');
      const marker = 'This valid iPhone draft stays recoverable when browser storage is full.';
      await page.getByLabel('Introduction', { exact: true }).fill(marker);
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      await expect(page.locator('#form-error')).toContainText('could not save your draft');
      await expect(page.locator('#form-error')).toContainText('Export content to Files');
      await expect(page.getByLabel('Introduction', { exact: true })).toHaveValue(marker);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download = await downloadPromise;
      const filename = testInfo.outputPath('storage-recovery-content.json');
      await download.saveAs(filename);
      expect(JSON.parse(await fs.readFile(filename, 'utf8')).site.introduction).toBe(marker);
      await page.getByRole('button', { name: 'Preview draft', exact: true }).click();
      await expect(page.getByText('Local draft preview', { exact: true })).toBeVisible();
      await expect(page.locator('#main')).toContainText(marker);
      await page.reload();
      await expect(page.locator('#main').getByRole('heading').first()).toBeVisible();
      await expect(page.locator('#main')).not.toContainText(marker);
      await expect(page.getByText('Local draft preview', { exact: true })).not.toBeVisible();
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

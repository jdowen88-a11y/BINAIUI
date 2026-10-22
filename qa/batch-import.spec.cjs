const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const { execFileSync } = require('node:child_process');

for (const prefix of ['/', '/BINAIUI/']) {
  test.describe('Batch artworks at ' + prefix, () => {
    test('multiple images get distinct metadata, survive reload, and export', async ({ page, request }, testInfo) => {
      const png = await (await request.get(prefix + 'icon-192.png')).body();
      await page.goto(prefix + '#studio');
      const input = page.getByLabel('Add multiple artworks from Photos or Files', { exact: true });
      await expect(input).toHaveAttribute('multiple', '');
      await input.setInputFiles([
        { name: 'opal_glow.png', mimeType: 'image/png', buffer: png },
        { name: 'opal_glow.png', mimeType: 'image/png', buffer: png },
        { name: 'sapphire_bloom.png', mimeType: 'image/png', buffer: png }
      ]);
      await expect(page.locator('#batch-results')).toContainText('Imported 3 of 3');
      const titles = await Promise.all([6,7,8].map(i => page.locator('input[name="a'+i+'-title"]').inputValue()));
      expect(titles).toEqual(['opal glow', 'opal glow (2)', 'sapphire bloom']);
      const first = page.locator('.editor-entry').nth(6);
      if (!(await first.evaluate(element => element.open))) await first.locator('summary').click();
      await first.getByLabel('Image description (alt text)', { exact: true }).fill('A new violet opal artwork.');
      await first.getByLabel('Caption', { exact: true }).fill('Opal light in a self-generating field.');
      const downloadEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download = await downloadEvent;
      const path = testInfo.outputPath('batch-content.json');
      await download.saveAs(path);
      const exported = JSON.parse(await fs.readFile(path, 'utf8'));
      expect(exported.archive).toHaveLength(9);
      expect(new Set([...exported.archive,...exported.projects].map(item => item.id)).size).toBe(exported.archive.length+exported.projects.length);
      expect(exported.archive.slice(6).every(item => item.image.startsWith('data:image/jpeg;base64,'))).toBe(true);
      expect(exported.archive[6].alt).toBe('A new violet opal artwork.');
      expect(exported.archive[6].caption).toBe('Opal light in a self-generating field.');
      await page.reload();
      await expect(page.locator('input[name="a6-title"]')).toHaveValue('opal glow');
      const loaded = page.locator('.editor-entry').nth(6);
      await loaded.locator('summary').click();
      const originalEvent = page.waitForEvent('download');
      await loaded.getByRole('button', { name: 'Download original (if saved)' }).click();
      const original = await originalEvent;
      expect(original.suggestedFilename()).toBe('opal_glow.png');
      const originalPath = testInfo.outputPath('opal_original.png');
      await original.saveAs(originalPath);
      expect((await fs.readFile(originalPath)).equals(png)).toBe(true);
      const zipEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download originals backup ZIP' }).click();
      const zipDownload = await zipEvent;
      expect(zipDownload.suggestedFilename()).toBe('BINAIUI-originals.zip');
      const zipPath = testInfo.outputPath('batch-originals.zip');
      await zipDownload.saveAs(zipPath);
      const output = execFileSync('python3', ['-c', [
        'import sys,json,zipfile',
        'with zipfile.ZipFile(sys.argv[1]) as z:',
        ' assert z.testzip() is None',
        ' manifest=json.loads(z.read("originals/manifest.json"))',
        ' assert len(manifest["artworks"])==3',
        ' assert len(z.namelist())==4',
        ' assert all(name.startswith("originals/") for name in z.namelist())',
        ' assert all(z.read(name).startswith(b"\x89PNG\r\n\x1a\n") for name in z.namelist() if name.endswith(".png"))',
        'print("verified original backup")'
      ].join('\n'),zipPath], { encoding: 'utf8' });
      expect(output).toContain('verified original backup');
    });

    test('invalid formats and oversize files skip without losing valid imports', async ({ page, request }) => {
      const png = await (await request.get(prefix + 'icon-192.png')).body();
      await page.goto(prefix + '#studio');
      await page.locator('#batch-images').setInputFiles([
        { name: 'valid-first.png', mimeType: 'image/png', buffer: png },
        { name: 'unsupported.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') },
        { name: 'oversize.png', mimeType: 'image/png', buffer: Buffer.alloc(12*1024*1024+1) },
        { name: 'valid-second.png', mimeType: 'image/png', buffer: png }
      ]);
      await expect(page.locator('#batch-results')).toContainText('Imported 2 of 4');
      await expect(page.locator('#batch-results')).toContainText('2 skipped');
      await expect(page.locator('input[name="a6-title"]')).toHaveValue('valid-first');
      await expect(page.locator('input[name="a7-title"]')).toHaveValue('valid-second');
      await page.reload();
      await expect(page.locator('input[name="a7-title"]')).toHaveValue('valid-second');
    });

    test('archive limit does not overwrite existing artwork or exceed 60', async ({ page, request }, testInfo) => {
      const base = await (await request.get(prefix + 'content.json')).json();
      const sample = base.archive[0];
      for (let i = base.archive.length; i < 59; i++) {
        base.archive.push({ ...sample, id: 'fill-'+i, title:'Filled '+i, featured:false, sample:false });
      }
      await page.goto(prefix + '#studio');
      await page.getByLabel('Import content', { exact: true }).setInputFiles({
        name: 'content.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(base))
      });
      await expect(page.locator('.editor-entry').first()).toBeVisible();
      const png = await (await request.get(prefix + 'icon-192.png')).body();
      await page.locator('#batch-images').setInputFiles([
        { name: 'last-open-slot.png', mimeType: 'image/png', buffer: png },
        { name: 'too-many-one.png', mimeType: 'image/png', buffer: png },
        { name: 'too-many-two.png', mimeType: 'image/png', buffer: png }
      ]);
      await expect(page.locator('#batch-results')).toContainText('Imported 1 of 3');
      await expect(page.locator('#batch-results')).toContainText('archive limit');
      const downloadEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export content', exact: true }).click();
      const download=await downloadEvent;
      const path=testInfo.outputPath('capacity.json');
      await download.saveAs(path);
      const exported=JSON.parse(await fs.readFile(path,'utf8'));
      expect(exported.archive).toHaveLength(60);
      expect(exported.archive[0].id).toBe(sample.id);
      expect(exported.archive[59].title).toBe('last-open-slot');
    });

    test('storage failure retains successful imports and downloadable original in open tab', async ({ page, request }, testInfo) => {
      await page.addInitScript(() => {
        Storage.prototype.setItem = function () {
          throw new DOMException('Simulated full storage', 'QuotaExceededError');
        };
        Object.defineProperty(window, 'indexedDB', { value: null, configurable: true });
      });
      const png = await (await request.get(prefix + 'icon-192.png')).body();
      await page.goto(prefix + '#studio');
      await page.locator('#batch-images').setInputFiles([
        { name:'recovery-a.png',mimeType:'image/png',buffer:png },
        { name:'recovery-b.png',mimeType:'image/png',buffer:png }
      ]);
      await expect(page.locator('#batch-results')).toContainText('Imported 2 of 2');
      await expect(page.locator('#batch-results')).toContainText('remain in this open tab');
      await expect(page.locator('#batch-results')).toContainText('Export content');
      const contentEvent=page.waitForEvent('download');
      await page.getByRole('button',{name:'Export content',exact:true}).click();
      const exportedDownload=await contentEvent;
      const contentPath=testInfo.outputPath('failure-content.json');
      await exportedDownload.saveAs(contentPath);
      const data=JSON.parse(await fs.readFile(contentPath,'utf8'));
      expect(data.archive).toHaveLength(8);
      const entry=page.locator('.editor-entry').nth(6);
      if (!(await entry.evaluate(element => element.open))) await entry.locator('summary').click();
      const originalEvent=page.waitForEvent('download');
      await entry.getByRole('button',{name:'Download original (if saved)'}).click();
      const originalDownload=await originalEvent;
      const path=testInfo.outputPath('failure-original.png');
      await originalDownload.saveAs(path);
      expect((await fs.readFile(path)).equals(png)).toBe(true);
    });
  });
}

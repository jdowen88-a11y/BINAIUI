const { test, expect } = require('@playwright/test');

for (const prefix of ['/', '/BINAIUI/']) {
  test.describe('Unified GENESIS Studio at '+prefix, () => {
    test('all six phone navigation links remain visible and usable', async ({ page }) => {
      const routes = [
        ['Home', 'home'], ['Studio', 'studio'], ['Archive', 'archive'],
        ['Roadmap', 'roadmap'], ['Projects', 'projects'], ['About', 'about']
      ];
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(prefix);
        const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
        await expect(nav.getByRole('link')).toHaveCount(routes.length);
        for (const [name, hash] of routes) {
          const link = nav.getByRole('link', { name, exact: true });
          await expect(link).toBeVisible();
          const bounds = await link.boundingBox();
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
          expect(bounds.width).toBeGreaterThanOrEqual(44);
          expect(bounds.height).toBeGreaterThanOrEqual(44);
          await link.click();
          await expect(page).toHaveURL(new RegExp('#' + hash + '$'));
          await expect(link).toHaveAttribute('aria-current', 'page');
          await expect(page.locator('#main').getByRole('heading').first()).toBeVisible();
        }
      }
    });

    test('dashboard and separate PR statuses are honest', async ({ page }) => {
      await page.goto(prefix+'#home');
      await expect(page.getByRole('heading', { name: 'The living GENESIS workspace' })).toBeVisible();
      await page.goto(prefix+'#roadmap');
      await expect(page.locator('.gx-pr')).toHaveCount(3);
      await expect(page.locator('#gx-pr-status-1')).toContainText('Open');
      await expect(page.locator('#gx-pr-status-2')).toContainText('Draft');
      await expect(page.locator('#gx-pr-status-3')).toContainText('Open');
      await expect(page.locator('.gx-roadmap')).toContainText('none is committed to GitHub');
    });

    test('field creates open-edge glyph art and exports a PNG', async ({ page }) => {
      await page.goto(prefix+'#studio');
      const canvas=page.locator('#gx-canvas');
      await expect(canvas).toBeVisible();
      await expect.poll(async ()=>canvas.evaluate(el=>el.getContext('2d').getImageData(0,0,1,1).data[3])).toBe(255);
      const info=await canvas.evaluate(el => {
        const data=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
        return {width:el.width,height:el.height,opaque:data[3]===255,png:el.toDataURL('image/png').startsWith('data:image/png;base64,')};
      });
      expect(info.width).toBeGreaterThan(100);
      expect(info.height).toBeGreaterThan(100);
      expect(info.opaque).toBe(true);
      expect(info.png).toBe(true);
      await page.locator('#gx-seed').fill('9');
      await page.getByRole('button',{name:'Generate field'}).click();
      const download=page.waitForEvent('download');
      await page.getByRole('button',{name:/Save PNG/}).click();
      expect((await download).suggestedFilename()).toContain('.png');
    });

    test('manifest-backed references, AirX selection and UNKEY work', async ({ page }) => {
      await page.goto(prefix+'#studio');
      await page.getByRole('tab',{name:'References'}).click();
      await expect(page.locator('.gx-reference')).toHaveCount(10);
      await expect(page.locator('#gx-reference-list')).toContainText('Original not in GitHub');
      await page.locator('#gx-filter').selectOption('AirX');
      await expect(page.locator('.gx-reference')).toHaveCount(6);
      await page.locator('#gx-search').fill('AIRX-05');
      await expect(page.locator('.gx-reference')).toHaveCount(1);
      await page.locator('.gx-reference button').click();
      await expect(page.locator('#gx-active')).toContainText('AIRX-05');
      await page.getByRole('tab',{name:'UNKEY'}).click();
      const output=page.locator('#gx-unkey-output');
      const nineLines=(await output.textContent()).trim().split('\n');
      expect(nineLines).toHaveLength(9);
      expect(nineLines.every(line=>/^[09•∴⋅↗⇝⟡ ]+$/.test(line))).toBe(true);
    });

    test('draft importer, local-original inspection and backups stay available', async ({ page }) => {
      await page.goto(prefix+'#studio');
      await expect(page.getByLabel('Introduction',{exact:true})).toBeVisible();
      await expect(page.locator('#batch-images')).toHaveAttribute('multiple','');
      await expect(page.locator('#export-originals')).toBeAttached();
      await page.getByRole('tab',{name:'Art / backups'}).click();
      await expect(page.locator('#gx-local-note')).toContainText('local archive');
      await page.getByRole('button',{name:/Go to batch importer/}).click();
      await expect(page.locator('#gx-classic')).toHaveAttribute('open','');
      await expect(page.getByLabel('Add multiple artworks from Photos or Files',{exact:true})).toBeVisible();
    });

    test('new shell assets, reference manifest and mobile layout fit', async ({ page, request }) => {
      const response=await request.get(prefix+'genesis-reference-manifest.json');
      expect(response.ok()).toBe(true);
      const manifest=await response.json();
      expect(manifest.artworks).toHaveLength(10);
      expect(manifest.artworks.every(a=>a.stored_in_github===false)).toBe(true);
      for(const width of [320,390]){
        await page.setViewportSize({width,height:844});
        await page.goto(prefix+'#studio');
        await page.getByRole('tab',{name:'References'}).click();
        const size=await page.evaluate(()=>({
          doc:document.documentElement.scrollWidth,
          view:document.documentElement.clientWidth
        }));
        expect(size.doc).toBeLessThanOrEqual(size.view+1);
      }
    });
  });
}

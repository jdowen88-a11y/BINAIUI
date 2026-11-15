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
      await expect(page.locator('.gx-pr')).toHaveCount(7);
      for (const number of [1, 2, 3, 4, 5, 7]) {
        await expect(page.locator('#gx-pr-status-'+number)).toContainText('Merged');
      }
      await expect(page.locator('#gx-pr-status-9')).toContainText('unmerged');
      await expect(page.locator('.gx-roadmap')).toContainText('none of the ten original binaries is in GitHub');
      await expect(page.locator('.gx-roadmap')).toContainText('2026-11-14');
    });

    test('public visitors can download website and published gallery without editor or login', async ({ page }) => {
      await page.goto(prefix+'#home');
      const websiteDownload=page.waitForEvent('download');
      await page.getByRole('button',{name:/Download public website ZIP/}).click();
      const website=await websiteDownload;
      expect(website.suggestedFilename()).toBe('BINAIUI.zip');

      await page.goto(prefix+'#archive');
      const galleryDownload=page.waitForEvent('download');
      await page.getByRole('button',{name:/Download published gallery ZIP/}).click();
      expect((await galleryDownload).suggestedFilename()).toBe('BINAIUI-published-gallery.zip');

      await page.locator('.art-card').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const imageDownload=page.waitForEvent('download');
      await page.getByRole('button',{name:/Download image/}).click();
      expect((await imageDownload).suggestedFilename()).toMatch(/^BINAIUI-.*\.(svg|png|jpg|webp)$/);
    });

    test('K equals one and both non Euclidean currents move forward', async ({page}) => {
      await page.goto(prefix+'#studio');
      const info=await page.evaluate(()=>{
        const mod=window.GENESIS_CURVATURE;
        const canvas=document.querySelector('#gx-canvas');
        const testedK=[0.25,1,4,15];
        const gaps=[];
        const speed=[];
        for(const K of testedK){
          let lastX=Number.NEGATIVE_INFINITY;
          for(let j=0;j<=200;j++){
            const t=j/200,lower=mod.streamPoint(K,0,t),upper=mod.streamPoint(K,1,t);
            gaps.push(upper.y-lower.y);
            if(j>0)speed.push(lower.x-lastX);
            lastX=lower.x;
            expect(mod.metricFactor(K,lower.x,lower.y)).toBeGreaterThan(0);
          }
        }
        return {geometry:canvas.dataset.geometry,direction:canvas.dataset.direction,
          K:canvas.dataset.curvature,palette:mod.palette,gaps,speed,
          low:mod.remapRGB(10,10,10),mid:mod.remapRGB(120,120,120),
          high:mod.remapRGB(250,250,250)};
      });
      expect(info.geometry).toBe('forward-spherical-twin-streams');
      expect(info.direction).toBe('forward-only');
      expect(info.K).toBe('1');
      expect(info.palette).toEqual({void:'#000000',bio:'#19FF33',ultraviolet:'#CC00FF'});
      expect(info.gaps.every(g=>g>0)).toBe(true);
      expect(info.speed.every(step=>step>0)).toBe(true);
      expect(info.low).toEqual([0,0,0,255]);
      expect(info.mid).toEqual([25,255,51,255]);
      expect(info.high).toEqual([204,0,255,255]);
      await page.locator('#gx-curvature').fill('4');
      await page.locator('#gx-curvature').dispatchEvent('change');
      await expect(page.locator('#gx-canvas')).toHaveAttribute('data-curvature','4');
      await page.locator('#gx-curvature').fill('0');
      await page.locator('#gx-curvature').dispatchEvent('change');
      await expect(page.locator('#gx-canvas')).toHaveAttribute('data-curvature','1');
      await expect(page.locator('#gx-curvature-desc')).toContainText('non Euclidean');
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
      await page.locator('#gx-seed').fill('808');
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
      await expect(output).toContainText('ACCRETE');
      await expect(output).toContainText('RECRYSTALLIZE');
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

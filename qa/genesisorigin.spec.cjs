const { test, expect } = require('@playwright/test');

for (const prefix of ['/', '/BINAIUI/']) {
 test.describe('GENESIS ORIGIN glyph universe at '+prefix, () => {
  test('contains fresh glyph code with no literal minus or bit mode', async ({ request }) => {
   const response=await request.get(prefix+'genesisorigin.html');
   expect(response.ok()).toBe(true);
   const source=await response.text();
   expect(source.includes(String.fromCharCode(45))).toBe(false);
   expect(source.includes(String.fromCharCode(8722))).toBe(false);
   expect(source.toLowerCase().includes('bash')).toBe(false);
   expect(source.includes('bitDepth')).toBe(false);
   expect(source.includes('Uint16')).toBe(false);
   expect(source.includes('GENESIS_CURVATURE')).toBe(false);
   expect(source.includes('GENESIS_ORIGIN')).toBe(true);
  });

  test('draws a dense black glyph universe with seed 808', async ({ page }) => {
   test.setTimeout(60000);
   await page.setViewportSize({ width:390, height:844 });
   await page.goto(prefix+'genesisorigin.html');
   const canvas=page.locator('#universe');
   await expect(canvas).toBeVisible();
   await expect.poll(async ()=>page.evaluate(()=>window.GENESIS_ORIGIN?.summary().glyphs||0)).toBeGreaterThan(30000);
   const first=await page.evaluate(()=>window.GENESIS_ORIGIN.summary());
   expect(first.seed).toBe(808);
   expect(first.space==='display'+String.fromCharCode(45)+'p3'||first.space==='preview').toBe(true);
   await page.getByRole('button',{name:'Regenerate'}).click();
   const second=await page.evaluate(()=>window.GENESIS_ORIGIN.summary());
   expect(second.seed).toBe(808);
   expect(second.glyphs).toBe(first.glyphs);
   const pixels=await canvas.evaluate(c=>{
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let lit=0,dark=0;
    for(let i=0;i<d.length;i+=256){
     if(d[i]+d[i+1]+d[i+2]>12)lit+=1;
     else dark+=1;
    }
    return {lit,dark};
   });
   expect(pixels.lit).toBeGreaterThan(100);
   expect(pixels.dark).toBeGreaterThan(100);
  });

  test('can export its glyphs as vector artwork', async ({ page }) => {
   test.setTimeout(60000);
   await page.setViewportSize({ width:390, height:844 });
   await page.goto(prefix+'genesisorigin.html');
   await expect.poll(async ()=>page.evaluate(()=>window.GENESIS_ORIGIN?.summary().glyphs||0)).toBeGreaterThan(30000);
   const pending=page.waitForEvent('download');
   await page.getByRole('button',{name:'Save Vector SVG'}).click();
   const download=await pending;
   expect(download.suggestedFilename()).toBe('GENESIS_ORIGIN_808.svg');
   await expect(page.locator('#report')).toContainText('Vector field saved');
  });
 });
}
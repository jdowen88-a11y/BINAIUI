const {test,expect}=require('@playwright/test');

for (const prefix of ['/', '/BINAIUI/']) {
  test.describe('GENESIS authored inverse source at '+prefix,()=>{
    test('keeps inverse syntax and accepts no rigid geometry',async ({page,request})=>{
      const answer=await request.get(prefix+'genesis.codex');
      expect(answer.ok()).toBe(true);
      const source=await answer.text();
      expect(source.includes(')(')).toBe(true);
      expect(source.includes('()')).toBe(false);
      await page.goto(prefix+'genesis-codex.html');
      await expect(page.locator('#field')).toHaveAttribute('data-geometry','hyperbolicFermiGeodesics');
      const result=await page.evaluate(async ()=>{
        const api=window.BINAIUI_CODEX;
        const source=await (await fetch('./genesis.codex')).text();
        const ast=api.parse(source),canvas=document.querySelector('#field');
        const matrix0=api.metric(1,0),matrix1=api.metric(1,1);
        const paths=api.trajectories(1,808,12);
        const monotone=paths.every(line=>line.points.every((p,i)=>i===0||p.v>line.points[i-1].v));
        const same=JSON.stringify(paths)===JSON.stringify(api.trajectories(1,808,12));
        const pixel=canvas.getContext('2d').getImageData(0,0,1,1).data;
        return {ast,geometry:canvas.dataset.geometry,curvature:canvas.dataset.gaussianCurvature,
          crossbars:canvas.dataset.crossbars,triangles:canvas.dataset.triangles,
          inverse:canvas.dataset.inverse,metric0:matrix0,metric1:matrix1,
          count:paths.length,monotone,same,opaque:pixel[3]===255,
          rejects:((()=>{try{api.parse('INVERSE )( ()');return false;}catch{return true;}}))()};
      });
      expect(result.ast.INVERSE).toBe(')(');
      expect(result.ast.TRIANGLES).toBe('🔺 🔻');
      expect(result.ast.DNA_RUNGS).toBe('NONE');
      expect(result.ast.TRIANGLE_GRID).toBe('NONE');
      expect(result.geometry).toBe('hyperbolicFermiGeodesics');
      expect(result.curvature).toBe('-1');
      expect(result.crossbars).toBe('none');
      expect(result.triangles).toBe('emojiOnly');
      expect(result.inverse).toBe(')(');
      expect(result.metric0).toEqual({gUU:1,gVV:1,gaussianCurvature:-1});
      expect(result.metric1.gVV).toBeGreaterThan(1);
      expect(result.count).toBe(12);
      expect(result.monotone).toBe(true);
      expect(result.same).toBe(true);
      expect(result.opaque).toBe(true);
      expect(result.rejects).toBe(true);
    });
    test('exports visual field without changing authored source',async ({page})=>{
      await page.goto(prefix+'genesis-codex.html');
      await expect(page.locator('#field')).toHaveAttribute('data-inverse',')(');
      await page.locator('#curvature').fill('2');
      await page.locator('#generate').click();
      await expect(page.locator('#field')).toHaveAttribute('data-gaussian-curvature','-2');
      const download=page.waitForEvent('download');
      await page.locator('#save').click();
      expect((await download).suggestedFilename()).toBe('GENESIS-inverse-hyperbolic-808.png');
      await expect(page.locator('#status')).toContainText('rungs NONE');
    });
  });
}

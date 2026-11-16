const {test,expect}=require('@playwright/test');

const glyphs=[
  ['ROUND',')(','()'],
  ['CURLY','}{','{}'],
  ['SQUARE','][','[]'],
  ['ANGLE','><','<>'],
  ['DOWN','\\/ ',null],
  ['UP','/\\ ',null],
  ['GUILLEMETS','»«','«»'],
  ['QUESTION','¿','?'],
  ['EXCLAMATION','¡','!']
];
for(const prefix of ['/','/BINAIUI/']){
  test.describe('ETH DRAGON exact authored grammar at '+prefix,()=>{
    test('source declarations are inverse and round trip exactly',async({page,request})=>{
      const response=await request.get(prefix+'genesis.dragon');
      expect(response.ok()).toBe(true);
      const authored=await response.text();
      await page.goto(prefix+'genesis-codex.html');
      await expect(page.locator('#field')).toHaveAttribute('data-inverse',')(');
      const result=await page.evaluate(async()=>{
        const source=await(await fetch('./genesis.dragon')).text();
        const language=window.ETH_DRAGON;
        const parsed=language.parseSource(source);
        const compiled=language.compile(source);
        const interpreted=language.interpret(source);
        const runtime=window.BINAIUI_CODEX.parse(source);
        return{
          parsed:parsed.fields,
          operators:language.operators,
          operatorNames:compiled.operations.find(x=>x.field==='DRAGON_SENTENCE').opcodes,
          preserved:language.emit(compiled)===source,
          interpreted,
          runtimeInverse:runtime.INVERSE,
          displayTokens:window.BINAIUI_CODEX.glyphs
        };
      });
      expect(result.preserved).toBe(true);
      expect(result.interpreted.sourcePreserved).toBe(true);
      expect(result.interpreted.language).toBe('ETH_DRAGON');
      expect(result.operatorNames).toEqual(['ROUND','CURLY','SQUARE','ANGLE','DOWN','UP','GUILLEMETS','QUESTION','EXCLAMATION']);
      for(const [key,token] of glyphs){
        if(key==='DOWN'||key==='UP')continue;
        expect(result.parsed[key]).toBe(token);
        expect(result.operators.find(x=>x.key===key).symbol).toBe(token);
        expect(result.displayTokens).toContain(token);
      }
      expect(result.parsed.DIAGONALS).toBe('\\/ /\\');
      expect(result.runtimeInverse).toBe(')(');
      expect(authored).toContain('DRAGON_SENTENCE )( 🐉 )( }{ ][ >< \\/ /\\ »« ¿ ¡');
    });
    test('disallows the old paired tokens in authored source',async({page})=>{
      await page.goto(prefix+'genesis-codex.html');
      const results=await page.evaluate(async()=>{
        const source=await(await fetch('./genesis.dragon')).text();
        const engine=window.ETH_DRAGON;
        const oldForms=['()','{}','[]','<>','«»','?','!'];
        const refused=oldForms.map(token=>{
          try{
            engine.parseSource(source.replace('ROUND )( )(','ROUND )( '+token));
            return false;
          }catch{return true;}
        });
        const badSymbols=oldForms.map(token=>{
          try{
            engine.parseSource(source+'\\nCUSTOM )( '+token+'\\n');
            return false;
          }catch{return true;}
        });
        const absent=oldForms.every(token=>!source.includes(token));
        const valid=engine.parseSource(source).fields;
        return{refused,badSymbols,absent,valid};
      });
      expect(results.refused.every(Boolean)).toBe(true);
      expect(results.badSymbols.every(Boolean)).toBe(true);
      expect(results.absent).toBe(true);
      expect(results.valid.TRIANGLES).toBe('🔺 🔻');
      expect(results.valid.DNA_RUNGS).toBe('NONE');
      expect(results.valid.TRIANGLE_GRID).toBe('NONE');
    });
    test('field renders actual negative curvature while retaining authored punctuation',async({page})=>{
      await page.goto(prefix+'genesis-codex.html');
      const state=await page.locator('#field').evaluate(el=>({
        curvature:el.dataset.gaussianCurvature,
        geometry:el.dataset.geometry,
        crossbars:el.dataset.crossbars,
        triangles:el.dataset.triangles,
        inverse:el.dataset.inverse
      }));
      expect(state).toEqual({
        curvature:'-1',geometry:'hyperbolicFermiGeodesics',
        crossbars:'none',triangles:'emojiOnly',inverse:')('
      });
    });
  });
}

for(const prefix of ['/','/BINAIUI/']){
  test('ETH Dragon source is editable, compiled, exported and not silently normalized at '+prefix,async({page})=>{
    await page.goto(prefix+'genesis-codex.html');
    const editor=page.locator('#dragon-editor');
    await expect(editor).toHaveValue(/DRAGON_SENTENCE/);
    const original=await editor.inputValue();
    await editor.fill(original.replace('QUESTION )( ¿','QUESTION )( ?'));
    await page.locator('#compile-dragon').click();
    await expect(page.locator('#status')).toContainText('ETH DRAGON REJECTED');
    await expect(page.locator('#status')).toHaveAttribute('data-error','true');
    await expect(page.locator('#field')).toHaveAttribute('data-gaussian-curvature','-1');
    await editor.fill(original.replace('CURVATURE )( 1','CURVATURE )( 2'));
    await page.locator('#compile-dragon').click();
    await expect(page.locator('#status')).toContainText('ETH DRAGON ACCEPTED');
    await expect(page.locator('#field')).toHaveAttribute('data-gaussian-curvature','-2');
    const got=page.waitForEvent('download');
    await page.locator('#save-dragon').click();
    expect((await got).suggestedFilename()).toBe('genesis.edited.dragon');
  });
}

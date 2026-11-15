const { test, expect } = require('@playwright/test');
const { readFile } = require('node:fs/promises');

for(const prefix of ['/', '/BINAIUI/']){
 test.describe('GENESIS glyph language on '+prefix,()=>{
  test('source accepts only const, equals, whitespace, and ancient glyphs',async({request})=>{
   const response=await request.get(prefix+'genesisorigin.glyph');
   expect(response.ok()).toBe(true);
   const text=await response.text();
   const lines=text.trimEnd().split(String.fromCharCode(10));
   expect(lines).toHaveLength(19);
   expect(lines.every(line=>/^const \S+ = \S+$/u.test(line))).toBe(true);
   const ancient=/^[\u{13000}-\u{1342f}]+$/u;
   for(const line of lines){
    const pieces=line.split(' = ');
    const name=pieces[0].slice(6);
    expect(ancient.test(name)).toBe(true);
    expect(ancient.test(pieces[1])).toBe(true);
   }
   const removed=text.replaceAll('const','').replaceAll('=','').replaceAll(' ','').trim();
   expect(Array.from(removed).every(char=>/^[\u{13000}-\u{1342f}]$/u.test(char))).toBe(true);
   expect(text.includes(String.fromCharCode(45))).toBe(false);
  });

  test('the host and interpreter are independent from old GENESIS',async({request})=>{
   const host=await request.get(prefix+'genesisorigin.html');
   const runtime=await request.get(prefix+'genesisoriginruntime.js');
   expect(host.ok()).toBe(true);
   expect(runtime.ok()).toBe(true);
   const html=await host.text();
   const code=await runtime.text();
   expect(html).toContain('src="genesisoriginruntime.js"');
   expect(code).toContain("fetch('./genesisorigin.glyph'");
   expect(code).not.toContain('GENESIS_CURVATURE');
   expect(code).not.toContain('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
   expect(code.toLowerCase()).not.toContain('bash');
   expect(code).not.toContain('bitDepth');
   expect(code.includes(String.fromCharCode(45))).toBe(false);
  });

  test('renders only declared hieroglyphs on black at seed 808',async({page})=>{
   test.setTimeout(90000);
   await page.setViewportSize({width:390,height:844});
   await page.goto(prefix+'genesisorigin.html');
   const canvas=page.locator('#universe');
   await expect(canvas).toBeVisible();
   await expect.poll(async()=>page.evaluate(()=>window.GENESIS_ORIGIN?.summary().glyphs||0),{timeout:45000}).toBeGreaterThan(30000);
   const first=await page.evaluate(()=>window.GENESIS_ORIGIN.summary());
   expect(first.seed).toBe(808);
   expect(first.program).toBe(19);
   expect(first.source).toBe('genesisorigin.glyph');
   await page.locator('#create').click();
   const again=await page.evaluate(()=>window.GENESIS_ORIGIN.summary());
   expect(again.seed).toBe(808);
   expect(again.glyphs).toBe(first.glyphs);
   expect(again.signature).toBe(first.signature);
   const sample=await canvas.evaluate(el=>{
    const g=el.getContext('2d');
    const original=g.fillText.bind(g);
    const glyphs=new Set();
    g.fillText=(text,x,y)=>{
      if(glyphs.size<60)glyphs.add(text);
      return original(text,x,y);
    };
    window.GENESIS_ORIGIN.draw(808);
    g.fillText=original;
    const image=g.getImageData(0,0,el.width,el.height).data;
    let lit=0,dark=0;
    for(let i=0;i<image.length;i+=256){
      if(image[i]+image[i+1]+image[i+2]>12)lit+=1;
      else dark+=1;
    }
    return {glyphs:Array.from(glyphs),lit,dark};
   });
   expect(sample.glyphs.length).toBeGreaterThan(8);
   expect(sample.glyphs.every(char=>/^[\u{13000}-\u{1342f}]+$/u.test(char))).toBe(true);
   expect(sample.lit).toBeGreaterThan(100);
   expect(sample.dark).toBeGreaterThan(100);
  });

  test('rejects keyboard symbols and English within ancient source',async({page})=>{
   test.setTimeout(90000);
   await page.setViewportSize({width:390,height:844});
   await page.goto(prefix+'genesisorigin.html');
   await expect.poll(async()=>page.evaluate(()=>window.GENESIS_ORIGIN?.summary().program||0),{timeout:45000}).toBe(19);
   const invalid=await page.evaluate(()=>{
    const parse=window.GENESIS_ORIGIN.readAncientProgram;
    return [
      'const 𓁹 = ABC',
      'const 𓁹 = 𓇳+𓂀',
      'const 𓁹 = 𓇳; ',
      'const 𓁹 = 𓇳\nconst 𓁹 = 𓊹',
      'function 𓁹 = 𓇳',
      'const 𓁹 = 123'
    ].map(text=>{
      try{parse(text);return false;}catch{return true;}
    });
   });
   expect(invalid.every(Boolean)).toBe(true);
  });

  test('exports the generated hieroglyph marks as actual SVG elements',async({page})=>{
   test.setTimeout(90000);
   await page.setViewportSize({width:390,height:844});
   await page.goto(prefix+'genesisorigin.html');
   await expect.poll(async()=>page.evaluate(()=>window.GENESIS_ORIGIN?.summary().glyphs||0),{timeout:45000}).toBeGreaterThan(30000);
   const pending=page.waitForEvent('download');
   await page.locator('#vector').click();
   const download=await pending;
   expect(download.suggestedFilename()).toBe('GENESIS_ORIGIN_808.svg');
   await expect(page.locator('#report')).toContainText('Vector field saved');
   const svg=await readFile(await download.path(),'utf8');
   expect(svg).toContain('<svg ');
   expect(svg).toContain('fill="#000000"');
   expect(svg).toContain('<text ');
   expect(svg.includes('𓁹')||svg.includes('𓇳')).toBe(true);
  });
 });
}

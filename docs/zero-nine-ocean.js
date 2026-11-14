/* 0 -> 9: every point advances. No sine, closed circuit, or reverse step. */
(function(root){
'use strict';
const PALETTE=['#df4dff','#8f58f2','#19aeff','#36f3ff','#f6b54f','#ec49ac'];
const SYMBOLS='09';
function random32(seed){
 let s=(Number(seed)>>>0)||9;
 return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
}
function geometry(seed=9,pairs=36,samples=97){
 const rand=random32(seed),strands=[];
 for(let i=0;i<pairs;i++){
  const center=.08+.84*rand(),gap=.006+.015*rand(),flare=.055+.09*rand();
  const bend=(rand()-.5)*.17,lean=(rand()-.5)*.27;
  for(const side of [-1,1]){
   const points=[];
   for(let j=0;j<samples;j++){
    const t=j/(samples-1),approach=Math.abs(2*t-1);
    const separation=gap+flare*approach*approach;
    const lateral=bend*t*(1-t)*(2*t-1)*8;
    const x=Number((1.25*t).toFixed(7));
    const y=Number((center+side*separation+lateral+lean*t).toFixed(7));
    points.push([x,y]);
   }
   strands.push({pair:i,side,color:PALETTE[(i*2+(side+1)/2)%PALETTE.length],
     origin:'0',release:'9',pattern:'09',points});
  }
 }
 return {version:'09.2',seed:Number(seed),symbol_set:SYMBOLS,
  sequence:'09',flow:'090909090909→',strands};
}
function verify(field){
 const strands=field.strands;
 const checks={
  paired_currents:strands.length>0&&strands.length%2===0,
  open_edges:strands.every(s=>s.points[0][0]===0&&s.points[s.points.length-1][0]>1),
  strictly_forward_every_step:strands.every(s=>s.points.every((p,i)=>i===0||p[0]>s.points[i-1][0])),
  not_closed:strands.every(s=>s.points[0][0]!==s.points[s.points.length-1][0]),
  zero_nine_only:field.symbol_set==='09'&&field.sequence==='09'&&strands.every(s=>s.pattern==='09'),
  zero_origin_nine_release:strands.every(s=>s.origin==='0'&&s.release==='9'),
  brief_near_contact_no_join:strands.every((s,i)=>i%2||Math.abs(
    s.points[Math.floor(s.points.length/2)][1]-
    strands[i+1].points[Math.floor(s.points.length/2)][1])>.001)
 };
 return {passed:Object.values(checks).every(Boolean),checks,strands:strands.length};
}
function draw(canvas,seed=9,options={}){
 const bounds=canvas.getBoundingClientRect(),ratio=Math.min(2,root.devicePixelRatio||1);
 const w=Math.max(320,Math.round((bounds.width||960)*ratio)),h=Math.max(240,Math.round((bounds.height||540)*ratio));
 canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d'),rng=random32(seed^0x0909),data=geometry(seed,options.pairs||48,options.samples||97);
 const back=g.createLinearGradient(0,0,w,h);
 back.addColorStop(0,'#06051b');back.addColorStop(.5,'#110725');back.addColorStop(1,'#02081d');
 g.fillStyle=back;g.fillRect(0,0,w,h);
 for(let i=0;i<Math.round(w*h/1150);i++){
  g.fillStyle=PALETTE[Math.floor(rng()*PALETTE.length)];g.globalAlpha=.12+.48*rng();
  const x=rng()*w,y=rng()*h,r=.4+rng()*1.1;g.fillRect(x,y,r,r);
 }
 for(const strand of data.strands){
  const pts=strand.points;
  g.save();g.beginPath();
  pts.forEach(([x,y],i)=>{const X=x*w,Y=y*h;if(i===0)g.moveTo(X,Y);else g.lineTo(X,Y);});
  g.strokeStyle=strand.color;g.globalAlpha=.17;g.lineWidth=5.4*ratio;
  g.shadowBlur=10*ratio;g.shadowColor=strand.color;g.stroke();
  g.globalAlpha=.67;g.lineWidth=.75*ratio;g.shadowBlur=0;g.stroke();g.restore();
  let digit=0;
  for(let j=6;j<pts.length-4;j+=5){
   const point=pts[j];
   g.fillStyle=strand.color;g.globalAlpha=.55+.38*rng();
   g.font=(9+rng()*9)*ratio+'px monospace';
   g.fillText(SYMBOLS[digit%2],point[0]*w,point[1]*h);
   digit++;
  }
 }
 g.globalAlpha=1;return data;
}
const api={geometry,verify,draw,SYMBOLS,PALETTE};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.BINAIUI_ZERO_NINE=api;
})(typeof globalThis!=='undefined'?globalThis:this);

/* BINAIUI 0 -> 9 open ocean; the glyphs create the canvas. */
(function(root){
'use strict';
const PALETTE=['#df4dff','#8f58f2','#19aeff','#36f3ff','#f6b54f','#ec49ac'];
const SYMBOLS='0099•∴⋅↗⇝⟡';
function random32(seed){let s=(Number(seed)>>>0)||9;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function geometry(seed=9,pairs=36,samples=97){
 const rand=random32(seed),strands=[];
 for(let i=0;i<pairs;i++){
  const center=-.12+1.24*rand(),amplitude=.011+.037*rand(),phase=2*Math.PI*rand(),gap=.007+.014*rand(),flare=.045+.095*rand(),lean=(rand()-.5)*.31;
  for(const side of [-1,1]){
   const points=[];
   for(let j=0;j<samples;j++){
    const t=j/(samples-1),approach=Math.abs(2*t-1),separation=gap+flare*Math.pow(approach,1.45),wave=amplitude*Math.sin(2*Math.PI*t*1.35+phase)*(.3+.7*approach);
    const pulse=Math.exp(-Math.pow((t-.5)/.18,2)),turn=2.2*Math.PI*(t-.5)+phase;
    points.push([Number((-.24+1.48*t+.22*pulse*Math.cos(turn)).toFixed(7)),Number((center+side*separation+.15*pulse*Math.sin(turn)+wave+lean*(t-.5)).toFixed(7))]);
   }
   strands.push({pair:i,side,color:PALETTE[(i*2+(side+1)/2)%PALETTE.length],origin:'0',release:'9',points});
  }
 }
 return {version:'09.1',seed:Number(seed),symbol_set:SYMBOLS,flow:'0→⇝→∴→ 9 ↗',strands};
}
function verify(field){
 const strands=field.strands;
 const checks={
  paired_currents:strands.length%2===0,
  all_open_edges:strands.every(s=>s.points[0][0]<0&&s.points[s.points.length-1][0]>1),
  outward_exit:strands.every(s=>s.points[s.points.length-1][0]>s.points[0][0]),
  curved_release:strands.some(s=>s.points.some((p,i)=>i>0&&p[0]<s.points[i-1][0])),
  no_endpoint_closures:strands.every(s=>JSON.stringify(s.points[0])!==JSON.stringify(s.points[s.points.length-1])),
  numeric_symbol_field:[...field.symbol_set].every(c=>SYMBOLS.includes(c)&&c.charCodeAt(0)>=32),
  start_zero_release_nine:strands.every(s=>s.origin==='0'&&s.release==='9'),
  encounter_gap_not_joined:strands.every((s,i)=>i%2||Math.abs(s.points[Math.floor(s.points.length/2)][1]-strands[i+1].points[Math.floor(s.points.length/2)][1])>.001)
 };
 return {passed:Object.values(checks).every(Boolean),checks,strands:strands.length};
}
function draw(canvas,seed=9,options={}){
 const bounds=canvas.getBoundingClientRect(),ratio=Math.min(2,root.devicePixelRatio||1);
 const w=Math.max(320,Math.round((bounds.width||960)*ratio)),h=Math.max(240,Math.round((bounds.height||540)*ratio));
 canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d'),rng=random32(seed^0x0909),data=geometry(seed,options.pairs||48,options.samples||97);
 const back=g.createLinearGradient(0,0,w,h);back.addColorStop(0,'#06051b');back.addColorStop(.5,'#110725');back.addColorStop(1,'#02081d');g.fillStyle=back;g.fillRect(0,0,w,h);
 for(let i=0;i<Math.round(w*h/1150);i++){
  g.fillStyle=PALETTE[Math.floor(rng()*PALETTE.length)];g.globalAlpha=.12+.48*rng();
  const x=rng()*w,y=rng()*h,r=.4+rng()*1.1;g.fillRect(x,y,r,r);
 }
 for(const strand of data.strands){
  const pts=strand.points;
  g.save();g.beginPath();pts.forEach(([x,y],i)=>{const X=x*w,Y=y*h;if(!i)g.moveTo(X,Y);else g.lineTo(X,Y);});
  g.strokeStyle=strand.color;g.globalAlpha=.16;g.lineWidth=5.4*ratio;g.shadowBlur=10*ratio;g.shadowColor=strand.color;g.stroke();
  g.globalAlpha=.61;g.lineWidth=.75*ratio;g.shadowBlur=0;g.stroke();g.restore();
  for(let j=9;j<pts.length-9;j+=13){
   const point=pts[j],ch=SYMBOLS[Math.floor(rng()*SYMBOLS.length)];g.fillStyle=strand.color;
   g.globalAlpha=.49+.44*rng();g.font=(9+rng()*9)*ratio+'px monospace';g.fillText(ch,point[0]*w,point[1]*h);
  }
  const p0=pts[Math.floor(pts.length*.21)],p9=pts[Math.floor(pts.length*.78)];
  g.globalAlpha=.6;g.font=11*ratio+'px monospace';g.fillStyle=strand.color;
  g.fillText('0',p0[0]*w,p0[1]*h);g.fillText('9',p9[0]*w,p9[1]*h);
 }
 g.globalAlpha=1;return data;
}
const api={geometry,verify,draw,SYMBOLS,PALETTE};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.BINAIUI_ZERO_NINE=api;
})(typeof globalThis!=='undefined'?globalThis:this);

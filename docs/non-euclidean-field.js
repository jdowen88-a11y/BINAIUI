/* GENESIS CURVATURE: two non-intersecting hyperbolic quantum-current visuals.
   Mathematical model: upper-half-plane metric ds^2=(dx^2+dy^2)/(kappa^2*y^2).
   Constant Gaussian curvature K=-kappa^2 < 0. No triangle meshes.
   The currents are nested disjoint geodesics, not a claim about quantum physics. */
(() => {
'use strict';
const COLORS=Object.freeze({void:'#000000',bio:'#19FF33',ultraviolet:'#CC00FF'});
const RADII=Object.freeze([0.68,1.00]);
const GLYPHS=Array.from('0123456789∞λπΣ∴⌑∅∿');

function kappa(K) {
  if(!Number.isFinite(K)||K>=0)throw new RangeError('K must be finite and negative.');
  return Math.sqrt(-K);
}
function metricFactor(K,y) {
  if(!(y>0))throw new RangeError('Hyperbolic half-plane requires y > 0.');
  const q=kappa(K)*y;
  return 1/(q*q);
}
/* Parameter s measures hyperbolic arclength. The two radii are
   concentric Poincare upper-half-plane geodesics, never crossing. */
function geodesicPoint(K,radius,s) {
  const a=kappa(K);
  if(!(radius>0)||!Number.isFinite(s))throw new RangeError('Invalid geodesic parameter.');
  const u=a*s,cosh=Math.cosh(u);
  return {x:radius*Math.tanh(u),y:radius/cosh};
}
function geodesicAtX(radius,x) {
  if(!(radius>0)||!Number.isFinite(x)||Math.abs(x)>=radius)throw new RangeError('x must lie inside the geodesic.');
  return {x,y:Math.sqrt(radius*radius-x*x)};
}
function currentsAtX(x) {
  const lower=geodesicAtX(RADII[0],x),upper=geodesicAtX(RADII[1],x);
  return {lower,upper,gap:upper.y-lower.y};
}
/* Display-only source RGB remap: original image bytes remain untouched. */
function remapRGB(red,green,blue,alpha=255) {
  const luminance=(0.2126*red+0.7152*green+0.0722*blue)/255;
  return luminance<1/3?[0,0,0,alpha]:luminance<2/3?[25,255,51,alpha]:[204,0,255,alpha];
}
function rng(seed) {
  let n=(Number(seed)>>>0)||808;
  return () => ((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
}
function screen(x,y,w,h) { return [(x+0.5)*w,(1.17-0.92*y)*h]; }
function render(canvas,{seed=808,K=-1}={}) {
  const curvature=kappa(K);
  if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('Canvas required.');
  const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const width=Math.max(300,canvas.clientWidth||300),height=Math.max(320,canvas.clientHeight||320);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  const g=canvas.getContext('2d');
  if(!g)return false;
  const w=canvas.width,h=canvas.height,random=rng(seed);
  canvas.dataset.geometry='hyperbolic-twin-geodesics';
  canvas.dataset.curvature=String(K);
  g.globalAlpha=1;g.shadowBlur=0;g.fillStyle=COLORS.void;g.fillRect(0,0,w,h);

  for(let stream=0;stream<2;stream++) {
    const radius=RADII[stream],color=stream===0?COLORS.bio:COLORS.ultraviolet;
    /* Nested radius offsets are a tubular visual neighborhood of each
       geodesic; the main geodesic is the layer with offset zero. */
    for(let layer=-9;layer<=9;layer++) {
      const r=radius+layer*0.0037;
      g.beginPath();
      for(let step=0;step<=125;step++) {
        const x=-0.59+step*(1.18/125),y=geodesicAtX(r,x).y;
        const p=screen(x,y,w,h);
        if(!step)g.moveTo(p[0],p[1]);else g.lineTo(p[0],p[1]);
      }
      g.globalAlpha=layer===0?0.95:0.09+(1-Math.abs(layer)/10)*0.24;
      g.strokeStyle=color;g.lineWidth=(layer===0?1.25:0.4+random()*0.55)*dpr;
      g.shadowColor=color;g.shadowBlur=(layer===0?14:6)*dpr;g.stroke();
    }
    g.shadowBlur=0;
    /* Identical hyperbolic arclength increments parameterize the glyphs.
       K changes arclength spacing, not the geodesic's intrinsic definition. */
    const boundary=0.55;
    const maxS=Math.atanh(boundary/radius)/curvature;
    for(let j=0;j<94;j++) {
      const s=-maxS+(2*maxS*(j+0.3+random()*0.4)/94);
      const point=geodesicPoint(K,radius+(random()-0.5)*0.050,s);
      const xy=screen(point.x,point.y,w,h);
      const tilt=Math.atan2(0.92*h*point.x/(Math.max(1e-5,point.y)*w),1);
      g.save();g.translate(xy[0],xy[1]);g.rotate(tilt);
      g.globalAlpha=0.5+random()*0.48;g.fillStyle=color;
      g.shadowColor=color;g.shadowBlur=(4+random()*7)*dpr;
      g.font=(7+random()*10)*dpr+'px ui-monospace,monospace';
      g.textAlign='center';g.textBaseline='middle';
      g.fillText(GLYPHS[Math.floor(random()*GLYPHS.length)],0,0);
      g.restore();
    }
    for(let j=0;j<160;j++) {
      const x=(random()-0.5)*1.18;
      const r=radius+(random()-0.5)*0.1;
      const xy=screen(x,geodesicAtX(r,x).y,w,h);
      g.globalAlpha=0.17+random()*0.65;g.fillStyle=color;
      const size=(0.4+random()*1.15)*dpr;
      g.fillRect(xy[0],xy[1],size,size);
    }
  }
  g.globalAlpha=1;g.shadowBlur=0;
  return true;
}
window.GENESIS_CURVATURE=Object.freeze({
  palette:COLORS,radii:RADII,kappa,metricFactor,geodesicPoint,geodesicAtX,currentsAtX,remapRGB,render
});
})();
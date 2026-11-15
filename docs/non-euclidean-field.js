/* GENESIS FORWARD FIELD: two distinct luminous currents advancing together.
   Non Euclidean model: spherical stereographic metric
       ds² = 4(dx² + dy²) / (1 + K(x² + y²))² , K > 0.
   Its Gaussian curvature is K. Each current is an oriented trajectory
   on this surface; do not call the trajectories great circle geodesics.
   Direction is an independent condition: dx/dt > 0 everywhere.
   No triangles, closed or returning streams, or physical quantum claims.
   The original artworks and input RGB pixel data are never modified. */
(() => {
'use strict';
const COLORS=Object.freeze({void:'#000000',bio:'#19FF33',ultraviolet:'#CC00FF'});
const GLYPHS=Array.from('0123456789∞λπΣ∴⌑∅∿');
function validK(K) {
  if(!Number.isFinite(K)||!(K>0))throw new RangeError('K must be finite and greater than zero.');
  return K;
}
/* Stereographic sphere: conformal metric, constant Gaussian curvature K. */
function metricFactor(K,x,y) {
  validK(K);
  if(!Number.isFinite(x)||!Number.isFinite(y))throw new RangeError('Coordinates must be finite.');
  return 4/Math.pow(1+K*(x*x+y*y),2);
}
function streamPoint(K,stream,t) {
  validK(K);
  if((stream!==0&&stream!==1)||!Number.isFinite(t)||t<0||t>1)throw new RangeError('Invalid stream or forward position.');
  const x=2*t-1;
  const coupling=K/(1+K);
  const gap=0.16+0.16*coupling+0.41*Math.pow(Math.abs(x),1.7);
  const drift=0.16*coupling*Math.tanh(2.4*x)+0.04*x*(1-x*x);
  return {x,y:drift+(stream===0?-gap/2:gap/2)};
}
function currentsAtX(x,K=1) {
  if(!Number.isFinite(x)||x< -1||x>1)throw new RangeError('x outside the forward domain.');
  const t=(x+1)/2,lower=streamPoint(K,0,t),upper=streamPoint(K,1,t);
  return {lower,upper,gap:upper.y-lower.y};
}
function remapRGB(red,green,blue,alpha=255) {
  const luminance=(0.2126*red+0.7152*green+0.0722*blue)/255;
  return luminance<1/3?[0,0,0,alpha]:luminance<2/3?[25,255,51,alpha]:[204,0,255,alpha];
}
function rng(seed) {
  let n=(Number(seed)>>>0)||808;
  return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
}
/* Leave both endpoints beyond the viewport so the field flows outwards. */
function screen(p,w,h) {return [(-0.08+1.16*(p.x+1)/2)*w,(0.5-0.56*p.y)*h];}
function render(canvas,{seed=808,K=1}={}) {
  validK(K);
  if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('Canvas required.');
  const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const width=Math.max(300,canvas.clientWidth||300),height=Math.max(320,canvas.clientHeight||320);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  const g=canvas.getContext('2d');if(!g)return false;
  const w=canvas.width,h=canvas.height,random=rng(seed);
  canvas.dataset.geometry='forward-spherical-twin-streams';
  canvas.dataset.curvature=String(K);
  canvas.dataset.direction='forward-only';
  g.globalAlpha=1;g.shadowBlur=0;g.fillStyle=COLORS.void;g.fillRect(0,0,w,h);

  for(let stream=0;stream<2;stream++) {
    const color=stream===0?COLORS.bio:COLORS.ultraviolet;
    for(let layer=-9;layer<=9;layer++) {
      g.beginPath();
      for(let i=0;i<=144;i++) {
        const p=streamPoint(K,stream,i/144);
        const xy=screen({x:p.x,y:p.y+layer*0.003},w,h);
        if(i===0)g.moveTo(...xy);else g.lineTo(...xy);
      }
      g.globalAlpha=layer===0?0.98:0.08+0.22*(1-Math.abs(layer)/10);
      g.strokeStyle=color;
      g.lineWidth=(layer===0?1.4:0.4+random()*0.5)*dpr;
      g.shadowColor=color;g.shadowBlur=(layer===0?15:6)*dpr;g.stroke();
    }
    g.shadowBlur=0;
    for(let j=0;j<125;j++) {
      /* Glyph positions advance with increasing t, never returning. */
      const t=(j+0.15+random()*0.7)/125;
      const a=streamPoint(K,stream,t);
      const b=streamPoint(K,stream,Math.min(1,t+0.001));
      const ap=screen(a,w,h),bp=screen(b,w,h);
      const tilt=Math.atan2(bp[1]-ap[1],bp[0]-ap[0]);
      g.save();g.translate(...ap);g.rotate(tilt);
      g.globalAlpha=0.40+random()*0.6;
      g.fillStyle=color;g.shadowColor=color;g.shadowBlur=(3+random()*7)*dpr;
      g.font=(7+random()*10)*dpr+'px ui-monospace,monospace';
      g.textAlign='center';g.textBaseline='middle';
      g.fillText(GLYPHS[Math.floor(random()*GLYPHS.length)],0,0);
      g.restore();
    }
    for(let i=0;i<170;i++){
      const t=random(),p=streamPoint(K,stream,t);
      const xy=screen({x:p.x,y:p.y+(random()-0.5)*0.090},w,h);
      g.globalAlpha=0.16+random()*0.65;g.fillStyle=color;
      const size=(0.3+random()*1.1)*dpr;
      g.fillRect(xy[0],xy[1],size,size);
    }
  }
  g.globalAlpha=1;g.shadowBlur=0;
  return true;
}
window.GENESIS_CURVATURE=Object.freeze({
  palette:COLORS,validK,metricFactor,streamPoint,currentsAtX,remapRGB,render
});
})();
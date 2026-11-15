/* GENESIS non Euclidean forward field.
   Two distinct currents move forward with x = t.
   Curvature model uses a spherical stereographic metric:
   ds squared = 4 times (dx squared plus dy squared)
   divided by (1 plus K times (x squared plus y squared)) squared.
   K is greater than zero. Paths are trajectories on this curved surface.
   These are generative visual paths and not claims about quantum effects.
   Artwork originals and stored pixel values are never altered.
*/
(() => {
'use strict';
const COLORS=Object.freeze({
  void:'#000000',
  bio:'#19FF33',
  ultraviolet:'#CC00FF'
});
const GLYPHS=Array.from('0123456789∞λπΣ∴⌑∅∿');

function validK(K) {
  if(!Number.isFinite(K)||!(K>0)){
    throw new RangeError('K must be a finite positive number.');
  }
  return K;
}

function metricFactor(K,x,y) {
  validK(K);
  if(!Number.isFinite(x)||!Number.isFinite(y)){
    throw new RangeError('Coordinates must be finite.');
  }
  return 4/Math.pow(1+K*(x*x+y*y),2);
}

function streamPoint(K,stream,t) {
  validK(K);
  if((stream!==0&&stream!==1)||!Number.isFinite(t)||t<0||t>1){
    throw new RangeError('Invalid stream or forward position.');
  }
  const x=t;
  const coupling=K/(1+K);
  const base=0.26+0.07*coupling*Math.sin(2*Math.PI*t);
  const gap=0.12+0.13*coupling+0.32*Math.pow(Math.cos(Math.PI*t),2);
  return {x,y:base+(stream===0?0:gap)};
}

function currentsAtX(x,K=1) {
  if(!Number.isFinite(x)||x<0||x>1){
    throw new RangeError('Position outside the forward domain.');
  }
  const lower=streamPoint(K,0,x);
  const upper=streamPoint(K,1,x);
  const gap=0.12+0.13*K/(1+K)+0.32*Math.pow(Math.cos(Math.PI*x),2);
  return {lower,upper,gap};
}

function remapRGB(red,green,blue,alpha=255) {
  const luminance=(0.2126*red+0.7152*green+0.0722*blue)/255;
  if(luminance<1/3)return [0,0,0,alpha];
  if(luminance<2/3)return [25,255,51,alpha];
  return [204,0,255,alpha];
}

function rng(seed) {
  let value=(Number(seed)>>>0)||808;
  return () => {
    value=(Math.imul(value,1664525)+1013904223)>>>0;
    return value/4294967296;
  };
}

function screen(point,width,height) {
  return [point.x*width,(0.14+point.y*0.79)*height];
}

function render(canvas,{seed=808,K=1}={}) {
  validK(K);
  if(!canvas||typeof canvas.getContext!=='function'){
    throw new TypeError('Canvas required.');
  }
  const ratio=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const width=Math.max(300,canvas.clientWidth||300);
  const height=Math.max(320,canvas.clientHeight||320);
  canvas.width=Math.round(width*ratio);
  canvas.height=Math.round(height*ratio);
  const graphic=canvas.getContext('2d');
  if(!graphic)return false;

  const w=canvas.width;
  const h=canvas.height;
  const random=rng(seed);
  canvas.dataset.geometry='forwardCurvedTwinStreams';
  canvas.dataset.direction='forwardOnly';
  canvas.dataset.curvature=String(K);
  graphic.globalAlpha=1;
  graphic.shadowBlur=0;
  graphic.fillStyle=COLORS.void;
  graphic.fillRect(0,0,w,h);

  for(let stream=0;stream<2;stream++){
    const color=stream===0?COLORS.bio:COLORS.ultraviolet;

    for(let layer=0;layer<19;layer++){
      graphic.beginPath();
      const offset=0.018*Math.cos(Math.PI*layer/9);
      for(let step=0;step<=175;step++){
        const point=streamPoint(K,stream,step/175);
        const pos=screen({x:point.x,y:point.y+offset},w,h);
        if(step===0)graphic.moveTo(...pos);
        else graphic.lineTo(...pos);
      }
      graphic.globalAlpha=layer===9?0.94:0.10+0.24*Math.sin(Math.PI*layer/19);
      graphic.strokeStyle=color;
      graphic.lineWidth=(layer===9?1.4:0.3+random()*0.6)*ratio;
      graphic.shadowColor=color;
      graphic.shadowBlur=(layer===9?16:5)*ratio;
      graphic.stroke();
    }
    graphic.shadowBlur=0;

    for(let i=0;i<145;i++){
      const t=(i+0.2+random()*0.5)/145;
      const pos=screen(streamPoint(K,stream,t),w,h);
      graphic.save();
      graphic.translate(...pos);
      graphic.globalAlpha=0.35+0.64*random();
      graphic.fillStyle=color;
      graphic.shadowColor=color;
      graphic.shadowBlur=(3+random()*9)*ratio;
      graphic.font=(8+random()*10)*ratio+'px monospace';
      graphic.textAlign='center';
      graphic.textBaseline='middle';
      graphic.fillText(GLYPHS[Math.floor(random()*GLYPHS.length)],0,0);
      graphic.restore();
    }

    for(let i=0;i<220;i++){
      const t=random();
      const point=streamPoint(K,stream,t);
      const offset=0.041*Math.cos(Math.PI*random());
      const pos=screen({x:point.x,y:point.y+offset},w,h);
      graphic.globalAlpha=0.12+0.7*random();
      graphic.fillStyle=color;
      const size=(0.4+random()*1.2)*ratio;
      graphic.fillRect(pos[0],pos[1],size,size);
    }
  }
  graphic.globalAlpha=1;
  graphic.shadowBlur=0;
  return true;
}

window.GENESIS_CURVATURE=Object.freeze({
  palette:COLORS,
  validK,
  metricFactor,
  streamPoint,
  currentsAtX,
  remapRGB,
  render
});
})();
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
const SPECTRUM=Object.freeze({
  red:'#FF3348',
  orange:'#FF832B',
  amber:'#FFB632',
  gold:'#FFD842',
  yellow:'#FFFF45',
  chartreuse:'#A9FF33',
  green:'#19FF33',
  jade:'#34FF91',
  turquoise:'#15FFD1',
  cyan:'#00F6FF',
  azure:'#2AB7FF',
  blue:'#1676FF',
  indigo:'#5B4FFF',
  violet:'#CC00FF',
  magenta:'#FF24DB',
  rose:'#FF54A6'
});
const GLYPHS=Array.from('0123456789∞λπΣ∴⌑∅∿');
const P3='display'+String.fromCharCode(45)+'p3';

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
  const wings=Math.pow(Math.cos(Math.PI*t),2);
  const tilt=0.16*(t+0.5*Math.cos(Math.PI));
  const upper=0.42+tilt+0.08*Math.cos(Math.PI)*wings+
    0.03*coupling*Math.sin(2*Math.PI*t);
  const gap=0.15+(0.14+0.04*coupling)*wings;
  return {x,y:upper+(stream===0?0:gap)};
}

function currentsAtX(x,K=1) {
  if(!Number.isFinite(x)||x<0||x>1){
    throw new RangeError('Position outside the forward domain.');
  }
  const lower=streamPoint(K,0,x);
  const upper=streamPoint(K,1,x);
  const gap=0.15+(0.14+0.04*K/(1+K))*Math.pow(Math.cos(Math.PI*x),2);
  return {lower,upper,gap};
}

function spreadAt(t) {
  if(!Number.isFinite(t)||t<0||t>1){
    throw new RangeError('Invalid spread position.');
  }
  return 0.022+0.110*Math.pow(Math.cos(Math.PI*t),2);
}

function remapRGB(red,green,blue,alpha=255) {
  const byte=value=>Number.isFinite(value)?Math.min(255,Math.max(0,Math.round(value))):0;
  return [byte(red),byte(green),byte(blue),byte(alpha)];
}

function spectrumHue(t,phase=0) {
  if(!Number.isFinite(t)||t<0||t>1||!Number.isFinite(phase)){
    throw new RangeError('Invalid spectrum position.');
  }
  return Math.round(Math.max(0,Math.min(330,
    315*t+15*phase*Math.sin(2*Math.PI*t))));
}

function spectralColor(t,phase=0) {
  return 'hsl('+spectrumHue(t,phase)+', 100%, 60%)';
}

function spectralP3Color(t,phase=0) {
  const sector=spectrumHue(t,phase)/60;
  const ramp=1+Math.cos(Math.PI)*Math.abs(sector%2+Math.cos(Math.PI));
  let red=0,green=0,blue=0;
  if(sector<1){red=1;green=ramp;}
  else if(sector<2){red=ramp;green=1;}
  else if(sector<3){green=1;blue=ramp;}
  else if(sector<4){green=ramp;blue=1;}
  else if(sector<5){red=ramp;blue=1;}
  else {red=1;blue=ramp;}
  const channel=value=>(0.08+0.92*value).toFixed(4);
  return 'color('+P3+' '+channel(red)+' '+channel(green)+' '+channel(blue)+')';
}

function spectralGradient(graphic,width,phase=0,wide=false) {
  const gradient=graphic.createLinearGradient(0,0,width,0);
  for(let step=0;step<=32;step++){
    const t=step/32;
    gradient.addColorStop(t,wide?spectralP3Color(t,phase):spectralColor(t,phase));
  }
  return gradient;
}

function rng(seed) {
  let value=(Number(seed)>>>0)||808;
  return () => {
    value=(Math.imul(value,1664525)+1013904223)>>>0;
    return value/4294967296;
  };
}

function screen(point,width,height) {
  return [point.x*width,(0.02+point.y*0.96)*height];
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
  const graphic=canvas.getContext('2d',{colorSpace:P3});
  if(!graphic)return false;
  const space=typeof graphic.getContextAttributes==='function'
    ?graphic.getContextAttributes().colorSpace:'srgb';
  const wide=space===P3;
  canvas.dataset.colorSpace=wide?P3:'srgb';

  const w=canvas.width;
  const h=canvas.height;
  const random=rng(seed);
  canvas.dataset.geometry='forwardCurvedTwinStreams';
  canvas.dataset.direction='forwardOnly';
  canvas.dataset.curvature=String(K);
  canvas.dataset.spectrum='fullVisible';
  canvas.dataset.streams='2';
  canvas.dataset.crossbars='none';
  graphic.globalAlpha=1;
  graphic.shadowBlur=0;
  graphic.fillStyle=COLORS.void;
  graphic.fillRect(0,0,w,h);

  for(let stream=0;stream<2;stream++){
    for(let layer=0;layer<29;layer++){
      graphic.beginPath();
      const phase=Math.cos(Math.PI*layer/14);
      for(let step=0;step<=220;step++){
        const t=step/220;
        const point=streamPoint(K,stream,t);
        const offset=spreadAt(t)*phase;
        const pos=screen({x:point.x,y:point.y+offset},w,h);
        if(step===0)graphic.moveTo(...pos);
        else graphic.lineTo(...pos);
      }
      const gradient=spectralGradient(graphic,w,phase,wide);
      graphic.strokeStyle=gradient;
      graphic.globalAlpha=layer===14?0.20:0.09;
      graphic.lineWidth=(layer===14?5.5:2.2+random()*1.2)*ratio;
      graphic.stroke();
      graphic.globalAlpha=layer===14?0.98:0.24+0.24*Math.sin(Math.PI*(layer+1)/30);
      graphic.lineWidth=(layer===14?1.6:0.4+random()*0.65)*ratio;
      graphic.stroke();
    }

    for(let i=0;i<270;i++){
      const t=(i+0.2+random()*0.5)/270;
      const point=streamPoint(K,stream,t);
      const offset=spreadAt(t)*Math.cos(Math.PI*random());
      const pos=screen({x:point.x,y:point.y+offset},w,h);
      const phase=Math.cos(Math.PI*random());
      const color=wide?spectralP3Color(t,phase):spectralColor(t,phase);
      graphic.save();
      graphic.translate(...pos);
      graphic.globalAlpha=0.45+0.54*random();
      graphic.fillStyle=color;
      graphic.shadowColor=color;
      graphic.shadowBlur=(2+random()*6)*ratio;
      graphic.font=(7+random()*9)*ratio+'px monospace';
      graphic.textAlign='center';
      graphic.textBaseline='middle';
      graphic.fillText(GLYPHS[Math.floor(random()*GLYPHS.length)],0,0);
      graphic.restore();
    }

    graphic.shadowBlur=0;
    for(let i=0;i<420;i++){
      const t=random();
      const point=streamPoint(K,stream,t);
      const offset=spreadAt(t)*Math.cos(Math.PI*random());
      const pos=screen({x:point.x,y:point.y+offset},w,h);
      graphic.globalAlpha=0.16+0.74*random();
      const phase=Math.cos(Math.PI*random());
      graphic.fillStyle=wide?spectralP3Color(t,phase):spectralColor(t,phase);
      const size=(0.4+random()*1.3)*ratio;
      graphic.fillRect(pos[0],pos[1],size,size);
    }
  }
  graphic.globalAlpha=1;
  graphic.shadowBlur=0;
  return true;
}

window.GENESIS_CURVATURE=Object.freeze({
  palette:COLORS,
  spectrum:SPECTRUM,
  spectralColor,
  spectralP3Color,
  wideSpace:P3,
  validK,
  metricFactor,
  streamPoint,
  currentsAtX,
  spreadAt,
  remapRGB,
  render
});
})();
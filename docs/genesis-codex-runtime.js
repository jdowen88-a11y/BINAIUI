/* ETH Dragon geometry runtime adapter. The authored language lives in genesis.dragon; genesis.codex is a retained alias.
   JavaScript here is an isolated host/runtime, not a GENESIS source requirement.
   Geometry: Fermi coordinates in a complete hyperbolic plane.
   ds squared = du squared + cosh squared(sqrt(k) u) dv squared.
   Gaussian curvature = negative k, with k strictly positive.
*/
(function (scope) {
  'use strict';
  const DIVIDER = ')(';
  const COLORS = ['#CC00FF','#8B5CFF','#FF29D4','#246BFF','#00E8FF','#FFD75A','#19FF33'];
  const GLYPHS = ['0','1','8','∞',')(','}{','][','><','\\/','/\\','»«','DRAGON_Q_LEFT','DRAGON_BANG_LEFT','🌀','💜','⚡','🔺','🔻','🐉','ψ','λ','Σ'];
  const KEYS = ['IDENTITY','GEOMETRY','CURVATURE','INVERSE','TRIANGLES','DNA_RUNGS','TRIANGLE_GRID','FLOW','STREAMS'];
  function parse(source) {
    if (typeof source !== 'string') throw new TypeError('A GENESIS source string is required.');
    if (!scope.ETH_DRAGON) throw new Error('ETH Dragon interpreter must be loaded before the visual runtime.');
    const ast=scope.ETH_DRAGON.parseSource(source);
    const result=Object.assign(Object.create(null),ast.fields);
    for (const key of KEYS) if (!result[key]) throw new SyntaxError('Missing GENESIS field: ' + key);
    if (result.INVERSE !== DIVIDER) throw new SyntaxError('Inverse operator must remain )( exactly.');
    if (result.GEOMETRY !== 'HYPERBOLIC FERMI') throw new SyntaxError('Unrecognized curved space.');
    if (result.DNA_RUNGS !== 'NONE' || result.TRIANGLE_GRID !== 'NONE') throw new SyntaxError('Rigid geometry is forbidden.');
    if (result.TRIANGLES !== '🔺 🔻') throw new SyntaxError('Triangles must be represented as emoji.');
    if (result.STREAMS !== '2') throw new SyntaxError('The twin current prototype requires two streams.');
    const curvature = Number(result.CURVATURE);
    if (!Number.isFinite(curvature) || curvature <= 0) throw new RangeError('Positive curvature magnitude required.');
    return Object.freeze({...result,CURVATURE:curvature});
  }
  function metric(k,u) {
    if (!Number.isFinite(k) || k <= 0 || !Number.isFinite(u)) throw new RangeError('Finite k > 0 and coordinate required.');
    const a = Math.cosh(Math.sqrt(k) * u);
    return {gUU:1,gVV:a*a,gaussianCurvature:-k};
  }
  function derivative(k,s) {
    const q = Math.sqrt(k), w=q*s.u, c=Math.cosh(w), sh=Math.sinh(w);
    return {u:s.du,v:s.dv,du:q*sh*c*s.dv*s.dv,dv:-2*q*Math.tanh(w)*s.du*s.dv};
  }
  function shift(s,d,h) {
    return {u:s.u+h*d.u,v:s.v+h*d.v,du:s.du+h*d.du,dv:s.dv+h*d.dv};
  }
  function advance(k,s,h) {
    const a=derivative(k,s),b=derivative(k,shift(s,a,h/2)),
      c=derivative(k,shift(s,b,h/2)),d=derivative(k,shift(s,c,h));
    return {
      u:s.u+h*(a.u+2*b.u+2*c.u+d.u)/6,
      v:s.v+h*(a.v+2*b.v+2*c.v+d.v)/6,
      du:s.du+h*(a.du+2*b.du+2*c.du+d.du)/6,
      dv:s.dv+h*(a.dv+2*b.dv+2*c.dv+d.dv)/6
    };
  }
  function random(seed) {
    let s=(Number(seed)>>>0)||808;
    return function () {s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  }
  function trajectories(k=1,seed=808,filaments=84) {
    metric(k,0);
    if (!Number.isInteger(filaments) || filaments < 2 || filaments > 240) throw new RangeError('Invalid filament count.');
    const r=random(seed),all=[];
    for (let i=0;i<filaments;i++) {
      const group=i%2;
      const u=(group===0?-0.30:0.30)+(r()-0.5)*0.56;
      const v=-2.35-r()*0.22;
      const du=(r()-0.5)*0.14;
      const dv=(0.82+0.21*r())/Math.cosh(Math.sqrt(k)*u);
      let s={u,v,du,dv};
      const points=[];
      for (let j=0;j<315;j++) {
        if (![s.u,s.v,s.du,s.dv].every(Number.isFinite) || Math.abs(s.u)>4.2 || Math.abs(s.v)>5) break;
        points.push({u:s.u,v:s.v});
        if (s.v>2.40) break;
        s=advance(k,s,0.018);
      }
      if (points.length>1) all.push({group,color:COLORS[i%COLORS.length],points});
    }
    return all;
  }
  function render(canvas,{source,seed=808,K}={}) {
    const config=parse(source);
    const k=K===undefined?config.CURVATURE:Number(K);
    metric(k,0);
    if (!canvas || typeof canvas.getContext !== 'function') throw new TypeError('Canvas required.');
    const ratio=Math.min(2,Math.max(1,scope.devicePixelRatio||1));
    const w=Math.max(320,Math.round((canvas.clientWidth||960)*ratio));
    const h=Math.max(240,Math.round((canvas.clientHeight||540)*ratio));
    canvas.width=w;canvas.height=h;
    const context=canvas.getContext('2d');
    if (!context) return false;
    context.fillStyle='#03000B';
    context.fillRect(0,0,w,h);
    const paths=trajectories(k,seed,84);
    const point=p=>[(p.v+2.2)/4.4*w,(1.42-p.u)/2.84*h];
    for (const [i,line] of paths.entries()) {
      const coordinates=line.points.map(point);
      const paint=()=>{
        context.beginPath();
        coordinates.forEach((p,j)=>{if (!j) context.moveTo(p[0],p[1]);else context.lineTo(p[0],p[1]);});
      };
      context.strokeStyle=line.color;context.globalAlpha=0.17;
      context.lineWidth=4.3*ratio;context.shadowColor=line.color;context.shadowBlur=12*ratio;
      paint();context.stroke();
      context.shadowBlur=0;context.globalAlpha=0.73;context.lineWidth=0.85*ratio;
      paint();context.stroke();
      const token=GLYPHS[(i+Math.floor(seed))%GLYPHS.length];
      context.fillStyle=line.color;context.font=(12+2*(i%3))*ratio+'px sans-serif';
      context.globalAlpha=0.78;
      for (let j=11;j<coordinates.length;j+=47) {
        const p=coordinates[j];
        if (p[0]>0 && p[0]<w && p[1]>0 && p[1]<h) {
          if(token==='DRAGON_Q_LEFT'||token==='DRAGON_BANG_LEFT'){
            scope.ETH_DRAGON.paintReversedPunctuation(context,token==='DRAGON_Q_LEFT'?'QUESTION':'EXCLAMATION',p[0],p[1],11*ratio,line.color);
          } else {
            context.fillText(token,p[0],p[1]);
          }
        }
      }
    }
    context.globalAlpha=1;
    canvas.dataset.geometry='hyperbolicFermiGeodesics';
    canvas.dataset.gaussianCurvature=String(-k);
    canvas.dataset.curvature=String(k);
    canvas.dataset.crossbars='none';
    canvas.dataset.triangles='emojiOnly';
    canvas.dataset.inverse=DIVIDER;
    canvas.dataset.questionFacing='left';
    canvas.dataset.exclamationFacing='left';
    canvas.dataset.punctuationRendering='mirror-vector';
    canvas.dataset.direction='forwardOnly';
    return true;
  }
  const api=Object.freeze({parse,metric,advance,trajectories,render,symbolicInverse:DIVIDER,glyphs:GLYPHS});
  scope.BINAIUI_CODEX=api;
  if (typeof module!=='undefined' && module.exports) module.exports=api;
})(typeof window==='undefined'?globalThis:window);

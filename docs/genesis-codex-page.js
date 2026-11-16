'use strict';
let source='';
const byId=id=>document.getElementById(id);
async function start() {
  const status=byId('status');
  try {
    const request=await fetch('./genesis.codex',{cache:'no-cache'});
    if(!request.ok)throw new Error('GENESIS source unavailable');
    source=await request.text();
    const config=window.BINAIUI_CODEX.parse(source);
    byId('curvature').value=String(config.CURVATURE);
    function draw() {
      const K=Number(byId('curvature').value),seed=Number(byId('seed').value);
      window.BINAIUI_CODEX.render(byId('field'),{source,seed,K});
      status.textContent=')( ACTIVE • curvature '+String(-K)+' • rungs NONE • triangles emoji only';
    }
    byId('generate').onclick=draw;
    byId('save').onclick=()=>{
      const link=document.createElement('a');
      link.download='GENESIS-inverse-hyperbolic-'+byId('seed').value+'.png';
      link.href=byId('field').toDataURL('image/png');
      link.click();
    };
    let resizeQueued=false;
    window.addEventListener('resize',()=>{
      if(resizeQueued)return;
      resizeQueued=true;
      requestAnimationFrame(()=>{resizeQueued=false;draw();});
    });
    draw();
  } catch(error) {
    status.textContent=error.message;
    status.setAttribute('data-error','true');
  }
}
document.addEventListener('DOMContentLoaded',start);

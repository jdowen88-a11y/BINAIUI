'use strict';
let source='';
const byId=id=>document.getElementById(id);
async function start() {
  const status=byId('status');
  try {
    const request=await fetch('./genesis.dragon',{cache:'no-cache'});
    if(!request.ok)throw new Error('GENESIS source unavailable');
    source=await request.text();
    byId('dragon-editor').value=source;
    const compiled=window.ETH_DRAGON.compile(source);
    if(window.ETH_DRAGON.emit(compiled)!==source)throw new Error('ETH Dragon source failed byte preservation');
    const config=window.BINAIUI_CODEX.parse(source);
    function paintPunctuationProof(){
      for(const [id,key] of [['question-proof','QUESTION'],['exclamation-proof','EXCLAMATION']]){
        const canvas=byId(id);
        if(!canvas)continue;
        const ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        window.ETH_DRAGON.paintReversedPunctuation(ctx,key,canvas.width/2,canvas.height/2,54,key==='QUESTION'?'#00E8FF':'#FFD75A');
        canvas.dataset.facing='left';
        canvas.dataset.transform='mirror-horizontal';
      }
    }
    paintPunctuationProof();
    byId('curvature').value=String(config.CURVATURE);
    function draw() {
      const K=Number(byId('curvature').value),seed=Number(byId('seed').value);
      window.BINAIUI_CODEX.render(byId('field'),{source,seed,K});
      status.removeAttribute('data-error');
      status.textContent='ETH DRAGON ACCEPTED • )( { ][ >< \\/ /\\ »« • DRAGON_Q_LEFT + DRAGON_BANG_LEFT • OPEN VECTOR PATHS, NO FRAMES • curvature '+String(-K)+' • rungs NONE • triangles emoji only';
    }
    byId('compile-dragon').onclick=()=>{
      const proposed=byId('dragon-editor').value;
      try{
        const built=window.ETH_DRAGON.compile(proposed);
        if(window.ETH_DRAGON.emit(built)!==proposed)throw new Error('Source changed during compilation');
        const next=window.BINAIUI_CODEX.parse(proposed);
        source=proposed;
        byId('curvature').value=String(next.CURVATURE);
        draw();
      }catch(error){
        status.setAttribute('data-error','true');
        status.textContent='ETH DRAGON REJECTED • '+error.message;
      }
    };
    byId('save-dragon').onclick=()=>{
      const bytes=byId('dragon-editor').value;
      const file=new Blob([bytes],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(file);
      const link=document.createElement('a');
      link.download='genesis.edited.dragon';
      link.href=url;
      link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
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

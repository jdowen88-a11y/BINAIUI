/* ETH DRAGON / GENESIS language frontend.
   The source file is ETH Dragon text, not JavaScript or Python.
   Host-language code here only interprets the author's syntax.
   An exact byte-preserving parser is intentional: no legacy symbol replacement
   is applied to source strings, comments, filenames, or archived originals.
*/
(function (root) {
  'use strict';
  const operators=Object.freeze([
    Object.freeze({key:'ROUND',symbol:')(',legacy:'()',meaning:'inverse entry'}),
    Object.freeze({key:'CURLY',symbol:'}{',legacy:'{}',meaning:'outward opening'}),
    Object.freeze({key:'SQUARE',symbol:'][',legacy:'[]',meaning:'paired reciprocal gate'}),
    Object.freeze({key:'ANGLE',symbol:'><',legacy:'<>',meaning:'convergence crossing'}),
    Object.freeze({key:'DOWN',symbol:'\\/',legacy:null,meaning:'divergent current'}),
    Object.freeze({key:'UP',symbol:'/\\',legacy:null,meaning:'convergent current'}),
    Object.freeze({key:'GUILLEMETS',symbol:'»«',legacy:'«»',meaning:'reflection crossing'}),
    Object.freeze({key:'QUESTION',symbol:'DRAGON_Q_LEFT',legacy:'?',orientation:'MIRROR_HORIZONTAL',facing:'LEFT',meaning:'reversed open query'}),
    Object.freeze({key:'EXCLAMATION',symbol:'DRAGON_BANG_LEFT',legacy:'!',orientation:'MIRROR_HORIZONTAL',facing:'LEFT',meaning:'reversed asymmetric exclamation'})
  ]);
  const byKey=Object.freeze(Object.fromEntries(operators.map(x=>[x.key,x.symbol])));
  const recognized=operators.map(x=>x.symbol).sort((a,b)=>b.length-a.length);
  // ASCII glyph commands avoid missing-font boxes. Their shape exists as a
  // standalone vector stroke, never as platform-dependent glyph fallback.
  const GLYPH_RENDERING='UNFRAMED_VECTOR_STROKES';

  const legacy=[...operators.filter(x=>x.legacy).map(x=>x.legacy),'¿','¡','⸮','⹡'];
  function glyphTokens(value) {
    if (typeof value!=='string') throw new TypeError('ETH Dragon expression must be text.');
    const tokens=[];
    let index=0;
    while (index<value.length) {
      const op=recognized.find(x=>value.startsWith(x,index));
      if (op) {
        const detail=operators.find(x=>x.symbol===op);
        tokens.push({kind:'operator',name:detail.key,glyph:op,index});
        index+=op.length;
      } else {
        const cp=value.codePointAt(index);
        const glyph=String.fromCodePoint(cp);
        tokens.push({kind:/^\s$/u.test(glyph)?'space':'glyph',glyph,index});
        index+=glyph.length;
      }
    }
    return tokens;
  }
  function rejectLegacy(text,lineNumber) {
    for (const item of legacy) {
      if (text.includes(item)) {
        throw new SyntaxError('Noncanonical ETH Dragon token '+item+' on line '+lineNumber);
      }
    }
  }
  function parseSource(source) {
    if (typeof source!=='string') throw new TypeError('ETH Dragon source must be text.');
    const fields=Object.create(null),instructions=[];
    const lines=source.split(/\r\n|\n|\r/);
    lines.forEach((raw,index)=>{
      const trimmed=raw.trim();
      if (!trimmed||trimmed.startsWith('#')) return;
      rejectLegacy(trimmed,index+1);
      const divider=byKey.ROUND,at=trimmed.indexOf(divider);
      if (at<1)throw new SyntaxError('Expected canonical )( field delimiter at line '+(index+1));
      const key=trimmed.slice(0,at).trim(),expression=trimmed.slice(at+divider.length).trim();
      if (!/^[A-Z][A-Z_0-9]*$/.test(key))throw new SyntaxError('Invalid ETH Dragon field at line '+(index+1));
      if (!expression)throw new SyntaxError('Missing ETH Dragon expression at line '+(index+1));
      if(Object.prototype.hasOwnProperty.call(fields,key))throw new SyntaxError('Repeated ETH Dragon field '+key);
      fields[key]=expression;
      instructions.push(Object.freeze({line:index+1,key,expression,tokens:glyphTokens(expression)}));
    });
    for (const op of operators) {
      const declared=op.key==='DOWN'||op.key==='UP'?null:
        op.key==='ROUND'?'ROUND':op.key==='CURLY'?'CURLY':
        op.key==='SQUARE'?'SQUARE':op.key==='ANGLE'?'ANGLE':
        op.key==='GUILLEMETS'?'GUILLEMETS':
        op.key==='QUESTION'?'QUESTION':'EXCLAMATION';
      if (declared && fields[declared]!==op.symbol) {
        throw new SyntaxError('ETH Dragon declaration '+declared+' must equal '+op.symbol);
      }
    }
    for(const key of ['QUESTION','EXCLAMATION']){
      if(fields[key+'_SETUP']!=='MIRROR_HORIZONTAL' || fields[key+'_FACING']!=='LEFT'){
        throw new SyntaxError(key+' must have an explicit left-facing horizontal-mirror setup.');
      }
    }
    if (fields.DIAGONALS!==byKey.DOWN+' '+byKey.UP)throw new SyntaxError('Both diagonal currents must stay canonical.');
    if (fields.INVERSE!==byKey.ROUND)throw new SyntaxError('Inverse pair must remain )(.');
    if (fields.TRIANGLES!=='🔺 🔻')throw new SyntaxError('Triangle forms must be emoji.');
    if (fields.DNA_RUNGS!=='NONE'||fields.TRIANGLE_GRID!=='NONE')throw new SyntaxError('Rigid connecting structures are not ETH Dragon field geometry.');
    const original=String(source);
    return Object.freeze({source:original,fields:Object.freeze({...fields}),instructions:Object.freeze(instructions)});
  }
  function compile(source) {
    const ast=parseSource(source);
    return Object.freeze({
      language:'ETH_DRAGON',
      version:1,
      source:ast.source,
      geometry:ast.fields.GEOMETRY,
      inverse:byKey.ROUND,
      orientation:Object.freeze({
        QUESTION:Object.freeze({glyph:byKey.QUESTION,mirrorX:true,facing:'LEFT',setup:ast.fields.QUESTION_SETUP,rendering:'unframed-vector'}),
        EXCLAMATION:Object.freeze({glyph:byKey.EXCLAMATION,mirrorX:true,facing:'LEFT',setup:ast.fields.EXCLAMATION_SETUP,rendering:'unframed-vector'})
      }),
      operations:Object.freeze(ast.instructions.map(line=>Object.freeze({
        field:line.key,
        glyphStream:Object.freeze(line.tokens.map(x=>x.glyph)),
        opcodes:Object.freeze(line.tokens.filter(x=>x.kind==='operator').map(x=>x.name))
      })))
    });
  }
  function emit(program) {
    if (!program||typeof program.source!=='string')throw new TypeError('Compiler output required.');
    return program.source;
  }
  function interpret(source) {
    const compiled=compile(source);
    const flow=compiled.operations.find(x=>x.field==='DRAGON_SENTENCE');
    return Object.freeze({
      language:compiled.language,
      inverse:compiled.inverse,
      geometry:compiled.geometry,
      glyphStream:flow?flow.glyphStream.join(''):'',
      decodedOperators:flow?flow.opcodes:[],
      sourcePreserved:emit(compiled)===source
    });
  }

  function paintReversedPunctuation(ctx,key,x,y,size,color='#00E8FF') {
    // No fillRect, rect, box shadow, border or enclosing shape is drawn.
    // Only two open curved strokes and their punctuation dots.

    const index=operators.find(item=>item.key===key);
    if(!index || !['QUESTION','EXCLAMATION'].includes(key))throw new TypeError('Unknown reversible punctuation operator');
    if(!ctx || typeof ctx.save!=='function')throw new TypeError('Canvas context required');
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(-1,1);
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.lineWidth=Math.max(1.4,size*0.115);
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    if(key==='QUESTION') {
      // Conventional question-mark outline is mirrored horizontally in display.
      ctx.moveTo(-.36*size,-.25*size);
      ctx.bezierCurveTo(-.32*size,-.66*size,.50*size,-.70*size,.44*size,-.23*size);
      ctx.bezierCurveTo(.43*size,.07*size,.02*size,.13*size,.03*size,.32*size);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(.03*size,.58*size,.07*size,0,Math.PI*2);
    } else {
      // An asymmetric curved exclamation visibly changes when mirrored,
      // unlike the symmetric straight line in standard exclamation punctuation.
      ctx.moveTo(-.22*size,-.65*size);
      ctx.bezierCurveTo(.45*size,-.55*size,-.18*size,-.20*size,.25*size,.06*size);
      ctx.bezierCurveTo(.39*size,.16*size,.19*size,.28*size,.09*size,.34*size);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(.09*size,.59*size,.07*size,0,Math.PI*2);
    }
    ctx.fill();
    ctx.restore();
  }

  root.ETH_DRAGON=Object.freeze({operators,byKey,glyphTokens,parseSource,compile,emit,interpret,paintReversedPunctuation,glyphRendering:GLYPH_RENDERING});
  if (typeof module!=='undefined'&&module.exports)module.exports=root.ETH_DRAGON;
})(typeof window==='undefined'?globalThis:window);

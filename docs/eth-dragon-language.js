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
    Object.freeze({key:'QUESTION',symbol:'¿',legacy:'?',meaning:'open query'}),
    Object.freeze({key:'EXCLAMATION',symbol:'¡',legacy:'!',meaning:'initiation'})
  ]);
  const byKey=Object.freeze(Object.fromEntries(operators.map(x=>[x.key,x.symbol])));
  const recognized=operators.map(x=>x.symbol).sort((a,b)=>b.length-a.length);
  const legacy=operators.filter(x=>x.legacy).map(x=>x.legacy);
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
  root.ETH_DRAGON=Object.freeze({operators,byKey,glyphTokens,parseSource,compile,emit,interpret});
  if (typeof module!=='undefined'&&module.exports)module.exports=root.ETH_DRAGON;
})(typeof window==='undefined'?globalThis:window);

const { JSDOM } = require('jsdom');
const fs=require('fs'), path=require('path');
const T=path.join(__dirname,'..')+path.sep;
let fails=0; const A=(c,m)=>{ if(!c){console.error('FAIL:',m);fails++;} else console.log('ok:',m); };
const LIB=fs.readFileSync(T+'tutor-store.js','utf8'), NAV=fs.readFileSync(T+'tutor-nav.js','utf8');
function mount(f,opts){
  opts=opts||{};
  let h=fs.readFileSync(T+f,'utf8');
  h=h.split(h.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0]).join('<script>'+LIB+'<'+'/script>');
  const n=h.match(/<script src="[^"]*tutor-nav\.js"><\/script>/); if(n) h=h.split(n[0]).join('<script>'+NAV+'<'+'/script>');
  const errs=[], spoken=[];
  const d=new JSDOM(h,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+f,
    beforeParse(w){ w.alert=()=>{}; w.scrollTo=()=>{};
      w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='globalAlpha'?1:(()=>{})});
      if(!opts.noSpeech){
        const vs=[{name:'Samantha',lang:'en-US'}];
        w.speechSynthesis={getVoices:()=>vs,cancel:()=>{},speak:u=>spoken.push({text:u.text,rate:u.rate}),addEventListener:()=>{}};
        w.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;this.pitch=1;};
      } else w.speechSynthesis=undefined;
      w.addEventListener('error',e=>errs.push(e.message)); }});
  return {w:d.window,d:d.window.document,errs,spoken};
}
/* type a whole line char by char through the real input handler */
function typeLine(w,d,text){
  const box=d.getElementById('typeIn');
  for(const ch of text){ box.value+=ch; w.eval('onType()'); }
}
(async()=>{
console.log('--- curriculum ---');
{
  const {w,d,errs}=mount('typing.html');
  A(w.eval('CURRICULUM.length')===12,'12 lessons loaded');
  const modes=w.eval('JSON.stringify([...new Set(CURRICULUM.map(l=>l.mode))].sort())');
  A(modes==='["both","hear","see"]','all three modes present: '+modes);
  A(w.eval('CURRICULUM[0].mode')==='see','starts with copy-from-screen (fundamentals first)');
  A(w.eval('CURRICULUM[CURRICULUM.length-1].mode')==='hear','ends typing unseen, by ear');
  const bad=w.eval(`JSON.stringify(CURRICULUM.filter(l=>!l.id||!l.name||!l.lines.length||!l.blurb).map(l=>l.id))`);
  A(bad==='[]','every lesson well-formed — '+bad);
  A(w.eval('COMPANIONS.length')>=10,'companion characters defined: '+w.eval('COMPANIONS.length'));
  A(w.eval('CHEERS.length')>=8,'cheer phrases defined: '+w.eval('CHEERS.length'));
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

console.log('\n--- typing engine ---');
{
  const {w,d,errs,spoken}=mount('typing.html');
  d.getElementById('nameIn').value='Robin'; w.eval('login()');
  A(d.getElementById('login').style.display==='none','login works');
  A(d.querySelectorAll('.friend').length===10,'cheering companions rendered in both margins');

  w.eval('startLesson(0)');
  A(d.getElementById('s-type').classList.contains('on'),'typing stage opens');
  A(d.getElementById('promptBox').innerHTML.includes('class="ch'),'prompt renders per-character');
  A(d.querySelectorAll('#kbd .key.lit').length>0,'keyboard guide highlights the lesson keys');
  A(d.getElementById('audioRow').style.display==='none','no audio controls in copy-from-screen mode');

  // perfect first line
  const line0=w.eval('CURRICULUM[0].lines[0]');
  typeLine(w,d,line0);
  A(w.eval('L.results.length')===1,'line completes automatically at full length');
  A(w.eval('L.results[0].errors')===0,'perfect line has zero errors');
  A(w.eval('L.results[0].acc')===100,'accuracy 100%');
  A(d.getElementById('nextLineBtn').disabled===false,'next-line button enabled after completing');

  // deliberately wrong line
  w.eval('nextLine()');
  const line1=w.eval('CURRICULUM[0].lines[1]');
  const wrong = 'X' + line1.slice(1,-1) + 'X';
  typeLine(w,d,wrong);
  A(w.eval('L.results[1].errors')===2,'two wrong characters counted: '+w.eval('L.results[1].errors'));
  const acc1=w.eval('L.results[1].acc');
  A(acc1<100 && acc1>50,'accuracy reflects the errors: '+acc1+'%');

  // finish remaining lines perfectly and complete
  const nlines=w.eval('CURRICULUM[0].lines.length');
  for(let i=2;i<nlines;i++){ w.eval('nextLine()'); typeLine(w,d,w.eval(`CURRICULUM[0].lines[${i}]`)); }
  w.eval('nextLine()');
  A(d.getElementById('s-result').classList.contains('on'),'result screen shown after last line');

  const rec=w.TutorStore.app('robin','typing').history[0];
  A(rec.subject==='Typing'&&rec.app==='typing','subject metadata');
  A(typeof rec.wpm==='number'&&rec.wpm>=0,'wpm recorded: '+rec.wpm);
  A(rec.errors===2,'total errors recorded: '+rec.errors);
  A(rec.characters>0,'character count recorded: '+rec.characters);
  A(rec.answers.length===nlines,'per-line detail saved for all '+nlines+' lines');
  A('typed' in rec.answers[0] && 'target' in rec.answers[0],'each line stores what was typed vs the target');
  A(d.getElementById('rReview').innerHTML.includes('bad'),'error diff shown in review');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

console.log('\n--- accuracy gate & audio modes ---');
{
  const {w,d,spoken}=mount('typing.html');
  d.getElementById('nameIn').value='Robin'; w.eval('login()');

  // fail the gate: type everything wrong
  w.eval('startLesson(0)');
  const n=w.eval('CURRICULUM[0].lines.length');
  for(let i=0;i<n;i++){
    if(i>0) w.eval('nextLine()');
    const t=w.eval(`CURRICULUM[0].lines[${i}]`);
    typeLine(w,d,'z'.repeat(t.length));
  }
  w.eval('nextLine()');
  A(w.eval('S.done.length')===0,'failing the accuracy gate does not clear the stop');

  // audio lesson
  w.eval('startLesson(9)');   // t10, hear-only
  A(w.eval("CURRICULUM[9].mode")==='hear','lesson 10 is by-ear');
  A(d.getElementById('audioRow').style.display!=='none','audio controls shown');
  A(d.getElementById('promptBox').className.includes('hidden-prompt'),'text hidden in by-ear mode');
  A(spoken.length===0,'first line not auto-spoken (browser gesture rule)');
  w.eval('speakLine()');
  A(spoken.length===1 && spoken[0].text===w.eval('CURRICULUM[9].lines[0]'),'hear-it speaks the exact line');
  w.eval('speakLine(0.6)');
  A(spoken[1].rate===0.6,'slower playback uses reduced rate');
  w.eval('revealLine()');
  A(!d.getElementById('promptBox').className.includes('hidden-prompt'),'show-me reveals the text');
  A(w.eval('L.revealed')===true,'reveal is recorded so it shows up in the data');
}

console.log('\n--- no-speech fallback ---');
{
  const {w,d,errs}=mount('typing.html',{noSpeech:true});
  d.getElementById('nameIn').value='Sam'; w.eval('login()');
  A(d.getElementById('voiceWarn').style.display==='block','warns when no voices available');
  w.eval('startLesson(9)');
  w.eval('speakLine()');
  A(!d.getElementById('promptBox').className.includes('hidden-prompt'),'falls back to showing the line when audio is unavailable');
  A(errs.length===0,'no JS errors without speech ('+errs.join(';')+')');
}

console.log('\n--- sidebar ---');
{
  const {d}=mount('typing.html');
  const links=[...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href'));
  A(links.length===8,'sidebar lists 8 destinations');
  A(links.includes('geometry.html')&&links.includes('panda-math.html'),'links to geometry and math');
  const cur=d.querySelector('#tnav a.current');
  A(cur&&cur.textContent.includes('Wind Courier'),'typing app highlights itself');
}
console.log(fails?`\n${fails} FAILURE(S)`:'\nALL TYPING CHECKS PASSED');
process.exit(fails?1:0);
})();

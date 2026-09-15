const { JSDOM } = require('jsdom');
const fs=require('fs'), path=require('path');
const T=path.join(__dirname,'..')+path.sep;
let fails=0; const A=(c,m)=>{ if(!c){console.error('FAIL:',m);fails++;} else console.log('ok:',m); };
const LIB=fs.readFileSync(T+'tutor-store.js','utf8'), NAV=fs.readFileSync(T+'tutor-nav.js','utf8');
function mount(f){
  let h=fs.readFileSync(T+f,'utf8');
  h=h.split(h.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0]).join('<script>'+LIB+'<'+'/script>');
  const n=h.match(/<script src="[^"]*tutor-nav\.js"><\/script>/); if(n) h=h.split(n[0]).join('<script>'+NAV+'<'+'/script>');
  const errs=[];
  const d=new JSDOM(h,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+f,
    beforeParse(w){ w.alert=()=>{}; w.confirm=()=>true; w.scrollTo=()=>{};
      w.Element.prototype.scrollIntoView=function(){};
      w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='globalAlpha'?1:(()=>{})});
      const vs=[{name:'Samantha',lang:'en-US'}];
      w.speechSynthesis={getVoices:()=>vs,cancel:()=>{},speak:()=>{},addEventListener:()=>{}};
      w.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;this.pitch=1;};
      w.addEventListener('error',e=>errs.push(e.message)); }});
  return {w:d.window,d:d.window.document,errs};
}
(async()=>{

/* ───────── SHAPE QUEST ───────── */
console.log('--- Shape Quest ---');
{
  const {w,d,errs}=mount('geometry.html');
  d.getElementById('nameIn').value='Robin'; w.eval('login()');
  function run(lesson, wrongN){
    w.eval(`openLesson(${lesson}); startQuiz()`);
    const n=w.eval(`CURRICULUM[${lesson}].quiz.length`);
    for(let i=0;i<n;i++){
      const q=w.eval(`CURRICULUM[${lesson}].quiz[${i}]`);
      const pick = i<wrongN ? (q.answer+1)%q.choices.length : q.answer;
      d.querySelector(`input[name=ch][value='${pick}']`).checked=true;
      w.eval('checkAnswer()');
      if(i<n-1) w.eval('quizNext()');
    }
    w.eval('finishLesson()');
  }
  run(0,2); run(0,0);
  w.eval("go('progress')");
  A(d.getElementById('reviewPick').options.length===1,'only the attempt with mistakes is reviewable');
  const items=d.querySelectorAll('#pastReview .rev-item');
  A(items.length===2,'2 missed questions listed: '+items.length);
  const t=d.getElementById('pastReview').textContent;
  A(t.includes('Correct:')&&t.includes('💡'),'shows correct answer and explanation');
  A(d.querySelector('#pastReview .figure svg')!==null,'diagram restored in the review');
  A(d.querySelectorAll('#histTable .hist-check').length===2,'checkbox per attempt');
  A(d.querySelectorAll('#histTable .rev-btn').length===1,'Review button only where mistakes exist');

  const boxes=[...d.querySelectorAll('.hist-check')];
  boxes[0].checked=true; w.eval('syncSelection()');
  A(d.getElementById('selBar').classList.contains('on'),'selection bar appears');
  w.eval('confirmDeleteSelected()');
  A(d.getElementById('delText').textContent.includes('1 selected attempt'),'modal names what goes');
  w.eval('doDelete()');
  A(w.TutorStore.app('robin','geometry').history.length===1,'only that attempt removed');
  A(w.eval('S.done.length')===1,'lesson unlock preserved after partial delete');
  A(w.TutorStore.deleted().some(x=>x.partial),'archived, not erased');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

/* ───────── WIND COURIER ───────── */
console.log('\n--- Wind Courier ---');
{
  const {w,d,errs}=mount('typing.html');
  d.getElementById('nameIn').value='Robin'; w.eval('login()');
  function typeLine(text){ const b=d.getElementById('typeIn');
    for(const ch of text){ b.value+=ch; w.eval('onType()'); } }
  function run(wrongLines){
    w.eval('startLesson(0)');
    const n=w.eval('CURRICULUM[0].lines.length');
    for(let i=0;i<n;i++){
      if(i>0) w.eval('nextLine()');
      const t=w.eval(`CURRICULUM[0].lines[${i}]`);
      typeLine(i<wrongLines ? 'x'+t.slice(1) : t);
    }
    w.eval('nextLine()');
  }
  run(2); run(0);
  w.eval("go('progress')");
  A(d.getElementById('reviewPick').options.length===1,'only the run with slips is reviewable');
  A(d.querySelectorAll('#pastReview .rev-item').length===2,'2 slipped lines listed');
  A(d.querySelector('#pastReview .errline .bad')!==null,'keystroke diff shown in review');
  A(d.getElementById('pastReview').textContent.includes('the line was'),'shows the intended line');
  A(d.querySelectorAll('#histTable .hist-check').length===2,'checkbox per run');

  const boxes=[...d.querySelectorAll('.hist-check')];
  boxes[0].checked=true; w.eval('syncSelection(); confirmDeleteSelected(); doDelete()');
  A(w.TutorStore.app('robin','typing').history.length===1,'only that run removed');
  A(w.eval('Object.keys(S.best).length')>0,'per-stop bests preserved after partial delete');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

/* ───────── MATH GRADE 7 ───────── */
console.log('\n--- Math Grade 7 ---');
{
  const {w,d,errs}=mount('tests/daily-test-2026-05-23-math7.html');
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  d.getElementById('player-name').value='Robin'; w.eval('playerLogin()');
  const TOTAL=w.eval('TOTAL');
  for(let i=0;i<TOTAL;i++){
    const corr=w.eval(`QUESTIONS[${i}].correct`);
    const pick = i<3 ? (corr+1)%4 : corr;
    w.eval(`currentQ=${i}; selectAnswer(${pick})`);
  }
  w.eval('submitTest()');
  A(d.getElementById('progress-screen')!==null,'progress screen exists');
  w.eval('showProgress()');
  A(d.getElementById('progress-screen').style.display==='block','progress screen opens');
  A(d.getElementById('results').style.display==='none','results hidden while on progress');

  A(d.getElementById('reviewPick').options.length===1,'the test with mistakes is reviewable');
  const items=d.querySelectorAll('#pastReview .rev-item');
  A(items.length===3,'3 missed questions listed: '+items.length);
  const t=d.getElementById('pastReview').textContent;
  A(t.includes('Correct:')&&t.includes('💡'),'shows correct answer and explanation');
  A(t.includes('Your answer:'),'shows what was picked');
  A(d.querySelectorAll('#histTable .hist-check').length===1,'checkbox for the test');
  A(d.querySelector('#histTable .rev-btn').textContent.includes('Review 3'),'review button shows count');

  d.querySelector('.hist-check').checked=true; w.eval('syncSelection()');
  A(d.getElementById('selCount').textContent==='1 test selected','count reads correctly');
  w.eval('confirmDeleteSelected()');
  A(w.TutorStore.app('robin','math7').history.length===0,'selected test removed');
  A(w.TutorStore.exists('robin'),'account survives a partial delete');
  A(w.TutorStore.deleted().some(x=>x.partial),'archived, not erased');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}
console.log(fails?`\n${fails} FAILURE(S)`:'\nALL APPS: REVIEW + SELECTIVE DELETE PASSED');
process.exit(fails?1:0);
})();

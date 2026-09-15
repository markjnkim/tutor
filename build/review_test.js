const { JSDOM } = require('jsdom');
const fs=require('fs'), path=require('path');
const T=path.join(__dirname,'..')+path.sep;
let fails=0; const A=(c,m)=>{ if(!c){console.error('FAIL:',m);fails++;} else console.log('ok:',m); };
const LIB=fs.readFileSync(T+'tutor-store.js','utf8'), NAV=fs.readFileSync(T+'tutor-nav.js','utf8');
function mount(f,seed){
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
      if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v);
      w.addEventListener('error',e=>errs.push(e.message)); }});
  return {w:d.window,d:d.window.document,errs};
}
/* run a math test scoring exactly `wrongN` wrong */
function mathRun(w,d,grade,diff,wrongN){
  w.eval(`pickGrade(${grade}); pickDiff('${diff}'); startTest()`);
  for(let i=0;i<25;i++){
    const q=w.eval(`session.questions[${i}]`);
    const pick = i<wrongN ? (q.answer+1)%q.choices.length : q.answer;
    d.querySelector(`input[name=choice][value='${pick}']`).checked=true;
    w.eval('submitAnswer()');
    if(i<24) w.eval('nextQuestion()');
  }
  w.eval('finishTest()');
}
(async()=>{

console.log('--- panda math: review past mistakes ---');
{
  const {w,d,errs}=mount('panda-math.html');
  d.getElementById('nameInput').value='Robin'; w.eval('login()');
  mathRun(w,d,5,'medium',3);   // test 1: 3 wrong
  mathRun(w,d,6,'hard',5);     // test 2: 5 wrong
  mathRun(w,d,4,'easy',0);     // test 3: perfect
  w.eval('showDashboard()');

  const rows=d.querySelectorAll('#historyTable tbody tr');
  A(rows.length===3,'history shows 3 tests');
  const picker=d.getElementById('reviewPick');
  A(picker.options.length===2,'review picker lists only tests WITH mistakes (2 of 3)');
  A(!picker.options[0].textContent.includes('100%'),'the perfect test is not offered for review');

  // newest-with-mistakes is selected by default
  const items=d.querySelectorAll('#pastReview .rev-item');
  A(items.length===5,'review shows all 5 missed questions from the selected test: '+items.length);
  const txt=d.getElementById('pastReview').textContent;
  A(txt.includes('Correct answer:'),'each item states the correct answer');
  A(txt.includes('💡'),'each item shows the explanation');
  A(txt.includes('Her answer:'),'each item shows what she picked');

  // switching tests re-renders
  picker.value = picker.options[1].value;
  w.eval('renderPastReview()');
  A(d.querySelectorAll('#pastReview .rev-item').length===3,'switching to the other test shows its 3 mistakes');

  // per-row Review button jumps to that test
  const btns=[...d.querySelectorAll('.rev-btn')];
  A(btns.length===2,'Review buttons appear only on tests with mistakes');
  // history renders newest-first, so the first button is the most recent test with mistakes (5 wrong)
  A(btns[0].textContent.trim()==='Review 5','button shows the mistake count for that row');
  A(btns[1].textContent.trim()==='Review 3','second button shows its own count');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

console.log('\n--- panda math: selective delete ---');
{
  const {w,d,errs}=mount('panda-math.html');
  d.getElementById('nameInput').value='Robin'; w.eval('login()');
  mathRun(w,d,5,'medium',3);
  mathRun(w,d,6,'hard',5);
  mathRun(w,d,4,'easy',0);
  w.eval('showDashboard()');
  A(w.TutorStore.app('robin','panda-math').history.length===3,'3 tests stored');
  A(w.TutorStore.app('robin','panda-math').best===100,'best is 100% before deleting');

  const boxes=[...d.querySelectorAll('.hist-check')];
  A(boxes.length===3,'a checkbox per test row');
  A(d.getElementById('selBar').classList.contains('on')===false,'selection bar hidden with nothing selected');

  // pick a specific test by date rather than row position
  const hist0=w.TutorStore.app('robin','panda-math').history;
  const target=hist0.find(h=>h.pct!==100);           // delete a non-perfect run first
  boxes.find(b=>b.dataset.date===target.date).checked=true; w.eval('syncSelection()');
  A(d.getElementById('selBar').classList.contains('on'),'selection bar appears');
  A(d.getElementById('selCount').textContent==='1 test selected','count reads correctly');

  w.eval('confirmDeleteSelected()');
  A(d.getElementById('deleteModal').classList.contains('show'),'selective delete asks for confirmation');
  A(d.getElementById('deleteModalText').textContent.includes('1 selected test'),'modal names what will go');
  w.eval('doDelete()');

  const after=w.TutorStore.app('robin','panda-math');
  A(after.history.length===2,'only the selected test was removed — 2 remain');
  A(after.best===100,'best still 100% — the perfect run was not the one deleted');
  A(!after.history.some(h=>h.date===target.date),'the chosen test is the one that went');
  A(w.TutorStore.deleted().some(x=>x.partial===true),'removed test archived, not erased');
  A(w.TutorStore.deleted().find(x=>x.partial).data.history.length===1,'archive holds exactly the deleted test');
  A(d.getElementById('scr-dash').classList.contains('active'),'stays on the progress page after a partial delete');
  A(w.TutorStore.exists('robin'),'the account itself survives');

  // deleting the top-scoring test must lower `best`
  const rest=[...d.querySelectorAll('.hist-check')];
  const perfectDate=w.TutorStore.app('robin','panda-math').history.find(h=>h.pct===100).date;
  rest.find(b=>b.dataset.date===perfectDate).checked=true;
  w.eval('syncSelection(); confirmDeleteSelected(); doDelete()');
  A(w.TutorStore.app('robin','panda-math').best < 100,'best recalculated down after deleting the perfect run: '+w.TutorStore.app('robin','panda-math').best);
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

console.log('\n--- spelling: review + selective delete ---');
{
  const {w,d,errs}=mount('spelling-bee.html');
  d.getElementById('nameInput').value='Robin'; w.eval('login()');
  function spellRun(wrongN){
    w.eval("pickGrade(5); pickDiff('medium'); startTest()");
    for(let i=0;i<20;i++){
      const word=w.eval(`session.words[${i}].w`);
      d.getElementById('answerBox').value = i<wrongN ? word.slice(0,-1)+'z' : word;
      w.eval('submitAnswer()');
      if(i<19) w.eval('nextWord()');
    }
    w.eval('finishTest()');
  }
  spellRun(4); spellRun(0);
  w.eval('showDashboard()');
  A(d.getElementById('reviewPick').options.length===1,'only the test with misspellings is reviewable');
  const items=d.querySelectorAll('#pastReview .rev-item');
  A(items.length===4,'4 misspelled words listed: '+items.length);
  const t=d.getElementById('pastReview').textContent;
  A(t.includes('Correct spelling:'),'shows the correct spelling');
  A(t.includes('💬')&&t.includes('📖'),'shows the sentence and definition');
  A(d.querySelector('#pastReview .spell-diff')!==null,'shows the letter-by-letter diff');
  A(d.querySelector('#pastReview .replay-btn')!==null,'offers to replay the word aloud');

  const boxes=[...d.querySelectorAll('.hist-check')];
  A(boxes.length===2,'checkbox per spelling test');
  boxes[0].checked=true; boxes[1].checked=true; w.eval('syncSelection()');
  A(d.getElementById('selCount').textContent==='2 tests selected','plural count');
  w.eval('confirmDeleteSelected(); doDelete()');
  A(w.TutorStore.app('robin','spelling').history.length===0,'both selected tests removed');
  A(w.TutorStore.exists('robin'),'account still exists after removing every test individually');
  A(errs.length===0,'no JS errors ('+errs.join(';')+')');
}

console.log('\n--- delete-all still works ---');
{
  const {w,d}=mount('panda-math.html');
  d.getElementById('nameInput').value='Robin'; w.eval('login()');
  mathRun(w,d,5,'easy',2);
  w.eval('showDashboard(); confirmDelete()');
  A(d.getElementById('deleteModalText').textContent.includes('ALL'),'delete-all modal is clearly distinct');
  w.eval('doDelete()');
  A(!w.TutorStore.exists('robin'),'delete-all still removes everything');
}
console.log(fails?`\n${fails} FAILURE(S)`:'\nALL REVIEW + DELETE CHECKS PASSED');
process.exit(fails?1:0);
})();

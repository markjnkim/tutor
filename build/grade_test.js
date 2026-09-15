const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;
let fails = 0;
function assert(c,m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

const LIB  = fs.readFileSync(T + 'tutor-store.js','utf8');
const NAV  = fs.readFileSync(T + 'tutor-nav.js','utf8');
function mount(file, url){
  let html = fs.readFileSync(T + file,'utf8');
  html = html.split(html.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0]).join('<script>'+LIB+'<'+'/script>');
  const navTag = html.match(/<script src="[^"]*tutor-nav\.js"><\/script>/);
  if(navTag) html = html.split(navTag[0]).join('<script>'+NAV+'<'+'/script>');
  const errs = [];
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true,
    url: url || 'http://localhost/' + file,
    beforeParse(win){
      win.alert=()=>{}; win.confirm=()=>true; win.scrollTo=()=>{};
      win.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='globalAlpha'?1:(()=>{})});
      const vs=[{name:'Samantha',lang:'en-US'}];
      win.speechSynthesis={getVoices:()=>vs,cancel:()=>{},speak:()=>{},addEventListener:()=>{}};
      win.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;this.pitch=1;};
      win.addEventListener('error',e=>errs.push(e.message));
    }});
  return { w: dom.window, d: dom.window.document, errs };
}

(async () => {

/* ─────────── MATH: grade picker ─────────── */
console.log('--- panda-math grades ---');
{
  const { w, d, errs } = mount('panda-math.html');
  const avail = w.eval('JSON.stringify(GRADES_AVAILABLE)');
  assert(avail === '[2,3,4,5,6,7,8,9]', 'grades 2-9 available (grade 9 = Algebra I): ' + avail);

  d.getElementById('nameInput').value = 'Robin';
  w.eval('login()');
  const cards = d.querySelectorAll('#gradeRow .grade-card');
  assert(cards.length === 11, 'picker shows grades 2-12 (11 cards)');
  assert(d.querySelectorAll('#gradeRow .grade-card.disabled').length === 3, 'grades 10-12 disabled as coming soon');
  assert(d.querySelector('#gradeRow .grade-card.selected .g-num').textContent === '5', 'defaults to grade 5');

  // every available grade builds a full 25-question test at every difficulty
  for(const g of [2,3,4,5,6,7,8,9]){
    for(const diff of ['easy','medium','hard']){
      w.eval(`pickGrade(${g}); pickDiff('${diff}')`);
      w.eval('startTest()');
      const n = w.eval('session.questions.length');
      const allRight = w.eval(`session.questions.every(q=>q.grade===${g})`);
      if(n !== 25 || !allRight){ console.error(`FAIL: grade ${g}/${diff} -> ${n} questions, gradeMatch=${allRight}`); fails++; }
    }
  }
  assert(true, 'all 8 grades x 3 difficulties build a full 25-question test from the right grade');

  // grade is recorded and remembered
  w.eval("pickGrade(7); pickDiff('hard'); startTest()");
  for(let i=0;i<25;i++){
    const q = w.eval(`session.questions[${i}]`);
    d.querySelector(`input[name=choice][value='${q.answer}']`).checked = true;
    w.eval('submitAnswer()');
    if(i<24) w.eval('nextQuestion()');
  }
  w.eval('finishTest()');
  const rec = w.TutorStore.app('robin','panda-math').history[0];
  assert(rec.gradeLevel === '7', 'grade recorded in test metadata: ' + rec.gradeLevel);
  assert(w.TutorStore.app('robin','panda-math').lastGrade === 7, 'grade remembered for next time');
  assert(rec.pct === 100, 'all-correct run scores 100%');

  // mastery chart must name every topic it received
  const bars = d.querySelectorAll('#testPatternBars .bar-row, #testTopicBars .bar-row');
  assert(bars.length === Object.keys(rec.topics).length,
         `mastery chart renders all ${Object.keys(rec.topics).length} grade-7 topics (no topic silently dropped)`);

  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}

/* ─────────── SPELLING: grade picker ─────────── */
console.log('\n--- spelling-bee grades ---');
{
  const { w, d, errs } = mount('spelling-bee.html');
  assert(w.eval('JSON.stringify(GRADES_AVAILABLE)') === '[3,4,5,6,7,8]', 'spelling grades 3-8 available');

  d.getElementById('nameInput').value = 'Robin';
  w.eval('login()');
  assert(d.querySelectorAll('#gradeRow .grade-card').length === 11, 'picker shows grades 2-12');
  assert(d.querySelectorAll('#gradeRow .grade-card.disabled').length === 5, 'grades 2 and 9-12 disabled');

  for(const g of [3,4,5,6,7,8]){
    for(const diff of ['easy','medium','hard']){
      w.eval(`pickGrade(${g}); pickDiff('${diff}')`);
      w.eval('startTest()');
      const n = w.eval('session.words.length');
      const right = w.eval(`session.words.every(x=>x.g===${g})`);
      const uniq = w.eval('new Set(session.words.map(x=>x.w)).size');
      if(n !== 20 || !right || uniq !== 20){
        console.error(`FAIL: spelling grade ${g}/${diff} -> ${n} words, gradeMatch=${right}, unique=${uniq}`); fails++;
      }
    }
  }
  assert(true, 'all 6 grades x 3 difficulties build 20 unique words from the right grade');

  w.eval("pickGrade(8); pickDiff('hard'); startTest()");
  for(let i=0;i<20;i++){
    d.getElementById('answerBox').value = w.eval(`session.words[${i}].w`);
    w.eval('submitAnswer()');
    if(i<19) w.eval('nextWord()');
  }
  w.eval('finishTest()');
  const rec = w.TutorStore.app('robin','spelling').history[0];
  assert(rec.gradeLevel === '8', 'spelling grade recorded: ' + rec.gradeLevel);
  assert(rec.pct === 100, 'all-correct spelling run scores 100%');
  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}

/* ─────────── SIDEBAR NAV ─────────── */
console.log('\n--- sidebar navigation ---');
{
  const { w, d, errs } = mount('panda-math.html', 'http://localhost/panda-math.html');
  assert(d.getElementById('tnav') !== null, 'sidebar mounted');
  assert(d.getElementById('tnav-toggle') !== null, 'hamburger button present');
  const links = [...d.querySelectorAll('#tnav a')];
  assert(links.length === 8, 'sidebar lists all 8 destinations');
  const cur = d.querySelector('#tnav a.current');
  assert(cur && cur.textContent.includes('Panda Math'), 'current app highlighted: Panda Math');
  assert(cur.getAttribute('aria-current') === 'page', 'current link marked aria-current');
  const hrefs = links.map(a=>a.getAttribute('href'));
  assert(hrefs.includes('spelling-bee.html'), 'links to spelling bee from math');
  assert(hrefs.includes('index.html'), 'links home');
  assert(hrefs.some(h=>h.includes('tests/')), 'links to the grade-7 test');
  // open/close
  d.getElementById('tnav-toggle').dispatchEvent(new w.Event('click'));
  assert(d.getElementById('tnav').classList.contains('open'), 'toggle opens the sidebar');
  d.getElementById('tnav-scrim').dispatchEvent(new w.Event('click'));
  assert(!d.getElementById('tnav').classList.contains('open'), 'clicking outside closes it');
  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}
{
  const { w, d } = mount('spelling-bee.html', 'http://localhost/spelling-bee.html');
  const cur = d.querySelector('#tnav a.current');
  assert(cur && cur.textContent.includes('Spelling'), 'spelling app highlights itself');
  assert([...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href')).includes('panda-math.html'),
         'links to math from spelling');
}
{
  // depth handling: a page inside tests/ must reach root files via ../
  const { w, d } = mount('tests/daily-test-2026-05-23-math7.html',
                         'http://localhost/tests/daily-test-2026-05-23-math7.html');
  // this page mounts its nav on DOMContentLoaded, which jsdom fires asynchronously
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  const hrefs = [...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href'));
  assert(hrefs.includes('../panda-math.html'), 'nested page resolves root links through ../');
  const cur = d.querySelector('#tnav a.current');
  assert(cur && cur.textContent.includes('Math Grade 7'), 'nested page highlights itself');
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nALL GRADE + NAV CHECKS PASSED');
process.exit(fails ? 1 : 0);
})();

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;
let fails = 0;
function assert(c,m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

const LIB = fs.readFileSync(T + 'tutor-store.js','utf8');
const NAV = fs.readFileSync(T + 'tutor-nav.js','utf8');

function mount(file, seedStorage){
  let html = fs.readFileSync(T + file,'utf8');
  const st = html.match(/<script src="[^"]*tutor-store\.js"><\/script>/);
  if(st) html = html.split(st[0]).join('<script>'+LIB+'<'+'/script>');
  const nv = html.match(/<script src="[^"]*tutor-nav\.js"><\/script>/);
  if(nv) html = html.split(nv[0]).join('<script>'+NAV+'<'+'/script>');
  const errs = [];
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true,
    url:'http://localhost/'+file,
    beforeParse(win){
      win.alert=()=>{}; win.confirm=()=>true; win.scrollTo=()=>{};
      win.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='globalAlpha'?1:(()=>{})});
      win.speechSynthesis={getVoices:()=>[{name:'Yuna',lang:'ko-KR'}],cancel:()=>{},speak:()=>{},addEventListener:()=>{}};
      win.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;this.pitch=1;};
      if(seedStorage) for(const [k,v] of Object.entries(seedStorage)) win.localStorage.setItem(k,v);
      win.addEventListener('error',e=>errs.push(e.message));
    }});
  return { w: dom.window, d: dom.window.document, errs };
}

(async () => {

/* ── login gate ── */
console.log('--- korean login ---');
{
  const { w, d, errs } = mount('korean.html');
  assert(typeof w.TutorStore === 'object', 'TutorStore loaded');
  assert(d.getElementById('ko-login') !== null, 'login gate present');
  assert(w.eval('typeof CURRICULUM') === 'object' || w.eval('Array.isArray(CURRICULUM)'), 'curriculum intact');
  const total = w.eval('TOTAL');
  assert(total > 0, `curriculum has ${total} lessons`);

  d.getElementById('ko-name').value = 'ROBIN';         // uppercase on purpose
  w.eval('koLogin()');
  assert(d.getElementById('ko-login').style.display === 'none', 'login dismissed');
  assert(w.eval('currentUser') === 'ROBIN' || w.TutorStore.exists('robin'), 'user created case-insensitively');
  assert(d.getElementById('ko-who').textContent.includes('ROBIN'), 'player shown in top bar');
  assert(w.eval("document.getElementById('s-map').classList.contains('on')"), 'lands on the map screen');

  // no grade selector on this app, by design
  assert(d.getElementById('gradeRow') === null, 'no grade selector (by design for a sequential curriculum)');

  // complete a lesson with a quiz
  const les = w.eval('JSON.stringify({id:CURRICULUM[0].id, name:CURRICULUM[0].name})');
  w.eval('finishLesson(CURRICULUM[0], {right:5, total:6})');
  const app = w.TutorStore.app('robin','korean');
  assert(app.progress && app.progress.done.length === 1, 'lesson progress saved to shared store');
  assert(app.progress.seeds === 25, 'seeds awarded and persisted: ' + app.progress.seeds);
  assert(app.history.length === 1, 'lesson logged to shared history');
  const rec = app.history[0];
  assert(rec.subject === 'Korean' && rec.app === 'korean', 'subject metadata');
  assert(rec.lessonId === JSON.parse(les).id && rec.pct === 83, 'lesson id and score recorded: ' + rec.pct + '%');
  assert(rec.lessonsTotal === total, 'total lessons recorded');
  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}

/* ── progress reloads for the same user, any casing ── */
console.log('\n--- progress persistence ---');
{
  const { w, d } = mount('korean.html');
  d.getElementById('ko-name').value = 'Robin';
  w.eval('koLogin()');
  w.eval('finishLesson(CURRICULUM[0], {right:6, total:6})');
  w.eval('finishLesson(CURRICULUM[1], {right:4, total:6})');
  const raw = w.localStorage.getItem('tutorApp.v1');

  // fresh page load, different casing
  const again = mount('korean.html', {'tutorApp.v1': raw});
  again.d.getElementById('ko-name').value = '  robin ';
  again.w.eval('koLogin()');
  assert(again.w.eval('S.done.length') === 2, 'progress restored on next visit via different casing');
  assert(again.w.eval('S.seeds') === 50, 'seeds restored: ' + again.w.eval('S.seeds'));
  assert(again.d.getElementById('seedCount').textContent === '50', 'top bar reflects restored seeds');

  // a different student starts clean
  const other = mount('korean.html', {'tutorApp.v1': raw});
  other.d.getElementById('ko-name').value = 'Sam';
  other.w.eval('koLogin()');
  assert(other.w.eval('S.done.length') === 0, "a second student starts fresh, doesn't inherit progress");
  assert(other.w.TutorStore.app('robin','korean').progress.done.length === 2, "and Robin's progress is untouched");
}

/* ── migration from the standalone version ── */
console.log('\n--- legacy migration ---');
{
  const legacy = JSON.stringify({done:['v1','v2','c1'], seeds:75, scores:{v1:100,v2:83}});
  const { w, d } = mount('korean.html', {'hangul_v2': legacy});
  d.getElementById('ko-name').value = 'Robin';
  w.eval('koLogin()');
  assert(w.eval('S.done.length') === 3, 'standalone progress migrated on first login');
  assert(w.eval('S.seeds') === 75, 'seeds carried over: ' + w.eval('S.seeds'));
  assert(w.eval('S.scores.v1') === 100, 'per-lesson scores carried over');
  assert(w.TutorStore.app('robin','korean').progress.done.length === 3, 'migrated data written to shared store');

  // a second student must NOT also inherit the legacy blob.
  // Carry over the REAL storage state (same browser), not a re-injected blob —
  // the migration clears 'hangul_v2' once it has been claimed.
  const carried = {};
  for(let i=0;i<w.localStorage.length;i++){
    const k = w.localStorage.key(i);
    carried[k] = w.localStorage.getItem(k);
  }
  assert(!('hangul_v2' in carried), 'legacy key cleared after being claimed');
  const other = mount('korean.html', carried);
  other.d.getElementById('ko-name').value = 'Sam';
  other.w.eval('koLogin()');
  assert(other.w.eval('S.done.length') === 0,
         'legacy blob is claimed once only — a later student does NOT inherit it');
}

/* ── sidebar ── */
console.log('\n--- sidebar ---');
{
  const { w, d } = mount('korean.html');
  assert(d.getElementById('tnav') !== null, 'sidebar mounted on korean');
  const links = [...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href'));
  assert(links.length === 8, 'sidebar now lists 8 destinations');
  assert(links.includes('panda-math.html') && links.includes('spelling-bee.html'), 'links to math and spelling');
  const cur = d.querySelector('#tnav a.current');
  assert(cur && cur.textContent.includes('한글'), 'korean highlights itself');
}
{
  const { d } = mount('panda-math.html');
  const links = [...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href'));
  assert(links.includes('korean.html'), 'math app links to korean');
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nALL KOREAN CHECKS PASSED');
process.exit(fails ? 1 : 0);
})();

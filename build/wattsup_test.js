const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;
let fails = 0;
function assert(c,m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

const LIB = fs.readFileSync(T + 'tutor-store.js','utf8');
const NAV = fs.readFileSync(T + 'tutor-nav.js','utf8');
function mount(storage){
  let html = fs.readFileSync(T + 'watts-up.html','utf8');
  html = html.split('<script src="tutor-store.js"></script>').join('<script>'+LIB+'<'+'/script>');
  html = html.split('<script src="tutor-nav.js"></script>').join('<script>'+NAV+'<'+'/script>');
  const errs = [];
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/watts-up.html',
    beforeParse(win){
      win.alert=()=>{}; win.confirm=()=>true; win.scrollTo=()=>{};
      if(storage) win.localStorage.setItem('tutorApp.v1', storage);
      win.addEventListener('error', e => errs.push(e.message));
    }});
  return { w: dom.window, d: dom.window.document, errs };
}
// Click the option whose text matches `want` on the current question.
function pick(w, d, want){
  const b = [...d.querySelectorAll('#qOpts .opt')].find(o => o.textContent.slice(1) === want);
  b.click();
}

/* ---- first run: answer all but two correctly ---- */
let saved;
{
  const { w, d, errs } = mount();
  const bank = JSON.parse(w.eval('JSON.stringify(BANK.map(q=>({id:q.id,part:q.part,d:q.d,opts:q.opts})))'));
  const core = bank.filter(q => q.part !== 'challenge');
  assert(core.length === 29, 'core bank has 29 questions: ' + core.length);
  assert(bank.every(q => q.opts.length === 4 && new Set(q.opts).size === 4), 'every question has 4 distinct options');
  assert(bank.every(q => w.eval(`!!DIAGRAMS["${q.d}"]`)), 'every question points at a real diagram');
  ['symbols','circuits','series','logic','hands'].forEach(p => assert(core.some(q => q.part === p), 'part present: ' + p));

  d.getElementById('nameInput').value = 'Chloe';
  w.eval('login()');
  assert(d.getElementById('scr-setup').classList.contains('active'), 'login opens setup');
  w.eval('startQuiz()');
  assert(d.querySelectorAll('#qOpts .opt').length === 4, 'question shows 4 options');
  assert(d.querySelector('#qDiagram svg'), 'question shows its diagram');
  const order = JSON.parse(w.eval('JSON.stringify(session.qs.map(x=>x.q.id))'));
  order.forEach((id, i) => {
    const q = bank.find(b => b.id === id);
    if(i === 0) { /* skip */ }
    else if(i === 1) pick(w, d, q.opts[1]);       // wrong
    else pick(w, d, q.opts[0]);                   // right
    w.eval('go(1)');
  });
  assert(d.getElementById('scr-results').classList.contains('active'), 'finishing shows results');
  const rec = JSON.parse(w.eval('JSON.stringify(TutorStore.app("Chloe","watts-up").history[0])'));
  assert(rec && rec.score === 27 && rec.total === 29 && rec.pct === 93, 'saved 27/29 (93%): ' + (rec && rec.score + '/' + rec.total + ' ' + rec.pct));
  assert(rec.skippedCount === 1, 'one skipped recorded');
  assert(rec.answers.length === 29 && rec.answers.every(a => 'chosen' in a && 'correctAnswer' in a), 'per-question answers saved');
  assert(d.querySelectorAll('#missList .miss').length === 2, 'two missed questions listed for review');
  assert(d.querySelector('#missList .explain'), 'missed questions show explanations');
  assert(errs.length === 0, 'no script errors: ' + errs.join(' | '));
  saved = w.localStorage.getItem('tutorApp.v1');
}

/* ---- returning user (different case), with challenge: history and delete ---- */
{
  const { w, d, errs } = mount(saved);
  d.getElementById('nameInput').value = 'chloe';
  w.eval('login()');
  assert(/1 practice test/.test(d.getElementById('helloName').textContent), 'returning user sees saved progress');
  d.getElementById('optChallenge').checked = true;
  w.eval('startQuiz()');
  assert(w.eval('session.qs.length') === 32, 'challenge adds 3 questions');
  const n = w.eval('session.qs.length');
  for(let i = 0; i < n; i++) w.eval('go(1)');   // skip everything
  const h = JSON.parse(w.eval('JSON.stringify(TutorStore.app("Chloe","watts-up").history)'));
  assert(h.length === 2 && h[1].score === 0 && h[1].challengeTotal === 3, 'second run saved with challenge kept out of the score');
  w.eval('showHistory()');
  assert(d.querySelectorAll('#histTable tr').length === 3, 'history table lists both runs');
  d.querySelector('.histPick').checked = true; w.eval('updDel()'); w.eval('askDelete()');
  assert(d.querySelector('#histConfirm .confirm'), 'delete asks in the page first');
  w.eval('doDelete()');
  const left = JSON.parse(w.eval('JSON.stringify(TutorStore.app("Chloe","watts-up").history.length)'));
  assert(left === 1, 'one run deleted, one kept');
  assert(w.eval('TutorStore.deleted().length') === 1, 'deleted run is archived');
  assert(d.querySelector('#tnav a[href="watts-up.html"]'), 'sidebar lists Watt’s Up');
  assert(errs.length === 0, 'no script errors: ' + errs.join(' | '));
}

/* ---- home page lists it ---- */
{
  const idx = fs.readFileSync(T + 'index.html','utf8');
  assert(idx.includes('<option value="watts-up.html">'), 'home dropdown lists watts-up.html');
}

console.log(fails ? `\n✗ ${fails} failed` : '\n✓ watts-up: all passed');
process.exit(fails ? 1 : 0);

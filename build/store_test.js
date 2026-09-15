const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;  // repo root
let fails = 0;
function assert(c, m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

const LIB = fs.readFileSync(T + 'tutor-store.js', 'utf8');

function mount(file){
  let html = fs.readFileSync(T + file, 'utf8');
  // inline the shared library (split/join avoids $-pattern expansion in replace)
  const tag = html.match(/<script src="[^"]*tutor-store\.js"><\/script>/);
  if(!tag) throw new Error('no tutor-store script tag in ' + file);
  html = html.split(tag[0]).join('<script>' + LIB + '<' + '/script>');
  const errs = [];
  const dom = new JSDOM(html, {
    runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/',
    beforeParse(win){
      win.alert=()=>{}; win.confirm=()=>true; win.scrollTo=()=>{};
      win.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {get:(t,p)=> p==='globalAlpha'?1:(()=>{})});
      win.addEventListener('error', e=>errs.push(e.message));
    }});
  return { w: dom.window, d: dom.window.document, errs };
}

/* wait for external <script src> to load */

(async () => {
/* ================= PANDA MATH ================= */
console.log('\n--- panda-math.html ---');
{
  const { w, d, errs } = mount('panda-math.html');
  assert(typeof w.TutorStore === 'object', 'TutorStore library loaded');

  d.getElementById('nameInput').value = 'Robin';
  w.eval('login()');
  w.eval("pickDiff('medium')");
  w.eval('startTest()');
  for(let i=0;i<25;i++){
    const q = w.eval(`session.questions[${i}]`);
    if(i===0){ w.eval('skipQuestion()'); }
    else {
      const pick = (i===1) ? (q.answer+1)%q.choices.length : q.answer;
      d.querySelector(`input[name=choice][value='${pick}']`).checked = true;
      w.eval('submitAnswer()');
    }
    if(i<24) w.eval('nextQuestion()');
  }
  w.eval('finishTest()');

  const raw = JSON.parse(w.localStorage.getItem('tutorApp.v1'));
  assert(!!raw.users['robin'], 'user stored under lowercase key');
  assert(raw.users['robin'].displayName === 'Robin', 'display name preserves original casing');
  const rec = raw.users['robin'].apps['panda-math'].history[0];
  assert(rec.answers.length === 25, 'all 25 answers persisted');
  const a = rec.answers[5];
  const fields = ['qId','topic','topicName','difficulty','order','question','choices','correctIndex','correctAnswer','picked','pickedAnswer','correct','skipped','seconds','explain'];
  assert(fields.every(f => f in a), 'per-question metadata complete: ' + fields.join(','));
  assert(typeof a.seconds === 'number', 'time-per-question captured');
  assert(rec.answers[0].skipped === true && rec.answers[0].picked === null, 'skipped question recorded');
  assert(rec.answers[1].correct === false && rec.answers[1].pickedAnswer !== null, 'wrong answer + her choice recorded');
  assert(rec.subject === 'Math' && rec.app === 'panda-math', 'subject/app metadata');
assert(/^[2-8]$/.test(rec.gradeLevel), 'grade level recorded as a single grade: ' + rec.gradeLevel);
  assert(typeof rec.timeTakenSec === 'number' && rec.difficulty === 'medium' && rec.timed === true, 'test-level timing metadata');
  assert(Object.keys(rec.topics).length >= 5, 'per-topic tallies stored');
  assert(rec.score === 23 && rec.pct === 92 && rec.win === true, 'score 23/25 = 92%');

  // CASE-INSENSITIVE re-login
  w.eval('switchUser()');
  d.getElementById('nameInput').value = 'ROBIN';
  w.eval('login()');
  assert(w.eval('currentUser') === 'Robin', 'ROBIN resolves to existing account "Robin"');
  assert(w.eval('myApp().history.length') === 1, 'same history reached via different casing');
  w.eval('switchUser()');
  d.getElementById('nameInput').value = '  robin  ';
  w.eval('login()');
  assert(w.eval('myApp().history.length') === 1, 'whitespace + lowercase also resolves to same account');

  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}

/* ================= MATH 7 ================= */
console.log('\n--- daily-test-2026-05-23-math7.html ---');
{
  const { w, d, errs } = mount('tests/daily-test-2026-05-23-math7.html');
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  assert(typeof w.TutorStore === 'object', 'TutorStore loaded in math7');
  assert(d.getElementById('login-overlay') !== null, 'login gate present');

  d.getElementById('player-name').value = 'robin';   // lowercase on purpose
  w.eval('playerLogin()');
  assert(d.getElementById('login-overlay').style.display === 'none', 'login dismissed, test started');
  assert(w.eval('currentUser') === 'robin', 'player logged in');

  const TOTAL = w.eval('TOTAL');
  for(let i=0;i<TOTAL;i++){
    w.eval(`currentQ = ${i}`);
    if(i < 2) w.eval('goSkip()');
    else {
      const corr = w.eval(`QUESTIONS[${i}].correct`);
      const pick = (i===2) ? (corr+1)%4 : corr;
      w.eval(`currentQ = ${i}; selectAnswer(${pick})`);
    }
  }
  w.eval('submitTest()');
  const raw = JSON.parse(w.localStorage.getItem('tutorApp.v1'));
  assert(!!raw.users['robin'], 'math7 user stored under lowercase key');
  const rec = raw.users['robin'].apps['math7'].history[0];
  assert(rec.answers.length === TOTAL, `all ${TOTAL} math7 answers persisted`);
  assert(rec.subject === 'Math' && rec.gradeLevel === '7' && rec.testId === 'daily-2026-05-23', 'math7 subject metadata');
  assert('seconds' in rec.answers[3] && 'topic' in rec.answers[3] && 'difficulty' in rec.answers[3], 'math7 per-question metadata');
  assert(rec.answers[0].skipped === true, 'math7 skip recorded');
  assert(rec.answers[2].correct === false, 'math7 wrong answer recorded');
  assert(rec.score === TOTAL - 3, 'math7 score correct: ' + rec.score + '/' + TOTAL);
  assert(raw.users['robin'].apps['math7'].xp > 0, 'XP persisted per player: ' + raw.users['robin'].apps['math7'].xp);
  assert(d.getElementById('lb-rows').textContent.includes('robin'), 'leaderboard shows player name');
  assert(Object.keys(raw.users).length === 1, 'both apps share ONE user record');
  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exitCode = fails ? 1 : 0;
})();

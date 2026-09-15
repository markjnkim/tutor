const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;  // repo root
let html = fs.readFileSync(T + 'panda-math.html','utf8');
const LIB = fs.readFileSync(T + 'tutor-store.js','utf8');
const tag = html.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0];
html = html.split(tag).join('<script>' + LIB + '<' + '/script>');
const errs = [];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
  beforeParse(win){
    win.alert = ()=>{};
    win.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {get: (t,p)=> p==='globalAlpha'?1:(()=>{})});
    win.addEventListener('error', e => errs.push(e.message));
  }});
const w = dom.window, d = w.document;

function assert(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exitCode = 1; } else console.log('ok:', msg); }

assert(w.eval('typeof QUESTION_BANK') === 'object' || w.eval('Array.isArray(QUESTION_BANK)'), 'QUESTION_BANK loaded');

// login
d.getElementById('nameInput').value = 'Robin';
w.eval('login()');
assert(d.getElementById('scr-setup').classList.contains('active'), 'login -> setup screen');
assert(w.TutorStore.exists('ROBIN'), 'user record created (case-insensitive)');

// pick hard, timer on, start
w.eval("pickDiff('hard')");
w.eval('startTest()');
assert(d.getElementById('scr-quiz').classList.contains('active'), 'quiz screen active');
assert(w.eval('session.questions.length') === 25, '25 questions built');
assert(w.eval('session.timeLeft') === 15*60, 'hard timer = 15 min');
w.eval('addTime()');
assert(w.eval('session.timeLeft') === 15*60+300, '+5 min works');

// answer 21 correct, skip 2, answer 2 wrong => 21/25 = 84% win, not perfect
for(let i=0;i<25;i++){
  const q = w.eval(`session.questions[${i}]`);
  if(i < 2){ w.eval('skipQuestion()'); }
  else {
    const pick = (i < 4) ? (q.answer+1) % q.choices.length : q.answer; // 2 wrong
    const radio = d.querySelector(`input[name=choice][value='${pick}']`);
    radio.checked = true;
    w.eval('submitAnswer()');
  }
  if(i < 24) w.eval('nextQuestion()');
}
w.eval('finishTest()');
assert(d.getElementById('scr-results').classList.contains('active'), 'results screen shown');
assert(d.querySelectorAll('#reviewList .review-item').length === 4, 'review lists 4 missed questions (2 skipped + 2 wrong)');
assert(d.getElementById('reviewList').textContent.includes('You skipped'), 'skipped items labeled in review');
assert(d.getElementById('reviewList').textContent.includes('💡'), 'explanations shown in end review');
assert(d.getElementById('eatScene') && d.getElementById('eatPanda'), 'eating animation scene present');
const rec = w.TutorStore.app('robin','panda-math').history[0];
assert(rec.score === 21, 'score = 21 (skips+wrong counted against)');
assert(rec.pct === 84 && rec.win === true && rec.perfect === false, '84% -> win, not perfect');
assert(Object.keys(rec.topics).length >= 5, 'topic breakdown recorded: ' + Object.keys(rec.topics).length + ' topics');

// persistence via localStorage
const raw = w.localStorage.getItem('tutorApp.v1');
assert(raw && JSON.parse(raw).users.robin.apps['panda-math'].history.length === 1, 'localStorage persisted');

// perfect run -> fireworks path
w.eval('showSetup()');
w.eval("pickDiff('easy')");
d.getElementById('timerToggle').checked = false;
w.eval('startTest()');
for(let i=0;i<25;i++){
  const q = w.eval(`session.questions[${i}]`);
  const radio = d.querySelector(`input[name=choice][value='${q.answer}']`);
  radio.checked = true;
  w.eval('submitAnswer()');
  if(i < 24) w.eval('nextQuestion()');
}
w.eval('finishTest()');
const rec2 = w.TutorStore.app('robin','panda-math').history[1];
assert(rec2.pct === 100 && rec2.perfect === true, 'perfect run recorded');
assert(d.getElementById('bestBanner').style.display === 'block', 'new personal best banner shown');
assert(d.getElementById('reviewList').textContent.includes('Nothing to review'), 'perfect run: empty review message');

assert(d.getElementById('explainBox') === null, 'no explanation box during quiz (moved to end)');
// dashboard + delete flow with archive
w.eval('showDashboard()');
assert(d.querySelectorAll('#historyTable tbody tr').length === 2, 'history shows 2 tests');
assert(d.querySelectorAll('#topScoresTable tbody tr').length === 2, 'top scores populated');
w.eval('confirmDelete()');
assert(d.getElementById('deleteModal').classList.contains('show'), 'delete requires confirmation modal');
w.eval('doDelete()');
assert(!w.TutorStore.exists('Robin'), 'user removed after confirm');
assert(w.TutorStore.deleted().length === 1, 'data moved to deleted archive');
w.eval("login.call(null)") // no-op guard
d.getElementById('nameInput').value = 'Robin2'; w.eval('login()');
w.eval('showArchive()');
assert(d.getElementById('scr-archive').classList.contains('active') && d.getElementById('archiveList').textContent.includes('Robin'), 'archive page lists deleted data');

assert(errs.length === 0, 'no runtime JS errors (' + errs.join('; ') + ')');
console.log('SMOKE TEST DONE');

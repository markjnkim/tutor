const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;  // repo root
let fails = 0;
function assert(c,m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

const LIB = fs.readFileSync(T + 'tutor-store.js','utf8');
function mount(file, opts){
  opts = opts || {};
  let html = fs.readFileSync(T + file,'utf8');
  const tag = html.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0];
  html = html.split(tag).join('<script>' + LIB + '<' + '/script>');
  const errs = [], spoken = [];
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/',
    beforeParse(win){
      win.alert=()=>{}; win.confirm=()=>true; win.scrollTo=()=>{};
      win.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {get:(t,p)=> p==='globalAlpha'?1:(()=>{})});
      // mock Web Speech API
      if(!opts.noSpeech){
        const vs = [{name:'Samantha', lang:'en-US'}, {name:'Daniel', lang:'en-GB'}];
        win.speechSynthesis = { getVoices:()=>vs, cancel:()=>{}, speak:u=>spoken.push({text:u.text, rate:u.rate}),
                                addEventListener:()=>{} };
        win.SpeechSynthesisUtterance = function(t){ this.text=t; this.rate=1; this.pitch=1; };
      } else {
        win.speechSynthesis = undefined;
      }
      win.addEventListener('error', e=>errs.push(e.message));
    }});
  return { w: dom.window, d: dom.window.document, errs, spoken, dom };
}

/* ---------- grading + diff logic ---------- */
console.log('--- grading logic ---');
{
  const { w } = mount('spelling-bee.html');
  const ic = (a,b)=>w.eval(`isCorrect(${JSON.stringify(a)}, ${JSON.stringify(b)})`);
  assert(ic('receive','receive'), 'exact match correct');
  assert(ic('RECEIVE','receive'), 'uppercase accepted');
  assert(ic('Receive','receive'), 'title case accepted');
  assert(ic('  receive  ','receive'), 'surrounding whitespace ignored');
  assert(!ic('recieve','receive'), 'transposed letters marked wrong');
  assert(!ic('receiv','receive'), 'missing letter marked wrong');
  assert(!ic('receivee','receive'), 'extra letter marked wrong');
  assert(!ic('','receive'), 'empty is wrong');
  assert(ic('their','THEIR'), 'case-insensitive both directions');

  const diff = (a,b)=>w.eval(`spellDiff(${JSON.stringify(a)}, ${JSON.stringify(b)})`);
  const d1 = diff('recieve','receive');
  assert((d1.match(/class="bad"/g)||[]).length === 2, 'diff flags 2 swapped letters in recieve');
  const d2 = diff('receiv','receive');
  assert(d2.includes('class="miss"'), 'diff marks missing trailing letter');
  const d3 = diff('receivee','receive');
  assert(d3.includes('class="bad"'), 'diff marks the extra letter');
  const d4 = diff('receive','receive');
  assert(!d4.includes('bad') && !d4.includes('miss'), 'perfect spelling shows no errors');
}

/* ---------- full play-through ---------- */
console.log('\n--- full test run ---');
{
  const { w, d, errs, spoken } = mount('spelling-bee.html');
  assert(w.eval('WORD_BANK.length') === 580, 'word bank loaded: 580 words across grades 3-8');
  assert(d.getElementById('voiceSelect') !== null, 'voice picker present');

  d.getElementById('nameInput').value = 'Robin';
  w.eval('login()');
  assert(d.getElementById('voiceSelect').options.length === 2, 'voices listed in picker');
  assert(w.eval('chosenVoice.name') === 'Samantha', 'natural-sounding voice auto-selected');

  w.eval("pickDiff('hard')");
  w.eval('startTest()');
  assert(w.eval('session.words.length') === 20, '20 words selected');
  assert(w.eval('session.timeLeft') === 10*60, 'hard timer = 10 min');
  assert(spoken.length === 0, 'first word NOT auto-spoken (browser gesture rule)');

  w.eval('speakWord()');
  assert(spoken.length === 1 && spoken[0].rate === 0.85, 'hear-the-word speaks at normal rate');
  w.eval('speakSlow()');
  assert(spoken[1].rate === 0.5, 'say-it-slowly uses reduced rate');
  w.eval('speakSentence()');
  assert(spoken[2].text === w.eval('session.words[0].s'), 'sentence helper speaks the sentence');
  assert(!d.getElementById('helperText').textContent.toLowerCase()
          .includes(w.eval('session.words[0].w').toLowerCase()),
         'sentence is shown with the word blanked out (no spelling giveaway)');
  w.eval('speakDefinition()');
  assert(spoken[3].text === w.eval('session.words[0].def'), 'definition helper speaks the definition');
  assert(w.eval("JSON.stringify(session.helpersUsed)") === '["slow","sentence","definition"]', 'helper usage tracked');

  // 17 correct, 1 wrong, 2 skipped => 17/20 = 85% win
  for(let i=0;i<20;i++){
    const word = w.eval(`session.words[${i}].w`);
    if(i < 2){ w.eval('skipWord()'); }
    else {
      const typed = (i === 2) ? word.slice(0,-1) + 'x' : (i % 3 === 0 ? word.toUpperCase() : word);
      d.getElementById('answerBox').value = typed;
      w.eval('submitAnswer()');
    }
    if(i < 19) w.eval('nextWord()');
  }
  w.eval('finishTest()');

  const rec = w.TutorStore.app('robin','spelling').history[0];
  assert(rec.answers.length === 20, 'all 20 words persisted');
  assert(rec.score === 17 && rec.pct === 85 && rec.win === true, 'score 17/20 = 85%, panda fed');
  assert(rec.subject === 'Spelling' && rec.app === 'spelling', 'subject metadata');
  assert(/^[3-8]$/.test(rec.gradeLevel), 'grade level recorded: ' + rec.gradeLevel);
  assert(rec.voice === 'Samantha', 'voice used is recorded');
  const a = rec.answers[5];
  const fields = ['word','pattern','patternName','difficulty','order','typed','correct','skipped','seconds','replays','helpers','sentence','definition'];
  assert(fields.every(f=>f in a), 'per-word metadata complete: ' + fields.join(','));
  assert(rec.answers[0].skipped === true && rec.answers[0].typed === null, 'skipped word recorded');
  assert(rec.answers[2].correct === false && typeof rec.answers[2].typed === 'string', 'misspelling stores what she typed');
  assert(rec.answers.some(x=>x.typed && x.typed === x.typed.toUpperCase() && x.correct),
         'uppercase typing still graded correct');
  assert(Object.keys(rec.topics).length >= 4, 'per-pattern tallies stored: ' + Object.keys(rec.topics).length);

  const rl = d.getElementById('reviewList');
  assert(rl.querySelectorAll('.review-item').length === 3, 'review lists 3 missed words');
  assert(rl.querySelector('.spell-diff') !== null, 'review shows letter-by-letter diff');
  assert(rl.textContent.includes('💬') && rl.textContent.includes('📖'), 'review includes sentence + definition');
  assert(d.getElementById('eatScene') !== null, 'panda eating scene present');
  assert(errs.length === 0, 'no JS errors (' + errs.join(';') + ')');

  // dashboard
  w.eval('showDashboard()');
  assert(d.getElementById('troubleWords').textContent.length > 0, 'trouble-words list rendered');
  assert(d.querySelectorAll('#topScoresTable tbody tr').length === 1, 'leaderboard populated');
}

/* ---------- no-speech fallback ---------- */
console.log('\n--- browser without speech support ---');
{
  const { w, d, errs } = mount('spelling-bee.html', {noSpeech:true});
  d.getElementById('nameInput').value = 'Sam';
  w.eval('login()');
  assert(d.getElementById('voiceWarn').style.display === 'block', 'warns when no voices available');
  w.eval('startTest()');
  w.eval('speakWord()');
  assert(d.getElementById('helperText').textContent.includes(w.eval('session.words[0].w')),
         'falls back to showing the word when audio is unavailable');
  assert(errs.length === 0, 'no JS errors without speech API (' + errs.join(';') + ')');
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nALL SPELLING CHECKS PASSED');
process.exit(fails ? 1 : 0);   // rAF/animation timers would otherwise keep node alive

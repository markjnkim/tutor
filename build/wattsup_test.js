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
  const bank = JSON.parse(w.eval('JSON.stringify(BANK.map(q=>({id:q.id,part:q.part,skill:q.skill,difficulty:q.difficulty,d:q.d,opts:q.opts,explain:q.explain,prompt:q.prompt})))'));
  const LEGACY = 's1 s2 s3 s4 a1 a2 d1 d2 d3 b1 b2 b3 c1 c2 c3 e1 e2 e3 e4 f1 f2 f3 f4 g1 g2 g3 g4 g5 g6 x1 x2 x3'.split(' ');
  assert(LEGACY.every(id => bank.some(q => q.id === id)), 'the original 32 ids are still in the bank');
  assert(new Set(bank.map(q => q.id)).size === bank.length, 'bank ids are unique (' + bank.length + ' items)');
  assert(bank.every(q => q.skill && [1,2,3].includes(q.difficulty) && q.explain && q.prompt), 'every item has a skill, difficulty 1–3, prompt and explanation');
  const bp = JSON.parse(w.eval('JSON.stringify(Object.assign({}, BLUEPRINT, {challenge: CHALLENGE_SLOTS}))'));
  console.log('   bank sizes: ' + Object.keys(bp).map(p => p + ' ' + bank.filter(q => q.part === p).length + '/' + bp[p] + ' slots').join(', '));
  const svgErrs = bank.filter(q => { try { return !/<svg[\s\S]*<\/svg>$/.test(w.eval(`svgFor(BANK.find(b=>b.id===${JSON.stringify(q.id)}).d, BANK.find(b=>b.id===${JSON.stringify(q.id)}).hi, BANK.find(b=>b.id===${JSON.stringify(q.id)}))`)); } catch(e){ return true; } });
  assert(svgErrs.length === 0, 'every item renders its diagram: ' + svgErrs.map(q => q.id).join(','));
  const core = bank.filter(q => q.part !== 'challenge');
  assert(w.eval('CORE_SLOTS') === 29, 'blueprint draws 29 core questions per test');
  assert(core.length >= 29, 'core bank has at least 29 questions: ' + core.length);
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
  assert(order.length === 29 && new Set(order).size === 29, 'a test draws 29 distinct core questions');
  assert(/of \d+ questions are new to you/.test(d.getElementById('newCount').textContent), 'setup shows how many questions are new: ' + d.getElementById('newCount').textContent);
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
  assert(rec.bankVersion === w.eval('BANK_VERSION') && JSON.stringify(rec.drawn) === JSON.stringify(order), 'record saves bankVersion and the drawn ids');
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

/* ---- question bank: size, draw rules, no repeats ---- */
{
  const { w, d, errs } = mount();
  const J = s => JSON.parse(w.eval('JSON.stringify(' + s + ')'));
  const bank = J('BANK.map(q=>({id:q.id,part:q.part,area:q.area,family:q.family||null,opts:q.opts}))');
  const bp = J('BLUEPRINT'), chal = w.eval('CHALLENGE_SLOTS');
  Object.entries(Object.assign({}, bp, {challenge: chal})).forEach(([p, n]) => {
    const have = bank.filter(q => q.part === p).length;
    assert(have >= 3*n, `section ${p} has ≥ 3× its ${n} slots: ${have}`);
  });
  const byId = Object.fromEntries(bank.map(q => [q.id, q]));
  let coverOK = true, distinctOK = true, famOK = true, sizeOK = true;
  for(let i = 0; i < 200; i++){
    const ids = J('drawTest([], ' + (i % 2 ? 'true' : 'false') + ').map(q=>q.id)');
    const areas = new Set(ids.map(id => byId[id].area));
    if(![1,2,3,4].every(a => areas.has(a))) coverOK = false;
    if(new Set(ids).size !== ids.length) distinctOK = false;
    const fams = ids.map(id => byId[id].family).filter(Boolean);
    if(new Set(fams).size !== fams.length) famOK = false;
    if(ids.filter(id => byId[id].part !== 'challenge').length !== 29 || ids.filter(id => byId[id].part === 'challenge').length !== (i % 2 ? chal : 0)) sizeOK = false;
  }
  assert(coverOK, '200 random draws all cover written-test rule areas 1, 2, 3 and 4');
  assert(distinctOK, 'no draw repeats a question');
  assert(famOK, 'no draw holds two near-duplicates from one family');
  assert(sizeOK, 'every draw has 29 core (+3 challenge when opted in)');

  // Missed questions come back before ones answered right, once nothing is unseen.
  const hist = [{answers: bank.map((q,i) => ({id:q.id, correct: i % 7 !== 0}))}];
  const missed = new Set(bank.filter((q,i) => i % 7 === 0).map(q => q.id));
  const again = J('drawTest(' + JSON.stringify(hist) + ', false).map(q=>q.id)');
  const perPartMissed = p => bank.filter(q => q.part === p && missed.has(q.id)).length;
  assert(Object.entries(bp).every(([p, n]) => again.filter(id => byId[id].part === p && missed.has(id)).length === Math.min(n, perPartMissed(p))),
    'with nothing unseen, missed questions are drawn first');

  // Five real runs by one student through the page: no core repeats while unseen ones remain.
  d.getElementById('nameInput').value = 'Repeat Tester';
  w.eval('login()');
  const seen = new Set(); let repeatOK = true, newCountOK = true;
  for(let run = 0; run < 5; run++){
    w.eval('showSetup()');
    const unseenBefore = {};
    Object.keys(bp).forEach(p => unseenBefore[p] = bank.filter(q => q.part === p && !seen.has(q.id)).length);
    const shown = d.getElementById('newCount').textContent;
    const fresh = Object.values(unseenBefore).reduce((a,b) => a+b, 0);
    if(!shown.startsWith(fresh + ' of ' + bank.filter(q => q.part !== 'challenge').length)) newCountOK = false;
    w.eval('startQuiz()');
    const ids = J('session.qs.map(x=>x.q.id)');
    Object.entries(bp).forEach(([p, n]) => {
      const drawn = ids.filter(id => byId[id].part === p);
      const repeats = drawn.filter(id => seen.has(id)).length;
      const allowed = Math.max(0, n - unseenBefore[p]);
      if(repeats > allowed){ repeatOK = false; console.error(`   run ${run+1} ${p}: ${repeats} repeats with ${unseenBefore[p]} unseen`); }
    });
    ids.forEach((id, i) => { const q = J(`session.qs[${i}].q.opts`); pick(w, d, i % 3 ? q[0] : q[1]); w.eval('go(1)'); });
    ids.forEach(id => seen.add(id));
  }
  assert(repeatOK, '5 runs by one student repeat no core question while unseen ones remain in that section');
  assert(newCountOK, 'setup counter matches the questions still new to the student');
  const recs = J('TutorStore.app("Repeat Tester","watts-up").history');
  assert(recs.length === 5 && recs.every(r => r.bankVersion && r.drawn.length === 29), 'all 5 runs saved with bankVersion and drawn ids');
  const order1 = J('session.qs.map(x=>x.order.join(""))');
  assert(new Set(order1).size > 1, 'options are reshuffled per question');

  // Challenge never counts in the core score: right on every challenge item, skip every core item.
  d.getElementById('optChallenge').checked = true;
  w.eval('showSetup()'); w.eval('startQuiz()');
  const n = w.eval('session.qs.length');
  for(let i = 0; i < n; i++){ if(w.eval(`session.qs[${i}].q.part`) === 'challenge') pick(w, d, J(`session.qs[${i}].q.opts`)[0]); w.eval('go(1)'); }
  const last = J('TutorStore.app("Repeat Tester","watts-up").history.slice(-1)[0]');
  assert(last.score === 0 && last.total === 29 && last.challengeScore === 3, 'challenge answers do not count in the core score: ' + last.score + '/' + last.total + ' +' + last.challengeScore);
  assert(errs.length === 0, 'no script errors: ' + errs.join(' | '));
}

/* ---- generators: re-solve every generated item with independent brute force ---- */
{
  const { w } = mount();
  const J = s => JSON.parse(w.eval('JSON.stringify(' + s + ')'));
  const NETS = J('NETS');
  const gen = J('GEN');
  // Independent circuit model: contract wires and closed switches into one node (union-find),
  // then relax node voltages (lamps 1 Ω) with the cell holding + at 1 V and − at 0 V.
  function currents(net, removed, pressed){
    const par = {}; const f = x => par[x] === undefined || par[x] === x ? (par[x] = x) : (par[x] = f(par[x]));
    const closed = ([k, name, a, b, t]) => k === 'wire' || (k === 'sw' && ((t === 'no') === pressed.includes(name)));
    net.forEach(e => { f(e[2]); f(e[3]); if(closed(e)) par[f(e[2])] = f(e[3]); });
    f('p'); f('n');
    const lamps = net.filter(e => e[0] === 'lamp' && !removed.includes(e[1]));
    const out = {}; net.filter(e => e[0] === 'lamp').forEach(e => out[e[1]] = 0);
    if(f('p') === f('n')) return out;                           // cell shorted: no lamp lights
    const V = {}; lamps.forEach(e => { V[f(e[2])] = 0.5; V[f(e[3])] = 0.5; }); V[f('p')] = 1; V[f('n')] = 0;
    for(let it = 0; it < 4000; it++) Object.keys(V).forEach(x => {
      if(x === f('p') || x === f('n')) return;
      const nb = lamps.filter(e => f(e[2]) === x || f(e[3]) === x).map(e => f(e[2]) === x ? f(e[3]) : f(e[2]));
      if(nb.length) V[x] = nb.reduce((s, y) => s + V[y], 0) / nb.length;
    });
    lamps.forEach(e => out[e[1]] = Math.abs(V[f(e[2])] - V[f(e[3])]));
    return out;
  }
  const word = (b, a) => a < 0.01 ? 'off' : Math.abs(a - b) <= 0.05 * b ? 'same' : a > b ? 'brighter' : 'dimmer';
  const fail = [];
  gen.forEach(q => {
    const m = q.model, ans = q.opts[0];
    if(new Set(q.opts).size !== 4) fail.push(q.id + ' options');
    if(q.gen === 'remove'){
      const before = currents(NETS[m.d], [], []), after = currents(NETS[m.d], [m.gone], []);
      const rest = Object.keys(before).filter(l => l !== m.gone), lit = rest.filter(l => after[l] > 0.01);
      if(rest.length === 1){
        const wd = word(before[rest[0]], after[rest[0]]);
        const want = {off:'goes out', same:'same brightness', brighter:'gets brighter', dimmer:'gets dimmer'}[wd];
        if(!ans.includes(want)) fail.push(q.id);
      } else {
        const want = lit.length === 0 ? 'None of them' : lit.length === 1 ? 'Only ' + lit[0] : lit.join(' and ');
        if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
      }
    }
    if(q.gen === 'compare'){
      const I = currents(NETS[m.d], [], []), wd = word(I[m.y], I[m.x]);
      const want = {brighter:m.x + ' is brighter', dimmer:m.y + ' is brighter', same:'They are equally bright', off:'Neither lamp is lit'}[wd];
      if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
    }
    if(q.gen === 'alone'){
      const wd = word(1, currents(NETS[m.d], [], [])[m.x]);
      const want = {dimmer:'Dimmer', brighter:'Brighter', same:'About the same', off:'It is off'}[wd];
      if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
    }
    if(q.gen === 'switch'){
      const I = currents(NETS[m.d], [], m.pressed), lit = ['L1','L2'].filter(l => I[l] > 0.01);
      const want = lit.length === 0 ? 'Neither lamp' : lit.length === 1 ? 'Only ' + lit[0] : 'Both L1 and L2';
      if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
    }
    if(q.gen === 'press'){
      // Exactly one option's presses must give the asked-for result.
      const parse = t => t === 'Pressing nothing' ? [] : t === 'Pressing both S1 and S2' ? ['S1','S2'] : [t.match(/S\d/)[0]];
      const good = q.opts.filter(t => (currents(NETS[m.d], [], parse(t))[m.L] > 0.01) === m.wantLit);
      if(good.length !== 1 || good[0] !== ans) fail.push(q.id + ': ' + good.join('/'));
    }
    if(q.gen === 'card'){
      const { pts, truth, rows, targets } = q.card;
      const same = (lab, a, b) => lab[a] === lab[b];
      // Every way to wire the card: give each point a group label.
      const labelings = [];
      (function rec(i, lab){ if(i === pts.length){ labelings.push(Object.assign({}, lab)); return; } for(let g = 0; g < pts.length; g++){ lab[pts[i]] = g; rec(i+1, lab); } })(0, {});
      const fits = labelings.filter(lab => rows.every(([a,b,lit]) => same(lab,a,b) === lit));
      const truthLab = {}; truth.forEach((g,i) => g.forEach(x => truthLab[x] = i));
      if(!rows.every(([a,b,lit]) => same(truthLab,a,b) === lit)) fail.push(q.id + ' table does not match its wiring');
      if(!targets){
        // Full table: the right answer must name exactly the lit pairs; each distractor must disagree with the table.
        const describe = lab => { const gs = {}; pts.forEach(x => (gs[lab[x]] = gs[lab[x]] || []).push(x)); return Object.values(gs).filter(g => g.length > 1).map(g => g.join('')).sort().join(','); };
        const wantDesc = new Set(fits.map(describe));
        if(wantDesc.size !== 1) fail.push(q.id + ' table is ambiguous');
        const optDesc = t => { const out = []; t.split('; ').forEach(s => { if(/are (all )?connected/.test(s) && !/^All/.test(s)) out.push(s.replace(/ are (all )?connected/,'').replace(/,? and |, /g,'').split('').sort().join('')); if(/^All/.test(s)) out.push(pts.join('')); }); return out.sort().join(','); };
        if(optDesc(ans) !== [...wantDesc][0]) fail.push(q.id + ' answer ' + optDesc(ans) + ' vs ' + [...wantDesc][0]);
        q.opts.slice(1).forEach(t => { if(optDesc(t) === [...wantDesc][0]) fail.push(q.id + ' distractor also right: ' + t); });
      } else {
        const outcomes = new Set(fits.map(lab => targets.map(([a,b]) => same(lab,a,b)).join()));
        if(outcomes.size !== 1) fail.push(q.id + ' targets not decided by the table');
        const [r1, r2] = [...outcomes][0].split(',').map(x => x === 'true');
        const P = targets[0].join(' and '), Q = targets[1].join(' and '), wd = x => x ? 'light' : 'stay off';
        const want = r1 === r2 ? 'Both pairs ' + wd(r1) : `${P} ${wd(r1)}; ${Q} ${wd(r2)}`;
        if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
        if(targets.some(([a,b]) => rows.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a)))) fail.push(q.id + ' asks about a pair it already tested');
      }
    }
    if(q.gen === 'tray'){
      const METAL = /aluminum|steel|brass|copper|metal/, BANNED = /graphite|pencil|salt|water|painted/;
      const t = q.tray, isMetal = x => METAL.test(x);
      if(isMetal(t.right) !== (t.want === 'conductor') || t.wrong.some(x => isMetal(x) === (t.want === 'conductor'))) fail.push(q.id + ' tray classification');
      if(q.opts.some(x => BANNED.test(x.toLowerCase()))) fail.push(q.id + ' uses an ambiguous item');
    }
    if(q.gen === 'ohm'){
      const { type, V, R } = q.calc, f = x => String(+x.toFixed(3));
      const want = type === 'current' ? f(V/R) + ' A' : type === 'power' ? f(V*V/R) + ' W' : type === 'series' ? f(2*R) + ' Ω and ' + f(V/(2*R)) + ' A' : f(2*V/R) + ' A';
      if(ans !== want) fail.push(q.id + ': ' + ans + ' vs ' + want);
    }
  });
  const kinds = {}; gen.forEach(q => kinds[q.gen] = (kinds[q.gen] || 0) + 1);
  console.log('   generated: ' + Object.entries(kinds).map(([k,v]) => k + ' ' + v).join(', '));
  assert(gen.length > 0 && fail.length === 0, 'every generated answer matches an independent brute-force solve (' + gen.length + ' items): ' + fail.join(' | '));
  // Sanity checks on the netlists themselves, against what the drawings show.
  const c = (dg, pr) => currents(NETS[dg], [], pr || []);
  const lit = I => Object.keys(I).filter(l => I[l] > 0.01).sort().join(',');
  assert(lit(c('A')) === '' && lit(c('A',['S1'])) === 'L1', 'netlist A: S1 normally open');
  assert(lit(c('D')) === '' && lit(c('R')) === '', 'netlists D and R: shorted cell lights nothing');
  assert(lit(c('F',['S1'])) === 'L1' && lit(c('F',['S1','S2'])) === '', 'netlist F matches f3/f4');
  assert(lit(c('Q')) === 'L1' && lit(c('P')) === 'L1' && lit(c('P',['S1'])) === '', 'netlists Q and P');
  assert(lit(c('E')) === 'L1,L2,L3' && c('E').L1 > c('E').L2, 'netlist E: L1 brightest (e2)');
  // What each drawing shows, read off the picture (not from NETS).
  const near = (a, b) => Math.abs(a - b) < 0.02;
  const J3 = c('J'), K3 = c('K'), Z3 = c('Z');
  assert(near(J3.L1, 1/3) && near(J3.L2, 1/3) && near(J3.L3, 1/3), 'netlist J: three lamps in series');
  assert(near(K3.L1, 1) && near(K3.L2, 1) && near(K3.L3, 1), 'netlist K: three lamps in parallel');
  assert(near(Z3.L1, 0.5) && near(Z3.L2, 0.5) && near(Z3.L3, 1), 'netlist Z: L1+L2 in series, parallel with L3');
  assert(near(c('B').L1, 0.5) && near(c('C').L1, 1), 'netlists B and C');
  assert(lit(c('M',['S1'])) === '' && lit(c('M',['S1','S2'])) === 'L1', 'netlist M: switches in series (AND)');
  assert(lit(c('N')) === '' && lit(c('N',['S1'])) === 'L1' && lit(c('N',['S2'])) === 'L1', 'netlist N: switches in parallel (OR)');
  assert(lit(c('T')) === 'L1' && lit(c('T',['S1'])) === 'L1,L2', 'netlist T: S1 on L2 branch');
  assert(lit(c('U')) === '' && lit(c('U',['S1'])) === 'L1,L2', 'netlist U: S1 on main wire');
  assert(lit(c('V',['S1'])) === 'L1' && lit(c('V',['S2'])) === '' && lit(c('V',['S1','S2'])) === 'L1,L2', 'netlist V');
  assert(lit(c('Y',['S1'])) === 'L1,L2' && lit(c('Y',['S1','S2'])) === 'L1', 'netlist Y: S2 normally closed on L2 branch');
  const ws = J('Object.fromEntries(BANK.filter(q=>!q.gen).map(q=>[q.id,q.opts[0]]))');
  assert(/None/.test(ws.e3) && lit(currents(NETS.E, ['L1'], [])) === '', 'hand-written e3 agrees with the netlist');
  assert(/^L2 stays lit/.test(ws.c3) && lit(currents(NETS.C, ['L1'], [])) === 'L2', 'hand-written c3 agrees with the netlist');
}

console.log(fails ? `\n✗ ${fails} failed` : '\n✓ watts-up: all passed');
process.exit(fails ? 1 : 0);

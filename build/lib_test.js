const fs = require('fs');
const path = require('path');
const T = path.join(__dirname, '..') + path.sep;  // repo root
let fails = 0;
function assert(c,m){ if(!c){ console.error('FAIL:', m); fails++; } else console.log('ok:', m); }

function freshGlobal(seed){
  const mem = Object.assign({}, seed || {});
  const g = { localStorage: {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k,v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; }
  }};
  const lib = fs.readFileSync(T + 'tutor-store.js', 'utf8');
  new Function('window','localStorage', lib + '\n;return window.TutorStore;')(g, g.localStorage);
  return { TS: g.TutorStore, mem };
}

/* --- cross-app sharing, one user, case variants --- */
{
  const { TS, mem } = freshGlobal();
  TS.login('Robin');
  TS.saveResult('Robin', 'panda-math', {pct:92, score:23, total:25, answers:[{qId:1}]});
  TS.saveResult('robin', 'math7',      {pct:85, score:17, total:20, answers:[{qId:1}]});
  TS.saveResult('ROBIN', 'panda-math', {pct:100, score:25, total:25, answers:[{qId:1}]});
  const raw = JSON.parse(mem['tutorApp.v1']);
  assert(Object.keys(raw.users).length === 1, 'Robin/robin/ROBIN = ONE user record');
  assert(raw.users.robin.displayName === 'Robin', 'original casing kept as display name');
  assert(Object.keys(raw.users.robin.apps).sort().join() === 'math7,panda-math', 'both apps under one user');
  assert(TS.app('rOBiN','panda-math').history.length === 2, 'panda history reachable by any casing');
  assert(TS.app('Robin','panda-math').best === 100, 'best score tracked per app');
  assert(TS.app('Robin','math7').best === 85, 'math7 best kept separate from panda best');

  TS.login('Sam');
  TS.saveResult('sam','panda-math',{pct:60, score:15, total:25, answers:[]});
  const lb = TS.allResults('panda-math');
  assert(lb.length === 3, 'leaderboard pulls all players for one app');
  assert(lb.some(r=>r.name==='Robin') && lb.some(r=>r.name==='Sam'), 'leaderboard uses display names');

  // delete one app only
  TS.deleteUser('ROBIN', 'panda-math');
  assert(TS.app('robin','panda-math').history.length === 0, 'panda data deleted');
  assert(TS.app('robin','math7').history.length === 1, 'math7 data untouched by app-scoped delete');
  assert(TS.deleted().length === 1 && TS.deleted()[0].app === 'panda-math', 'deleted data archived, not erased');
  assert(TS.deleted()[0].data.history.length === 2, 'archive retains the full records');
}

/* --- migration from the old pandaMath.v1 store --- */
{
  const old = { users: {
      'Robin': { created:'2026-07-01T00:00:00Z', best:88, history:[{pct:88, score:22, total:25}] },
      'robin': { created:'2026-07-02T00:00:00Z', best:92, history:[{pct:92, score:23, total:25}] }
    }, deleted: [{name:'Old', deletedAt:'2026-07-03T00:00:00Z', data:{history:[], best:0}}] };
  const { TS, mem } = freshGlobal({ 'pandaMath.v1': JSON.stringify(old) });
  const raw = JSON.parse(mem['tutorApp.v1']);
  assert(Object.keys(raw.users).length === 1, 'old case-variant users merged into one');
  assert(TS.app('Robin','panda-math').history.length === 2, 'both old histories preserved');
  assert(TS.app('Robin','panda-math').best === 92, 'best score carried over');
  assert(TS.deleted().length === 1, 'old archive carried over');
  assert(mem['pandaMath.v1'] === undefined, 'old store cleaned up after migration');
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nALL LIBRARY CHECKS PASSED');
process.exitCode = fails ? 1 : 0;

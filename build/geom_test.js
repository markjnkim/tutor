const { JSDOM } = require('jsdom');
const fs = require('fs'); const path = require('path');
const T = path.join(__dirname,'..') + path.sep;
let fails=0; const A=(c,m)=>{ if(!c){console.error('FAIL:',m);fails++;} else console.log('ok:',m); };
const LIB=fs.readFileSync(T+'tutor-store.js','utf8'), NAV=fs.readFileSync(T+'tutor-nav.js','utf8');
function mount(f){
  let h=fs.readFileSync(T+f,'utf8');
  h=h.split(h.match(/<script src="[^"]*tutor-store\.js"><\/script>/)[0]).join('<script>'+LIB+'<'+'/script>');
  const n=h.match(/<script src="[^"]*tutor-nav\.js"><\/script>/); if(n) h=h.split(n[0]).join('<script>'+NAV+'<'+'/script>');
  const errs=[];
  const d=new JSDOM(h,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+f,
    beforeParse(w){ w.alert=()=>{}; w.scrollTo=()=>{};
      w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='globalAlpha'?1:(()=>{})});
      w.addEventListener('error',e=>errs.push(e.message)); }});
  return {w:d.window,d:d.window.document,errs};
}
(async()=>{
const {w,d,errs}=mount('geometry.html');
A(w.eval('CURRICULUM.length')===12,'12 lessons loaded');
A(d.getElementById('login')!==null,'login gate present');

// every lesson well-formed
const bad=w.eval(`JSON.stringify(CURRICULUM.filter(l=>!l.id||!l.name||!l.big||!l.steps.length||l.quiz.length<4).map(l=>l.id))`);
A(bad==='[]','every lesson has id, name, big idea, steps and 4+ quiz questions — '+bad);
const badq=w.eval(`JSON.stringify(CURRICULUM.flatMap(l=>l.quiz.filter(q=>q.answer<0||q.answer>=q.choices.length||!q.why||new Set(q.choices).size!==q.choices.length).map(q=>l.id+':'+q.q)))`);
A(badq==='[]','every quiz answer index valid, has an explanation, no duplicate choices — '+badq);
const svgN=w.eval(`CURRICULUM.flatMap(l=>l.steps).filter(s=>s.svg&&s.svg.indexOf('<svg')===0).length`);
const stepN=w.eval(`CURRICULUM.flatMap(l=>l.steps).length`);
A(svgN===stepN,`all ${stepN} teaching steps carry a diagram (${svgN} with SVG)`);
const qsvg=w.eval(`CURRICULUM.flatMap(l=>l.quiz).filter(q=>q.svg&&q.svg.length).length`);
A(qsvg>=20,`${qsvg} quiz questions are illustrated too`);

d.getElementById('nameIn').value='Robin'; w.eval('login()');
A(d.getElementById('login').style.display==='none','login works');
A(d.querySelectorAll('#mapBody .node').length===12,'map shows 12 stops');
A(d.querySelectorAll('#mapBody .node.locked').length===11,'only the first stop is unlocked at the start');

// walk lesson 1 and ace it
w.eval('openLesson(0)');
A(d.getElementById('s-lesson').classList.contains('on'),'lesson screen opens');
A(d.getElementById('lsFig').innerHTML.includes('<svg'),'diagram rendered in the lesson');
const steps=w.eval('CURRICULUM[0].steps.length');
for(let i=0;i<steps;i++) w.eval('stepNext()');
A(d.getElementById('s-quiz').classList.contains('on'),'last step leads into practice');
const nq=w.eval('CURRICULUM[0].quiz.length');
for(let i=0;i<nq;i++){
  const ans=w.eval(`CURRICULUM[0].quiz[${i}].answer`);
  d.querySelector(`input[name=ch][value='${ans}']`).checked=true;
  w.eval('checkAnswer()');
  if(i<nq-1) w.eval('quizNext()');
}
w.eval('finishLesson()');
A(d.getElementById('s-result').classList.contains('on'),'result screen shown');
const rec=w.TutorStore.app('robin','geometry').history[0];
A(rec.subject==='Geometry'&&rec.pct===100,'perfect run recorded: '+rec.pct+'%');
A(rec.answers.length===nq,'per-question detail saved');
A(w.eval('S.done.length')===1,'stop marked complete');
A(w.eval('S.stars')===3,'stars awarded: '+w.eval('S.stars'));
w.eval('go("map")');
A(d.querySelectorAll('#mapBody .node.locked').length===10,'next stop unlocked');

// failing run must NOT unlock
w.eval('openLesson(1)');
const n2=w.eval('CURRICULUM[1].quiz.length');
w.eval('startQuiz()');
for(let i=0;i<n2;i++){
  const ans=w.eval(`CURRICULUM[1].quiz[${i}].answer`);
  const wrong=(ans+1)%w.eval(`CURRICULUM[1].quiz[${i}].choices.length`);
  d.querySelector(`input[name=ch][value='${wrong}']`).checked=true;
  w.eval('checkAnswer()');
  if(i<n2-1) w.eval('quizNext()');
}
w.eval('finishLesson()');
A(w.eval('S.done.length')===1,'failing a stop does not mark it complete');
A(d.getElementById('rReview').querySelectorAll('.why').length===n2,'all misses appear in review');

A(errs.length===0,'no JS errors ('+errs.join(';')+')');
const links=[...d.querySelectorAll('#tnav a')].map(a=>a.getAttribute('href'));
A(links.includes('panda-math.html')&&links.length===8,'sidebar lists 8 destinations including geometry');
console.log(fails?`\n${fails} FAILURE(S)`:'\nALL GEOMETRY CHECKS PASSED');
process.exit(fails?1:0);
})();

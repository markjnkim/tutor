/* ============================================================
   TYPING CURRICULUM — "The Wind Courier"

   A studio-Ghibli-flavoured journey: you are a young courier
   carrying letters across a valley, and every lesson is a leg of
   the trip. Fundamentals first (home row, eyes on screen), then
   rote drills, then the real test — typing from the ear alone.

   mode:
     'see'   text is shown on screen; copy it
     'hear'  text is spoken aloud only; type what you hear
     'both'  spoken AND shown — the bridge between the two

   Each lesson: id, icon, chapter, name, blurb, keys (finger hint),
   mode, and lines[] to type.
   ============================================================ */
const CURRICULUM = [

/* ══════ CHAPTER 1 · THE HOME ROW ══════ */
{ id:'t1', icon:'🌾', chapter:'Chapter 1 · Leaving the Valley', name:'Finding Home Row',
  mode:'see', keys:'asdf jkl;',
  blurb:'Rest your left fingers on <b>a s d f</b> and your right on <b>j k l ;</b>. Feel the little bumps on F and J — those are your anchors. You never have to look down again.',
  lines:['asdf jkl;','asdf jkl; asdf jkl;','aaa sss ddd fff','jjj kkk lll ;;;','asdf jkl; fdsa ;lkj'] },

{ id:'t2', icon:'🍃', chapter:'Chapter 1 · Leaving the Valley', name:'Home Row Words',
  mode:'see', keys:'asdf jkl; + g h',
  blurb:'Stretch your index fingers to <b>g</b> and <b>h</b> without moving your hands. Now real words appear.',
  lines:['dad sad lad had','gash lash flask','a lad had a flask','all glad lads dash','half a flask; a glad dad'] },

{ id:'t3', icon:'🌤️', chapter:'Chapter 1 · Leaving the Valley', name:'The Top Row',
  mode:'see', keys:'qwerty uiop',
  blurb:'Reach <b>up</b> and come straight back to home row. Your fingers should always return to the bumps.',
  lines:['the quiet trees','we料 wait for the wind'.replace('料',''),'type our route here','power the little kite','a quiet purple twilight'] },

{ id:'t4', icon:'🌱', chapter:'Chapter 1 · Leaving the Valley', name:'The Bottom Row',
  mode:'see', keys:'zxcv bnm',
  blurb:'Reach <b>down</b>, then home again. Bottom row is the trickiest — go slowly and let accuracy lead.',
  lines:['zinc box vibe','many brave cats','move the van back','a calm brown mouse','climb, then breathe' ] },

/* ══════ CHAPTER 2 · ROTE PRACTICE ══════ */
{ id:'t5', icon:'🌸', chapter:'Chapter 2 · The Long Road', name:'Whole Alphabet',
  mode:'see', keys:'all letters',
  blurb:'Every letter now. These sentences use the full alphabet — pangrams, the classic way to practise.',
  lines:['the quick brown fox jumps over the lazy dog',
         'pack my box with five dozen liquid jugs',
         'sphinx of black quartz, judge my vow',
         'how vexingly quick daft zebras jump'] },

{ id:'t6', icon:'☁️', chapter:'Chapter 2 · The Long Road', name:'Capitals & Punctuation',
  mode:'see', keys:'shift , . ! ?',
  blurb:'Hold <b>shift</b> with the opposite hand from the letter. Left shift for right-hand letters, right shift for left-hand ones.',
  lines:['The wind is rising.','Have you packed the letters?','Mei ran, then stopped.','What a bright, clear morning!',
         'Slow down. Breathe. Begin again.'] },

{ id:'t7', icon:'🏮', chapter:'Chapter 2 · The Long Road', name:'Numbers & Symbols',
  mode:'see', keys:'1234567890',
  blurb:'The number row is a long reach. Keep your wrists still and let the fingers travel.',
  lines:['12 letters, 3 parcels','room 47, floor 2','the 9:15 train','pay 8 coins for 6 apples','1 kite, 2 strings, 30 metres'] },

{ id:'t8', icon:'🌊', chapter:'Chapter 2 · The Long Road', name:'Common Words, Fast',
  mode:'see', keys:'speed drill',
  blurb:'These are the most common words in English. Typing them without thinking is how speed is built.',
  lines:['the and that have with this from they',
         'when what your which their would there',
         'about could other after first never',
         'because through between another'] },

/* ══════ CHAPTER 3 · LISTEN AND TYPE ══════ */
{ id:'t9', icon:'🔔', chapter:'Chapter 3 · Carrying the Message', name:'Listen, See, Type',
  mode:'both', keys:'ears + eyes',
  blurb:'Now the courier bell rings. You will <b>hear</b> each line and also see it. Listen first, then type — get used to the sound leading your hands.',
  lines:['the wind carries the letter','a small bird follows the path',
         'the river bends to the east','warm bread and cold water','the lantern stays lit'] },

{ id:'t10', icon:'🎐', chapter:'Chapter 3 · Carrying the Message', name:'Short Lines by Ear',
  mode:'hear', keys:'ears only',
  blurb:'The text is hidden now. Listen to the line and type what you hear. Press <b>replay</b> as many times as you need — no penalty.',
  lines:['open the window','the sky turns gold','she waits by the gate','follow the quiet road','the cat sleeps'] },

{ id:'t11', icon:'🌙', chapter:'Chapter 3 · Carrying the Message', name:'Longer Lines by Ear',
  mode:'hear', keys:'ears only',
  blurb:'Longer messages now. Hold the whole line in your head before you start, then type it in one flow.',
  lines:['the courier climbed the hill before dawn',
         'a letter can travel further than a person',
         'the forest was quiet and full of light',
         'she folded the paper and tied it with string'] },

{ id:'t12', icon:'🕊️', chapter:'Chapter 3 · Carrying the Message', name:'The Final Delivery',
  mode:'hear', keys:'everything',
  blurb:'The last leg. Full sentences with capitals and punctuation, by ear alone. You have carried the message all the way home.',
  lines:['The wind was kind that morning.',
         'She left the letter on the wooden table.',
         'Thank you for carrying it so far!',
         'Every journey begins with one quiet step.'] }
];

/* Cheering companions who appear in the margins as you type. */
const COMPANIONS = ['🦊','🐰','🦉','🐿️','🦋','🐸','🦔','🐦','🐻','🦌','🐱','🌾'];

const CHEERS = [
  'Beautiful!','Keep going!','You are flying!','So steady!','Lovely rhythm!',
  'The wind is with you!','Almost there!','Look at you go!','Perfect touch!','Nearly home!'
];

const REST_TIPS = [
  'Sit tall — shoulders down, wrists floating.',
  'Eyes on the screen, never on your hands.',
  'Accuracy first. Speed follows on its own.',
  'Feel for the bumps on F and J to find home.',
  'Breathe. A calm typist is a fast typist.',
  'Mistakes are fine. Fix and carry on.'
];

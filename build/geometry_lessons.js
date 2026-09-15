/* ============================================================
   GEOMETRY CURRICULUM — 12 lessons, basics to pre-Geometry bridge.

   Every concept is illustrated. Diagrams are inline SVG so the app
   stays a single portable file with no image assets and no CDN.

   Each lesson:
     id, icon, unit, name, big  — identity and the one-line idea
     steps[]  — teaching cards: { svg, title, text }
     quiz[]   — practice: { svg, q, choices, answer, why }

   SVG convention: viewBox "0 0 320 200", stroke via currentColor-ish
   named classes defined in the app stylesheet, so diagrams inherit
   the theme instead of hardcoding colors.
   ============================================================ */
const CURRICULUM = [

/* ─────────── UNIT 1 · BUILDING BLOCKS ─────────── */
{
 id:'g1', icon:'📍', unit:'Unit 1 · Building Blocks', name:'Points, Lines & Rays',
 big:'Everything in geometry is built from a point, a straight path, and how far that path goes.',
 steps:[
  {title:'A point marks a position',
   text:'A point has no size at all — no width, no height. It only says <b>where</b>. We draw it as a dot and name it with a capital letter.',
   svg:`<svg viewBox="0 0 320 140"><circle class="pt" cx="80" cy="70" r="5"/><text class="lbl" x="72" y="55">A</text>
        <circle class="pt" cx="180" cy="95" r="5"/><text class="lbl" x="172" y="80">B</text>
        <circle class="pt" cx="250" cy="45" r="5"/><text class="lbl" x="242" y="32">C</text></svg>`},
  {title:'A line goes forever both ways',
   text:'A <b>line</b> never ends. The arrows on each side mean it keeps going. Two points name it: this is line AB.',
   svg:`<svg viewBox="0 0 320 140"><defs><marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="fill" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>
        <line class="ln" x1="30" y1="70" x2="290" y2="70" marker-start="url(#ar)" marker-end="url(#ar)"/>
        <circle class="pt" cx="110" cy="70" r="5"/><text class="lbl" x="103" y="58">A</text>
        <circle class="pt" cx="210" cy="70" r="5"/><text class="lbl" x="203" y="58">B</text></svg>`},
  {title:'A segment has two endpoints',
   text:'A <b>segment</b> is the piece between two points. It has a definite length you can measure. This is segment AB.',
   svg:`<svg viewBox="0 0 320 140"><line class="ln" x1="90" y1="70" x2="230" y2="70"/>
        <circle class="pt" cx="90" cy="70" r="5"/><text class="lbl" x="83" y="58">A</text>
        <circle class="pt" cx="230" cy="70" r="5"/><text class="lbl" x="223" y="58">B</text>
        <text class="dim" x="145" y="95">length</text></svg>`},
  {title:'A ray starts and never stops',
   text:'A <b>ray</b> has one endpoint and goes forever the other way — like a beam from a flashlight. Name the endpoint first: ray AB.',
   svg:`<svg viewBox="0 0 320 140"><defs><marker id="ar2" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="fill" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>
        <line class="ln" x1="90" y1="70" x2="290" y2="70" marker-end="url(#ar2)"/>
        <circle class="pt" cx="90" cy="70" r="5"/><text class="lbl" x="83" y="58">A</text>
        <circle class="pt" cx="180" cy="70" r="5"/><text class="lbl" x="173" y="58">B</text></svg>`}
 ],
 quiz:[
  {q:'Which one has exactly two endpoints?', choices:['A segment','A line','A ray','A point'], answer:0,
   why:'A segment stops at both ends, so it has two endpoints and a measurable length.',
   svg:`<svg viewBox="0 0 320 110"><line class="ln" x1="90" y1="55" x2="230" y2="55"/><circle class="pt" cx="90" cy="55" r="5"/><circle class="pt" cx="230" cy="55" r="5"/></svg>`},
  {q:'What is shown in the diagram?', choices:['A ray','A line','A segment','A point'], answer:0,
   why:'One endpoint plus an arrow on the other end means it goes forever in one direction — that is a ray.',
   svg:`<svg viewBox="0 0 320 110"><defs><marker id="q1" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="fill" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>
        <line class="ln" x1="80" y1="55" x2="280" y2="55" marker-end="url(#q1)"/><circle class="pt" cx="80" cy="55" r="5"/></svg>`},
  {q:'How many endpoints does a line have?', choices:['None — it goes on forever','One','Two','It depends on how long it is'], answer:0,
   why:'A line extends without end in both directions, shown by arrows on both sides. It has no endpoints.',
   svg:`<svg viewBox="0 0 320 110"><defs><marker id="q2" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="fill" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>
        <line class="ln" x1="30" y1="55" x2="290" y2="55" marker-start="url(#q2)" marker-end="url(#q2)"/></svg>`},
  {q:'A point has which of these?', choices:['Only a position','A length','A width','An area'], answer:0,
   why:'A point has no size in any direction. It only tells you where something is.', svg:''}
 ]
},

{
 id:'g2', icon:'📐', unit:'Unit 1 · Building Blocks', name:'Angles & Measuring',
 big:'An angle is the amount of turn between two rays that share an endpoint.',
 steps:[
  {title:'Two rays, one corner',
   text:'When two rays share an endpoint, they form an <b>angle</b>. The shared point is the <b>vertex</b>. We measure the opening in <b>degrees</b>.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="70" y1="130" x2="270" y2="130"/><line class="ln" x1="70" y1="130" x2="215" y2="35"/>
        <path class="arc" d="M120,130 A50,50 0 0,0 104,101"/><text class="lbl" x="128" y="115">40°</text>
        <circle class="pt" cx="70" cy="130" r="5"/><text class="lbl" x="52" y="146">vertex</text></svg>`},
  {title:'A right angle is exactly 90°',
   text:'A <b>right angle</b> is a perfect corner — like the corner of a page. We mark it with a small square instead of an arc.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="90" y1="130" x2="250" y2="130"/><line class="ln" x1="90" y1="130" x2="90" y2="30"/>
        <path class="sq" d="M90,112 L108,112 L108,130"/><text class="lbl" x="120" y="112">90°</text></svg>`},
  {title:'Smaller than 90° is acute',
   text:'An <b>acute</b> angle is a narrow opening — anything less than 90°. Think "a cute little angle".',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="70" y1="130" x2="270" y2="130"/><line class="ln" x1="70" y1="130" x2="240" y2="65"/>
        <path class="arc" d="M130,130 A60,60 0 0,0 125,108"/><text class="lbl" x="140" y="120">35°</text></svg>`},
  {title:'Bigger than 90° is obtuse',
   text:'An <b>obtuse</b> angle leans back past the square corner — more than 90° but less than 180°. At exactly 180° the rays form a straight line.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="70" y1="130" x2="270" y2="130"/><line class="ln" x1="70" y1="130" x2="10" y2="45"/>
        <path class="arc" d="M130,130 A60,60 0 0,0 36,86"/><text class="lbl" x="95" y="90">125°</text></svg>`}
 ],
 quiz:[
  {q:'What type of angle is shown?', choices:['Acute','Right','Obtuse','Straight'], answer:2,
   why:'The opening is clearly wider than a square corner but has not flattened into a line, so it is obtuse (between 90° and 180°).',
   svg:`<svg viewBox="0 0 320 130"><line class="ln" x1="70" y1="105" x2="270" y2="105"/><line class="ln" x1="70" y1="105" x2="20" y2="30"/><path class="arc" d="M125,105 A55,55 0 0,0 42,66"/></svg>`},
  {q:'What type of angle is shown?', choices:['Right','Acute','Obtuse','Straight'], answer:0,
   why:'The small square at the vertex is the symbol for a right angle — exactly 90°.',
   svg:`<svg viewBox="0 0 320 130"><line class="ln" x1="90" y1="105" x2="250" y2="105"/><line class="ln" x1="90" y1="105" x2="90" y2="20"/><path class="sq" d="M90,87 L108,87 L108,105"/></svg>`},
  {q:'An angle measures 180°. What is it called?', choices:['A straight angle','A right angle','An obtuse angle','A full turn'], answer:0,
   why:'At 180° the two rays point in opposite directions and form a straight line. That is a straight angle.',
   svg:`<svg viewBox="0 0 320 110"><line class="ln" x1="40" y1="60" x2="280" y2="60"/><circle class="pt" cx="160" cy="60" r="5"/><path class="arc" d="M110,60 A50,50 0 0,1 210,60"/></svg>`},
  {q:'Which angle measure is acute?', choices:['62°','90°','118°','180°'], answer:0,
   why:'Acute means less than 90°. Only 62° qualifies.', svg:''}
 ]
},

{
 id:'g3', icon:'🔗', unit:'Unit 1 · Building Blocks', name:'Angle Pairs',
 big:'Angles that sit together in special ways have measures that are locked to each other.',
 steps:[
  {title:'Complementary angles add to 90°',
   text:'Two angles that together make a right angle are <b>complementary</b>. If one is 30°, the other must be 60°.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="80" y1="130" x2="250" y2="130"/><line class="ln" x1="80" y1="130" x2="80" y2="30"/>
        <line class="ln2" x1="80" y1="130" x2="190" y2="55"/>
        <text class="lbl" x="118" y="122">30°</text><text class="lbl" x="92" y="80">60°</text>
        <path class="sq" d="M80,112 L98,112 L98,130"/></svg>`},
  {title:'Supplementary angles add to 180°',
   text:'Two angles that together make a straight line are <b>supplementary</b>. If one is 125°, the other is 55°.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="40" y1="110" x2="280" y2="110"/><line class="ln2" x1="160" y1="110" x2="90" y2="35"/>
        <circle class="pt" cx="160" cy="110" r="4"/>
        <text class="lbl" x="105" y="98">125°</text><text class="lbl" x="185" y="100">55°</text></svg>`},
  {title:'Vertical angles are equal',
   text:'When two lines cross, the angles <b>opposite</b> each other are equal. They are called vertical angles — and this holds no matter how the lines are tilted.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="40" y1="40" x2="280" y2="130"/><line class="ln" x1="40" y1="130" x2="280" y2="40"/>
        <circle class="pt" cx="160" cy="85" r="4"/>
        <text class="lbl hi" x="150" y="45">a</text><text class="lbl hi" x="150" y="135">a</text>
        <text class="lbl" x="80" y="90">b</text><text class="lbl" x="230" y="90">b</text></svg>`},
  {title:'Why vertical angles must match',
   text:'Angle a and angle b sit on a straight line, so a + b = 180°. The other pair does too. Both equal 180° − b, so the opposite angles have to be the same. That is a tiny <b>proof</b>.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="40" y1="40" x2="280" y2="130"/><line class="ln" x1="40" y1="130" x2="280" y2="40"/>
        <text class="lbl hi" x="150" y="45">a</text><text class="lbl" x="230" y="90">b</text>
        <text class="dim" x="60" y="160">a + b = 180°, so a = 180° − b</text></svg>`}
 ],
 quiz:[
  {q:'Two angles are complementary. One is 25°. What is the other?', choices:['65°','75°','155°','25°'], answer:0,
   why:'Complementary angles add to 90°. 90 − 25 = 65°.', svg:''},
  {q:'Two angles are supplementary. One is 110°. What is the other?', choices:['70°','80°','250°','110°'], answer:0,
   why:'Supplementary angles add to 180°. 180 − 110 = 70°.', svg:''},
  {q:'In the diagram, angle a is 65°. What is angle c?', choices:['65°','115°','25°','130°'], answer:0,
   why:'Angles a and c are vertical angles — they sit opposite each other where the lines cross — so they are equal.',
   svg:`<svg viewBox="0 0 320 150"><line class="ln" x1="40" y1="30" x2="280" y2="120"/><line class="ln" x1="40" y1="120" x2="280" y2="30"/>
        <text class="lbl hi" x="150" y="38">a</text><text class="lbl hi" x="150" y="128">c</text>
        <text class="lbl" x="80" y="80">b</text><text class="lbl" x="230" y="80">d</text></svg>`},
  {q:'In that same diagram, if a = 65°, what is b?', choices:['115°','65°','25°','90°'], answer:0,
   why:'Angles a and b sit together on a straight line, so they are supplementary: 180 − 65 = 115°.',
   svg:`<svg viewBox="0 0 320 150"><line class="ln" x1="40" y1="30" x2="280" y2="120"/><line class="ln" x1="40" y1="120" x2="280" y2="30"/>
        <text class="lbl hi" x="150" y="38">a</text><text class="lbl hi" x="80" y="80">b</text></svg>`}
 ]
},

/* ─────────── UNIT 2 · PARALLEL LINES ─────────── */
{
 id:'g4', icon:'🛤️', unit:'Unit 2 · Parallel Lines', name:'Parallel Lines & Transversals',
 big:'When one line crosses two parallel lines, every angle formed is either equal to a given angle or supplementary to it.',
 steps:[
  {title:'Parallel lines never meet',
   text:'<b>Parallel</b> lines run in the same direction forever, always the same distance apart. Arrowheads on the lines mark them as parallel.',
   svg:`<svg viewBox="0 0 320 150"><line class="ln" x1="30" y1="55" x2="290" y2="55"/><line class="ln" x1="30" y1="110" x2="290" y2="110"/>
        <path class="fill" d="M150,50 l10,5 l-10,5 z"/><path class="fill" d="M150,105 l10,5 l-10,5 z"/>
        <text class="dim" x="120" y="35">always the same gap</text></svg>`},
  {title:'A transversal cuts across',
   text:'A <b>transversal</b> is a line that crosses both parallel lines. It creates eight angles — four at each crossing.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="30" y1="60" x2="290" y2="60"/><line class="ln" x1="30" y1="125" x2="290" y2="125"/>
        <line class="ln2" x1="90" y1="20" x2="230" y2="165"/>
        <text class="lbl" x="120" y="50">1</text><text class="lbl" x="152" y="50">2</text>
        <text class="lbl" x="118" y="80">3</text><text class="lbl" x="152" y="80">4</text>
        <text class="lbl" x="185" y="115">5</text><text class="lbl" x="217" y="115">6</text>
        <text class="lbl" x="183" y="145">7</text><text class="lbl" x="217" y="145">8</text></svg>`},
  {title:'Corresponding angles are equal',
   text:'Angles in <b>matching corners</b> at each crossing are equal. Think of sliding one crossing down onto the other — they line up exactly.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="30" y1="60" x2="290" y2="60"/><line class="ln" x1="30" y1="125" x2="290" y2="125"/>
        <line class="ln2" x1="90" y1="20" x2="230" y2="165"/>
        <text class="lbl hi" x="152" y="50">a</text><text class="lbl hi" x="217" y="115">a</text>
        <text class="dim" x="40" y="160">same corner, same measure</text></svg>`},
  {title:'Alternate interior angles are equal',
   text:'Angles <b>between</b> the parallel lines on <b>opposite</b> sides of the transversal are equal. They make a Z shape.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="30" y1="60" x2="290" y2="60"/><line class="ln" x1="30" y1="125" x2="290" y2="125"/>
        <line class="ln2" x1="90" y1="20" x2="230" y2="165"/>
        <text class="lbl hi" x="152" y="80">b</text><text class="lbl hi" x="183" y="115">b</text>
        <path class="zig" d="M175,60 L120,60 M120,60 L200,125 M200,125 L145,125"/></svg>`},
  {title:'Co-interior angles add to 180°',
   text:'Angles between the parallel lines on the <b>same</b> side of the transversal are supplementary. They make a C shape.',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="30" y1="60" x2="290" y2="60"/><line class="ln" x1="30" y1="125" x2="290" y2="125"/>
        <line class="ln2" x1="90" y1="20" x2="230" y2="165"/>
        <text class="lbl hi" x="152" y="80">c</text><text class="lbl hi" x="217" y="115">d</text>
        <text class="dim" x="60" y="160">c + d = 180°</text></svg>`}
 ],
 quiz:[
  {q:'The two horizontal lines are parallel. Angle a = 72°. What is angle b?', choices:['72°','108°','18°','144°'], answer:0,
   why:'a and b are corresponding angles — same corner at each crossing — so they are equal: 72°.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="30" y1="55" x2="290" y2="55"/><line class="ln" x1="30" y1="120" x2="290" y2="120"/>
        <line class="ln2" x1="90" y1="18" x2="230" y2="158"/>
        <text class="lbl hi" x="152" y="45">a</text><text class="lbl hi" x="217" y="110">b</text></svg>`},
  {q:'The lines are parallel. Angle p = 118°. What is angle q?', choices:['118°','62°','32°','180°'], answer:0,
   why:'p and q are alternate interior angles — between the parallels, opposite sides of the transversal — so they are equal.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="30" y1="55" x2="290" y2="55"/><line class="ln" x1="30" y1="120" x2="290" y2="120"/>
        <line class="ln2" x1="90" y1="18" x2="230" y2="158"/>
        <text class="lbl hi" x="150" y="75">p</text><text class="lbl hi" x="185" y="110">q</text></svg>`},
  {q:'The lines are parallel. Angle m = 105°. What is angle n?', choices:['75°','105°','15°','195°'], answer:0,
   why:'m and n are co-interior (same-side interior) angles, so they add to 180°. 180 − 105 = 75°.',
   svg:`<svg viewBox="0 0 320 160"><line class="ln" x1="30" y1="55" x2="290" y2="55"/><line class="ln" x1="30" y1="120" x2="290" y2="120"/>
        <line class="ln2" x1="90" y1="18" x2="230" y2="158"/>
        <text class="lbl hi" x="150" y="75">m</text><text class="lbl hi" x="215" y="110">n</text></svg>`},
  {q:'Which pair of angles is NOT always equal when a transversal crosses parallel lines?',
   choices:['Co-interior angles','Corresponding angles','Alternate interior angles','Vertical angles'], answer:0,
   why:'Co-interior angles add to 180° rather than being equal. They are only equal in the special case where both are 90°.', svg:''}
 ]
},

/* ─────────── UNIT 3 · SHAPES ─────────── */
{
 id:'g5', icon:'🔺', unit:'Unit 3 · Shapes', name:'Triangles',
 big:'The three angles inside any triangle always add to 180° — no exceptions.',
 steps:[
  {title:'Naming triangles by their sides',
   text:'<b>Equilateral</b>: all three sides equal. <b>Isosceles</b>: two sides equal. <b>Scalene</b>: all three different. Tick marks show which sides match.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="45,120 105,120 75,55"/>
        <polygon class="shp" points="130,120 190,120 160,50"/><polygon class="shp" points="215,120 290,120 245,60"/>
        <text class="dim" x="42" y="140">equilateral</text><text class="dim" x="133" y="140">isosceles</text><text class="dim" x="228" y="140">scalene</text></svg>`},
  {title:'Naming triangles by their angles',
   text:'<b>Acute</b>: every angle under 90°. <b>Right</b>: one angle exactly 90°. <b>Obtuse</b>: one angle over 90°. A triangle can only ever have one right or obtuse angle.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="40,120 100,120 70,60"/>
        <polygon class="shp" points="130,120 195,120 130,55"/><path class="sq" d="M130,105 L145,105 L145,120"/>
        <polygon class="shp" points="215,120 300,120 235,80"/>
        <text class="dim" x="52" y="140">acute</text><text class="dim" x="148" y="140">right</text><text class="dim" x="238" y="140">obtuse</text></svg>`},
  {title:'The angles always total 180°',
   text:'Tear off the three corners of any paper triangle and line them up — they form a straight line every time. That is 180°.',
   svg:`<svg viewBox="0 0 320 170"><polygon class="shp" points="50,120 200,120 130,45"/>
        <text class="lbl" x="62" y="112">a</text><text class="lbl" x="178" y="112">b</text><text class="lbl" x="124" y="70">c</text>
        <line class="ln" x1="215" y1="120" x2="300" y2="120"/>
        <text class="dim" x="212" y="145">a + b + c = 180°</text></svg>`},
  {title:'Finding a missing angle',
   text:'If you know two angles, subtract from 180° to get the third. Here: 180 − 70 − 55 = <b>55°</b>.',
   svg:`<svg viewBox="0 0 320 160"><polygon class="shp" points="55,125 235,125 120,45"/>
        <text class="lbl" x="70" y="117">70°</text><text class="lbl" x="195" y="117">55°</text><text class="lbl hi" x="112" y="70">?</text></svg>`}
 ],
 quiz:[
  {q:'Two angles of a triangle are 40° and 75°. What is the third?', choices:['65°','75°','115°','45°'], answer:0,
   why:'The three angles total 180°. 180 − 40 − 75 = 65°.',
   svg:`<svg viewBox="0 0 320 140"><polygon class="shp" points="50,115 240,115 130,40"/><text class="lbl" x="65" y="107">40°</text><text class="lbl" x="200" y="107">75°</text><text class="lbl hi" x="122" y="65">?</text></svg>`},
  {q:'A triangle has sides of 5 cm, 5 cm and 8 cm. What kind is it?', choices:['Isosceles','Equilateral','Scalene','Right'], answer:0,
   why:'Exactly two sides are equal, which makes it isosceles.',
   svg:`<svg viewBox="0 0 320 130"><polygon class="shp" points="100,105 220,105 160,40"/><text class="dim" x="88" y="75">5</text><text class="dim" x="222" y="75">5</text><text class="dim" x="155" y="122">8</text></svg>`},
  {q:'Can a triangle have two right angles?', choices:['No — the third angle would have to be 0°','Yes, if it is large enough','Yes, if it is isosceles','Only on a curved surface'], answer:0,
   why:'Two right angles already use up 90 + 90 = 180°, leaving nothing for the third angle. So it is impossible in a flat triangle.', svg:''},
  {q:'Every angle in an equilateral triangle measures what?', choices:['60°','45°','90°','30°'], answer:0,
   why:'All three angles are equal and must total 180°, so each is 180 ÷ 3 = 60°.',
   svg:`<svg viewBox="0 0 320 130"><polygon class="shp" points="115,105 205,105 160,30"/><text class="lbl" x="122" y="97">60°</text><text class="lbl" x="180" y="97">60°</text><text class="lbl" x="150" y="55">60°</text></svg>`}
 ]
},

{
 id:'g6', icon:'⬜', unit:'Unit 3 · Shapes', name:'Quadrilaterals',
 big:'Four-sided shapes form a family, and each member adds one more restriction.',
 steps:[
  {title:'Four sides, 360° inside',
   text:'Any four-sided shape is a <b>quadrilateral</b>. Split it into two triangles and you see why its angles total 2 × 180° = <b>360°</b>.',
   svg:`<svg viewBox="0 0 320 160"><polygon class="shp" points="60,40 250,55 225,130 45,120"/>
        <line class="ln2" x1="60" y1="40" x2="225" y2="130"/>
        <text class="dim" x="95" y="150">two triangles → 360°</text></svg>`},
  {title:'Trapezoid: one pair of parallel sides',
   text:'A <b>trapezoid</b> has at least one pair of parallel sides. That is its only requirement.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="90,110 240,110 205,45 120,45"/>
        <path class="fill" d="M160,40 l9,5 l-9,5 z"/><path class="fill" d="M160,105 l9,5 l-9,5 z"/></svg>`},
  {title:'Parallelogram: both pairs parallel',
   text:'A <b>parallelogram</b> has two pairs of parallel sides. Opposite sides are equal and opposite angles are equal.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="70,110 200,110 250,45 120,45"/>
        <text class="lbl" x="88" y="103">a</text><text class="lbl" x="180" y="103">b</text>
        <text class="lbl" x="133" y="62">b</text><text class="lbl" x="228" y="62">a</text></svg>`},
  {title:'Rectangle, rhombus, square',
   text:'A <b>rectangle</b> is a parallelogram with four right angles. A <b>rhombus</b> has four equal sides. A <b>square</b> is both at once — the most restricted of all.',
   svg:`<svg viewBox="0 0 320 150"><rect class="shp" x="35" y="55" width="80" height="55"/>
        <polygon class="shp" points="150,82 180,50 210,82 180,114"/>
        <rect class="shp" x="240" y="55" width="55" height="55"/>
        <text class="dim" x="45" y="130">rectangle</text><text class="dim" x="158" y="130">rhombus</text><text class="dim" x="248" y="130">square</text></svg>`}
 ],
 quiz:[
  {q:'Three angles of a quadrilateral are 100°, 85° and 95°. What is the fourth?', choices:['80°','90°','75°','100°'], answer:0,
   why:'A quadrilateral\'s angles total 360°. 360 − 100 − 85 − 95 = 80°.',
   svg:`<svg viewBox="0 0 320 145"><polygon class="shp" points="60,35 245,50 220,120 45,110"/><text class="lbl" x="70" y="55">100°</text><text class="lbl" x="205" y="65">85°</text><text class="lbl" x="195" y="108">95°</text><text class="lbl hi" x="58" y="100">?</text></svg>`},
  {q:'Which shape must have four equal sides AND four right angles?', choices:['Square','Rectangle','Rhombus','Parallelogram'], answer:0,
   why:'A rectangle guarantees right angles but not equal sides; a rhombus guarantees equal sides but not right angles. Only a square requires both.',
   svg:`<svg viewBox="0 0 320 120"><rect class="shp" x="130" y="25" width="65" height="65"/><path class="sq" d="M130,42 L147,42 L147,25"/></svg>`},
  {q:'Every square is also a rectangle. Is every rectangle a square?', choices:['No','Yes','Only if it is small','Only if it is tilted'], answer:0,
   why:'A square meets every rectangle rule, so squares are rectangles. But a rectangle can have unequal sides, so it need not be a square.', svg:''},
  {q:'A quadrilateral has exactly one pair of parallel sides. What is it?', choices:['A trapezoid','A parallelogram','A rhombus','A rectangle'], answer:0,
   why:'One pair of parallel sides defines a trapezoid. Two pairs would make it a parallelogram.',
   svg:`<svg viewBox="0 0 320 120"><polygon class="shp" points="85,95 235,95 200,30 120,30"/><path class="fill" d="M158,25 l9,5 l-9,5 z"/><path class="fill" d="M158,90 l9,5 l-9,5 z"/></svg>`}
 ]
},

{
 id:'g7', icon:'⬡', unit:'Unit 3 · Shapes', name:'Polygons & Angle Sums',
 big:'Cut any polygon into triangles and its angle total follows one simple formula.',
 steps:[
  {title:'Polygons are named by side count',
   text:'Triangle (3), quadrilateral (4), pentagon (5), hexagon (6), heptagon (7), octagon (8). A <b>regular</b> polygon has all sides and all angles equal.',
   svg:`<svg viewBox="0 0 320 140"><polygon class="shp" points="45,105 90,105 67,60"/>
        <polygon class="shp" points="115,60 165,60 165,105 115,105"/>
        <polygon class="shp" points="215,50 245,72 233,105 197,105 185,72"/>
        <polygon class="shp" points="280,55 302,70 302,95 280,110 258,95 258,70"/>
        <text class="dim" x="52" y="128">3</text><text class="dim" x="135" y="128">4</text><text class="dim" x="208" y="128">5</text><text class="dim" x="275" y="128">6</text></svg>`},
  {title:'Split it into triangles',
   text:'From one corner, draw lines to every other corner. A pentagon splits into <b>3</b> triangles; a hexagon into <b>4</b>. Always two fewer than the number of sides.',
   svg:`<svg viewBox="0 0 320 160"><polygon class="shp" points="160,25 235,80 207,135 113,135 85,80"/>
        <line class="ln2" x1="160" y1="25" x2="207" y2="135"/><line class="ln2" x1="160" y1="25" x2="113" y2="135"/>
        <text class="dim" x="105" y="155">5 sides → 3 triangles</text></svg>`},
  {title:'The formula',
   text:'Interior angle sum = <b>(n − 2) × 180°</b>, where n is the number of sides. A pentagon: (5 − 2) × 180 = <b>540°</b>.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="160,25 235,80 207,135 113,135 85,80"/>
        <text class="dim" x="70" y="152">(5 − 2) × 180° = 540°</text></svg>`},
  {title:'One angle of a regular polygon',
   text:'If every angle is equal, divide the total by n. A regular hexagon: (6 − 2) × 180 ÷ 6 = 720 ÷ 6 = <b>120°</b> each.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="160,25 215,55 215,110 160,140 105,110 105,55"/>
        <text class="lbl" x="152" y="48">120°</text><text class="dim" x="80" y="155">720° ÷ 6 = 120°</text></svg>`}
 ],
 quiz:[
  {q:'What is the interior angle sum of an octagon (8 sides)?', choices:['1080°','900°','1440°','720°'], answer:0,
   why:'(n − 2) × 180 = (8 − 2) × 180 = 6 × 180 = 1080°.',
   svg:`<svg viewBox="0 0 320 130"><polygon class="shp" points="145,20 185,20 213,48 213,88 185,116 145,116 117,88 117,48"/></svg>`},
  {q:'How many triangles does a hexagon split into from one corner?', choices:['4','5','6','3'], answer:0,
   why:'Always two fewer than the side count: 6 − 2 = 4 triangles, which is why the total is 4 × 180 = 720°.',
   svg:`<svg viewBox="0 0 320 140"><polygon class="shp" points="160,20 215,50 215,105 160,135 105,105 105,50"/>
        <line class="ln2" x1="160" y1="20" x2="215" y2="105"/><line class="ln2" x1="160" y1="20" x2="160" y2="135"/><line class="ln2" x1="160" y1="20" x2="105" y2="105"/></svg>`},
  {q:'Each interior angle of a regular pentagon measures what?', choices:['108°','120°','90°','72°'], answer:0,
   why:'Total is (5 − 2) × 180 = 540°. Divided equally among 5 angles: 540 ÷ 5 = 108°.',
   svg:`<svg viewBox="0 0 320 130"><polygon class="shp" points="160,18 228,68 202,118 118,118 92,68"/><text class="lbl" x="148" y="42">108°</text></svg>`},
  {q:'A polygon has an interior angle sum of 900°. How many sides does it have?', choices:['7','6','8','5'], answer:0,
   why:'Solve (n − 2) × 180 = 900. Divide by 180: n − 2 = 5, so n = 7.', svg:''}
 ]
},

/* ─────────── UNIT 4 · MEASUREMENT ─────────── */
{
 id:'g8', icon:'📏', unit:'Unit 4 · Measurement', name:'Perimeter & Area',
 big:'Perimeter is the distance around the edge. Area is the space inside.',
 steps:[
  {title:'Perimeter walks the boundary',
   text:'<b>Perimeter</b> is the total distance around a shape. Just add every side. For this rectangle: 8 + 5 + 8 + 5 = <b>26</b>.',
   svg:`<svg viewBox="0 0 320 150"><rect class="shp" x="80" y="40" width="160" height="80"/>
        <text class="dim" x="150" y="32">8</text><text class="dim" x="150" y="140">8</text>
        <text class="dim" x="62" y="85">5</text><text class="dim" x="248" y="85">5</text></svg>`},
  {title:'Area counts the squares inside',
   text:'<b>Area</b> is how many unit squares fit inside. For a rectangle it is length × width: 8 × 5 = <b>40 square units</b>.',
   svg:`<svg viewBox="0 0 320 150"><rect class="shp" x="80" y="40" width="160" height="80"/>
        <g class="grid"><line x1="100" y1="40" x2="100" y2="120"/><line x1="120" y1="40" x2="120" y2="120"/><line x1="140" y1="40" x2="140" y2="120"/><line x1="160" y1="40" x2="160" y2="120"/><line x1="180" y1="40" x2="180" y2="120"/><line x1="200" y1="40" x2="200" y2="120"/><line x1="220" y1="40" x2="220" y2="120"/>
        <line x1="80" y1="56" x2="240" y2="56"/><line x1="80" y1="72" x2="240" y2="72"/><line x1="80" y1="88" x2="240" y2="88"/><line x1="80" y1="104" x2="240" y2="104"/></g>
        <text class="dim" x="120" y="140">8 × 5 = 40</text></svg>`},
  {title:'Triangle area is half a rectangle',
   text:'A triangle is exactly half the rectangle around it, so area = <b>½ × base × height</b>. Height is measured straight up from the base, not along a slanted side.',
   svg:`<svg viewBox="0 0 320 150"><rect class="ghost" x="80" y="40" width="140" height="80"/>
        <polygon class="shp" points="80,120 220,120 150,40"/>
        <line class="ln2" x1="150" y1="40" x2="150" y2="120"/><path class="sq" d="M150,105 L165,105 L165,120"/>
        <text class="dim" x="130" y="140">base</text><text class="dim" x="157" y="85">h</text></svg>`},
  {title:'Parallelogram: slide the triangle over',
   text:'Cut the triangle off one end of a parallelogram and slide it to the other — you get a rectangle. So area = <b>base × height</b>.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="60,115 190,115 240,45 110,45"/>
        <line class="ln2" x1="110" y1="45" x2="110" y2="115"/><path class="sq" d="M110,100 L125,100 L125,115"/>
        <text class="dim" x="118" y="85">h</text><text class="dim" x="115" y="137">base</text></svg>`}
 ],
 quiz:[
  {q:'What is the perimeter of this rectangle?', choices:['34 units','60 units','24 units','17 units'], answer:0,
   why:'Add all four sides: 12 + 5 + 12 + 5 = 34 units. (Multiplying gives area, not perimeter.)',
   svg:`<svg viewBox="0 0 320 140"><rect class="shp" x="70" y="40" width="180" height="70"/><text class="dim" x="152" y="32">12</text><text class="dim" x="52" y="80">5</text></svg>`},
  {q:'What is the area of this triangle?', choices:['36 sq units','72 sq units','21 sq units','18 sq units'], answer:0,
   why:'Area = ½ × base × height = ½ × 12 × 6 = 36 square units.',
   svg:`<svg viewBox="0 0 320 140"><polygon class="shp" points="70,110 250,110 160,40"/><line class="ln2" x1="160" y1="40" x2="160" y2="110"/><path class="sq" d="M160,95 L175,95 L175,110"/>
        <text class="dim" x="152" y="130">12</text><text class="dim" x="167" y="80">6</text></svg>`},
  {q:'A parallelogram has base 9 and height 4. What is its area?', choices:['36 sq units','26 sq units','18 sq units','13 sq units'], answer:0,
   why:'Area of a parallelogram = base × height = 9 × 4 = 36 square units.',
   svg:`<svg viewBox="0 0 320 130"><polygon class="shp" points="60,100 180,100 230,40 110,40"/><line class="ln2" x1="110" y1="40" x2="110" y2="100"/><text class="dim" x="118" y="75">4</text><text class="dim" x="112" y="120">9</text></svg>`},
  {q:'Two rectangles both have area 24. Must they have the same perimeter?', choices:['No','Yes','Only if they are squares','Only if both are whole numbers'], answer:0,
   why:'A 4×6 rectangle has perimeter 20; a 2×12 rectangle also has area 24 but perimeter 28. Same area, different perimeter.',
   svg:`<svg viewBox="0 0 320 130"><rect class="shp" x="35" y="45" width="80" height="55"/><text class="dim" x="55" y="118">4 × 6</text>
        <rect class="shp" x="160" y="65" width="140" height="20"/><text class="dim" x="205" y="118">2 × 12</text></svg>`}
 ]
},

{
 id:'g9', icon:'⭕', unit:'Unit 4 · Measurement', name:'Circles',
 big:'Every measurement on a circle grows from one number: the radius.',
 steps:[
  {title:'The parts of a circle',
   text:'The <b>center</b> is the middle point. The <b>radius</b> reaches from center to edge. The <b>diameter</b> crosses the whole circle through the center — always twice the radius.',
   svg:`<svg viewBox="0 0 320 170"><circle class="shp" cx="160" cy="85" r="62"/>
        <line class="ln2" x1="160" y1="85" x2="222" y2="85"/><line class="ln" x1="98" y1="85" x2="222" y2="85"/>
        <circle class="pt" cx="160" cy="85" r="4"/>
        <text class="dim" x="185" y="78">radius</text><text class="dim" x="112" y="105">diameter</text></svg>`},
  {title:'Circumference is the distance around',
   text:'Every circle has the same ratio of circumference to diameter: <b>π</b> (about 3.14). So C = <b>2πr</b>, or π × diameter.',
   svg:`<svg viewBox="0 0 320 170"><circle class="shp" cx="110" cy="85" r="55"/>
        <line class="ln2" x1="110" y1="85" x2="165" y2="85"/><text class="dim" x="128" y="78">r</text>
        <line class="ln" x1="200" y1="85" x2="300" y2="85"/>
        <text class="dim" x="196" y="110">C = 2πr</text></svg>`},
  {title:'Area is πr²',
   text:'Slice a circle into thin wedges and rearrange them — they form a near-rectangle of height r and width half the circumference. That gives area = <b>πr²</b>.',
   svg:`<svg viewBox="0 0 320 170"><circle class="shp" cx="90" cy="85" r="55"/>
        <g class="grid"><line x1="90" y1="30" x2="90" y2="140"/><line x1="35" y1="85" x2="145" y2="85"/><line x1="51" y1="46" x2="129" y2="124"/><line x1="51" y1="124" x2="129" y2="46"/></g>
        <rect class="ghost" x="185" y="60" width="110" height="50"/>
        <text class="dim" x="196" y="130">A = πr²</text></svg>`},
  {title:'Working in terms of π',
   text:'Often we leave π in the answer rather than multiplying it out — it stays exact. A circle with r = 5: C = <b>10π</b>, A = <b>25π</b>.',
   svg:`<svg viewBox="0 0 320 150"><circle class="shp" cx="160" cy="72" r="52"/>
        <line class="ln2" x1="160" y1="72" x2="212" y2="72"/><text class="dim" x="178" y="65">5</text>
        <text class="dim" x="100" y="140">C = 10π · A = 25π</text></svg>`}
 ],
 quiz:[
  {q:'A circle has radius 7. What is its diameter?', choices:['14','3.5','49','21'], answer:0,
   why:'Diameter is always twice the radius: 2 × 7 = 14.',
   svg:`<svg viewBox="0 0 320 140"><circle class="shp" cx="160" cy="70" r="52"/><line class="ln2" x1="160" y1="70" x2="212" y2="70"/><text class="dim" x="178" y="63">7</text></svg>`},
  {q:'A circle has radius 6. What is its circumference in terms of π?', choices:['12π','6π','36π','3π'], answer:0,
   why:'C = 2πr = 2 × π × 6 = 12π.', svg:''},
  {q:'A circle has radius 4. What is its area in terms of π?', choices:['16π','8π','4π','12π'], answer:0,
   why:'A = πr² = π × 4² = 16π. (8π would be the circumference, not the area.)',
   svg:`<svg viewBox="0 0 320 140"><circle class="shp" cx="160" cy="70" r="50"/><line class="ln2" x1="160" y1="70" x2="210" y2="70"/><text class="dim" x="176" y="63">4</text></svg>`},
  {q:'If you double a circle\'s radius, what happens to its area?', choices:['It becomes 4 times bigger','It doubles','It triples','It stays the same'], answer:0,
   why:'Area depends on r squared. Doubling r gives (2r)² = 4r², so the area is four times as large.',
   svg:`<svg viewBox="0 0 320 140"><circle class="shp" cx="80" cy="70" r="26"/><circle class="shp" cx="210" cy="70" r="52"/>
        <text class="dim" x="68" y="120">r</text><text class="dim" x="200" y="135">2r</text></svg>`}
 ]
},

/* ─────────── UNIT 5 · THE BRIDGE ─────────── */
{
 id:'g10', icon:'📊', unit:'Unit 5 · The Bridge', name:'Coordinate Geometry',
 big:'Put shapes on a grid and you can calculate distances instead of measuring them.',
 steps:[
  {title:'Plotting points',
   text:'A point on the grid is written (x, y): across first, then up. The point (4, 3) means 4 right and 3 up from the origin.',
   svg:`<svg viewBox="0 0 320 200"><g class="grid"><line x1="40" y1="20" x2="40" y2="180"/><line x1="80" y1="20" x2="80" y2="180"/><line x1="120" y1="20" x2="120" y2="180"/><line x1="160" y1="20" x2="160" y2="180"/><line x1="200" y1="20" x2="200" y2="180"/><line x1="240" y1="20" x2="240" y2="180"/>
        <line x1="20" y1="40" x2="280" y2="40"/><line x1="20" y1="80" x2="280" y2="80"/><line x1="20" y1="120" x2="280" y2="120"/></g>
        <line class="axis" x1="40" y1="160" x2="285" y2="160"/><line class="axis" x1="40" y1="180" x2="40" y2="15"/>
        <circle class="pt hi" cx="200" cy="40" r="6"/><text class="lbl" x="210" y="34">(4, 3)</text>
        <text class="dim" x="28" y="176">O</text></svg>`},
  {title:'Distance along a straight line',
   text:'If two points share a y-value, just subtract the x-values. From (2, 3) to (7, 3) is 7 − 2 = <b>5</b> units.',
   svg:`<svg viewBox="0 0 320 160"><g class="grid"><line x1="60" y1="30" x2="60" y2="130"/><line x1="100" y1="30" x2="100" y2="130"/><line x1="140" y1="30" x2="140" y2="130"/><line x1="180" y1="30" x2="180" y2="130"/><line x1="220" y1="30" x2="220" y2="130"/></g>
        <line class="axis" x1="40" y1="130" x2="285" y2="130"/>
        <circle class="pt hi" cx="60" cy="70" r="5"/><circle class="pt hi" cx="260" cy="70" r="5"/>
        <line class="ln2" x1="60" y1="70" x2="260" y2="70"/><text class="dim" x="140" y="60">5 units</text></svg>`},
  {title:'Distance is Pythagoras in disguise',
   text:'For a slanted segment, the horizontal and vertical changes are the legs of a right triangle. So <b>d = √(Δx² + Δy²)</b>. Here 3 across and 4 up gives √(9+16) = <b>5</b>.',
   svg:`<svg viewBox="0 0 320 180"><line class="axis" x1="50" y1="150" x2="290" y2="150"/><line class="axis" x1="50" y1="160" x2="50" y2="20"/>
        <circle class="pt hi" cx="90" cy="130" r="5"/><circle class="pt hi" cx="210" cy="50" r="5"/>
        <line class="ln" x1="90" y1="130" x2="210" y2="50"/>
        <line class="ln2" x1="90" y1="130" x2="210" y2="130"/><line class="ln2" x1="210" y1="130" x2="210" y2="50"/>
        <path class="sq" d="M195,130 L195,115 L210,115"/>
        <text class="dim" x="140" y="145">3</text><text class="dim" x="220" y="95">4</text><text class="lbl hi" x="130" y="82">5</text></svg>`},
  {title:'The midpoint is the average',
   text:'The <b>midpoint</b> sits exactly halfway. Average the x-values and average the y-values: midpoint of (2,1) and (8,5) is ((2+8)/2, (1+5)/2) = <b>(5, 3)</b>.',
   svg:`<svg viewBox="0 0 320 170"><line class="axis" x1="50" y1="140" x2="290" y2="140"/><line class="axis" x1="50" y1="150" x2="50" y2="20"/>
        <circle class="pt" cx="90" cy="120" r="5"/><circle class="pt" cx="230" cy="45" r="5"/>
        <line class="ln" x1="90" y1="120" x2="230" y2="45"/>
        <circle class="pt hi" cx="160" cy="82" r="6"/><text class="lbl" x="168" y="76">(5, 3)</text></svg>`}
 ],
 quiz:[
  {q:'What is the distance between (1, 2) and (1, 9)?', choices:['7 units','10 units','8 units','11 units'], answer:0,
   why:'Both points have x = 1, so the segment is vertical. Just subtract the y-values: 9 − 2 = 7.', svg:''},
  {q:'What is the distance between (0, 0) and (6, 8)?', choices:['10','14','48','12'], answer:0,
   why:'d = √(6² + 8²) = √(36 + 64) = √100 = 10. This is the 6-8-10 right triangle.',
   svg:`<svg viewBox="0 0 320 170"><line class="axis" x1="50" y1="140" x2="290" y2="140"/><line class="axis" x1="50" y1="150" x2="50" y2="20"/>
        <circle class="pt hi" cx="50" cy="140" r="5"/><circle class="pt hi" cx="200" cy="40" r="5"/>
        <line class="ln" x1="50" y1="140" x2="200" y2="40"/><line class="ln2" x1="50" y1="140" x2="200" y2="140"/><line class="ln2" x1="200" y1="140" x2="200" y2="40"/>
        <text class="dim" x="118" y="156">6</text><text class="dim" x="210" y="95">8</text></svg>`},
  {q:'What is the midpoint of (3, 4) and (9, 10)?', choices:['(6, 7)','(12, 14)','(6, 6)','(3, 3)'], answer:0,
   why:'Average each coordinate: x = (3+9)÷2 = 6, y = (4+10)÷2 = 7. So (6, 7).', svg:''},
  {q:'One endpoint of a segment is (2, 3) and the midpoint is (5, 7). Where is the other endpoint?',
   choices:['(8, 11)','(7, 10)','(3, 4)','(10, 14)'], answer:0,
   why:'From (2,3) to (5,7) is +3 across and +4 up. Go the same again from the midpoint: (5+3, 7+4) = (8, 11).', svg:''}
 ]
},

{
 id:'g11', icon:'🔍', unit:'Unit 5 · The Bridge', name:'Similar & Congruent',
 big:'Congruent means identical. Similar means the same shape at a different size.',
 steps:[
  {title:'Congruent: same shape, same size',
   text:'Two figures are <b>congruent</b> if you could slide, turn, or flip one and land exactly on the other. Every matching side and angle is equal.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="45,110 125,110 85,45"/>
        <polygon class="shp" points="185,110 265,110 225,45"/>
        <text class="dim" x="60" y="132">≅ congruent</text></svg>`},
  {title:'Similar: same shape, scaled',
   text:'Two figures are <b>similar</b> if one is an enlargement of the other. Angles stay identical; sides grow by the same <b>scale factor</b>.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="45,115 105,115 75,68"/>
        <polygon class="shp" points="160,115 280,115 220,22"/>
        <text class="dim" x="48" y="136">×1</text><text class="dim" x="205" y="136">×2</text></svg>`},
  {title:'Finding a missing side',
   text:'In similar triangles, matching sides share one ratio. If the small triangle has base 4 and the large one 12, the scale factor is 3 — so every side triples.',
   svg:`<svg viewBox="0 0 320 160"><polygon class="shp" points="35,120 95,120 65,75"/>
        <text class="dim" x="58" y="138">4</text><text class="dim" x="28" y="100">3</text>
        <polygon class="shp" points="140,120 290,120 215,20"/>
        <text class="dim" x="208" y="138">12</text><text class="lbl hi" x="150" y="75">?</text>
        <text class="dim" x="150" y="155">scale ×3 → 9</text></svg>`},
  {title:'Angles alone are enough',
   text:'If two triangles have the same three angles, they must be similar — even if you know nothing about their sides. This is the <b>AA</b> rule.',
   svg:`<svg viewBox="0 0 320 150"><polygon class="shp" points="40,115 100,115 55,70"/>
        <text class="lbl" x="46" y="108">50°</text><text class="lbl" x="82" y="108">40°</text>
        <polygon class="shp" points="165,115 285,115 255,25"/>
        <text class="lbl" x="172" y="108">50°</text><text class="lbl" x="252" y="108">40°</text></svg>`}
 ],
 quiz:[
  {q:'Two triangles are similar. The small one has sides 3, 4, 5. The large one\'s shortest side is 9. What is its longest side?',
   choices:['15','12','20','9'], answer:0,
   why:'Scale factor = 9 ÷ 3 = 3. Multiply the longest side by 3: 5 × 3 = 15.', svg:''},
  {q:'Two figures are congruent. What must be true?', choices:['All matching sides and angles are equal','Only the angles are equal','They are the same colour','One is bigger'], answer:0,
   why:'Congruent means identical in size and shape, so every corresponding side and angle matches exactly.', svg:''},
  {q:'Triangle A has angles 40°, 60°, 80°. Triangle B has angles 40°, 60°, 80° but sides twice as long. The triangles are:',
   choices:['Similar but not congruent','Congruent','Neither','Both congruent and similar'], answer:0,
   why:'Equal angles make them similar. Different side lengths mean they are not congruent.', svg:''},
  {q:'A photo is enlarged by a scale factor of 3. A 2 cm feature becomes how long?', choices:['6 cm','5 cm','9 cm','2/3 cm'], answer:0,
   why:'Every length multiplies by the scale factor: 2 × 3 = 6 cm.', svg:''}
 ]
},

{
 id:'g12', icon:'🧠', unit:'Unit 5 · The Bridge', name:'Reasoning & Proof',
 big:'Geometry is the first math where you must justify, not just calculate. This is how.',
 steps:[
  {title:'If-then statements',
   text:'A <b>conditional</b> has two parts: "<b>If</b> a shape is a square, <b>then</b> it has four right angles." The if-part is the hypothesis; the then-part is the conclusion.',
   svg:`<svg viewBox="0 0 320 130"><rect class="shp" x="55" y="40" width="55" height="55"/><path class="sq" d="M55,57 L72,57 L72,40"/>
        <text class="dim" x="128" y="62">IF square</text><text class="dim" x="128" y="82">THEN 4 right angles</text></svg>`},
  {title:'The converse swaps the parts',
   text:'The <b>converse</b> reverses it: "If a shape has four right angles, then it is a square." Careful — a converse can be <b>false</b> even when the original is true. A 3×5 rectangle has four right angles but is not a square.',
   svg:`<svg viewBox="0 0 320 130"><rect class="shp" x="45" y="45" width="120" height="45"/><path class="sq" d="M45,62 L62,62 L62,45"/>
        <text class="dim" x="180" y="62">4 right angles</text><text class="dim" x="180" y="82">but NOT a square</text></svg>`},
  {title:'One counterexample is enough',
   text:'To disprove a claim you only need <b>one</b> case where it fails. "All quadrilaterals with equal sides are squares" — a rhombus disproves it instantly.',
   svg:`<svg viewBox="0 0 320 140"><polygon class="shp" points="105,70 150,30 195,70 150,110"/>
        <text class="dim" x="205" y="65">equal sides,</text><text class="dim" x="205" y="85">not a square</text></svg>`},
  {title:'Building a short proof',
   text:'A proof is a chain where every link has a reason. <b>Given</b>: lines are parallel, angle 1 = 70°. <b>Prove</b>: angle 3 = 70°.<br>1. ∠1 = ∠2 — vertical angles<br>2. ∠2 = ∠3 — corresponding angles<br>3. So ∠1 = ∠3 = 70° — both equal ∠2',
   svg:`<svg viewBox="0 0 320 170"><line class="ln" x1="30" y1="55" x2="290" y2="55"/><line class="ln" x1="30" y1="120" x2="290" y2="120"/>
        <line class="ln2" x1="90" y1="18" x2="230" y2="158"/>
        <text class="lbl hi" x="118" y="46">1</text><text class="lbl hi" x="152" y="76">2</text><text class="lbl hi" x="216" y="112">3</text></svg>`}
 ],
 quiz:[
  {q:'What is the converse of "If it is raining, then the ground is wet"?',
   choices:['If the ground is wet, then it is raining','If it is not raining, the ground is dry','The ground is wet because of rain','If the ground is dry, it is not raining'], answer:0,
   why:'The converse swaps the if-part and the then-part. Note this converse is false — a sprinkler also wets the ground.', svg:''},
  {q:'Which single example disproves "every rectangle is a square"?',
   choices:['A 2 × 7 rectangle','A 4 × 4 square','A rhombus','A triangle'], answer:0,
   why:'A counterexample must fit the if-part but fail the then-part. A 2 × 7 shape IS a rectangle but is NOT a square, so the claim collapses.',
   svg:`<svg viewBox="0 0 320 110"><rect class="shp" x="90" y="35" width="140" height="40"/><path class="sq" d="M90,52 L107,52 L107,35"/></svg>`},
  {q:'How many counterexamples do you need to disprove a statement?', choices:['One','Two','Half of all cases','All of them'], answer:0,
   why:'A single case where the statement fails is enough to prove it is not always true.', svg:''},
  {q:'In a proof, what must accompany every step?', choices:['A reason justifying it','A diagram','A measurement','A calculator'], answer:0,
   why:'Each step needs a justification — a given fact, a definition, or a previously established rule. That chain of reasons is what makes it a proof.', svg:''}
 ]
}
];

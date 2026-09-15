#!/usr/bin/env python3
"""
Math question generator, grades 2-8.

Every answer is computed with exact arithmetic (int / Fraction), never
typed by hand, so a stated answer cannot drift from the real one.

Structure: each grade has its own topic set. Within a grade, each topic
produces questions at easy / medium / hard. Grade decides WHAT concepts
appear; difficulty tunes how hard they are within that grade.

Output: math_questions.json  (consumed by build.sh)
"""
import json, math, os, random
from fractions import Fraction
from collections import Counter

random.seed(31415)

Q = []
_seen = set()

# ─────────────────────────── helpers ───────────────────────────

def fmt_frac(fr):
    fr = Fraction(fr)
    if fr.denominator == 1:
        return str(fr.numerator)
    if abs(fr.numerator) >= fr.denominator:
        sign = "-" if fr < 0 else ""
        fr = abs(fr)
        w = fr.numerator // fr.denominator
        r = fr - w
        return f"{sign}{w}" if r == 0 else f"{sign}{w} {r.numerator}/{r.denominator}"
    return f"{fr.numerator}/{fr.denominator}"

def fmt_num(x):
    if isinstance(x, Fraction):
        return str(x.numerator) if x.denominator == 1 else fmt_frac(x)
    if isinstance(x, float):
        s = f"{x:.4f}".rstrip("0").rstrip(".")
        return s if s not in ("", "-0") else "0"
    return str(x)

def money(x):
    return f"${x:,.2f}" if isinstance(x, float) else f"${x:,}"

def add(grade, topic, diff, q, correct, distractors, explain, allow_special=True):
    """Register a question. Returns False if it duplicates an earlier one."""
    key = (grade, q)
    if key in _seen:
        return False
    ds = []
    for d in distractors:
        d = str(d)
        if d != str(correct) and d not in ds:
            ds.append(d)
    if len(ds) < 3:
        return False
    _seen.add(key)
    correct = str(correct)
    roll = random.random()
    if allow_special and roll < 0.05:
        # correct answer deliberately absent -> "None of the above"
        choices = ds[:3]
        random.shuffle(choices)
        choices.append("None of the above")
        ans = 3
        explain = f"{explain} The correct answer ({correct}) isn't listed, so “None of the above” is right."
    elif allow_special and roll < 0.12:
        choices = ds[:2] + [correct]
        random.shuffle(choices)
        choices.append("None of the above")
        ans = choices.index(correct)
    else:
        choices = ds[:3] + [correct]
        random.shuffle(choices)
        ans = choices.index(correct)
    Q.append({"id": len(Q) + 1, "grade": grade, "topic": topic, "diff": diff,
              "q": q, "choices": choices, "answer": ans, "explain": explain})
    return True

def near(c, spread=None):
    """Plausible wrong numeric answers around c."""
    c = int(c)
    offs = spread or [1, -1, 2, -2, 10, -10, 5, -5, 3, -3, 4, 20, 100]
    out = []
    for o in offs:
        v = c + o
        if v > 0 and v != c and str(v) not in out:
            out.append(str(v))
    return out

def near_frac(fr):
    fr = Fraction(fr)
    cands = [fr + Fraction(1, fr.denominator), fr - Fraction(1, fr.denominator),
             fr * 2, fr / 2, fr + Fraction(1, 2),
             Fraction(fr.numerator + 1, fr.denominator + 1)]
    out = []
    for c in cands:
        if c > 0 and c != fr:
            s = fmt_frac(c)
            if s not in out and s != fmt_frac(fr):
                out.append(s)
    return out

def near_dec(c, step):
    out = []
    for o in [step, -step, 2*step, -2*step, 10*step, 5*step, -3*step]:
        v = round(c + o, 4)
        if v > 0 and abs(v - c) > 1e-9:
            s = fmt_num(v)
            if s not in out and s != fmt_num(c):
                out.append(s)
    return out

def fill(grade, topic, diff, gens, n=8):
    """Run generators until n questions land for this grade/topic/difficulty."""
    start = len(Q)
    tries = 0
    while len(Q) - start < n and tries < 6000:
        tries += 1
        random.choice(gens)(grade, topic, diff)
    got = len(Q) - start
    if got < n:
        raise SystemExit(f"only produced {got}/{n} for grade {grade} / {topic} / {diff}")

NAMES = ["Robin", "Maya", "Leo", "Ethan", "Sofia", "Jayden", "Emma", "Lucas", "Aria", "Noah",
         "Zoe", "Kai", "Nina", "Owen", "Ruby"]
THINGS = ["stickers", "marbles", "crayons", "shells", "cards", "beads", "buttons", "acorns"]

# ═══════════════════════════ GRADE 2 ═══════════════════════════

def g2_addsub(g, t, d):
    if d == "easy":
        a, b = random.randint(11, 49), random.randint(11, 49)
        c = a + b
        add(g, t, d, f"What is {a} + {b}?", c, near(c),
            f"Add the tens: {a//10*10} + {b//10*10} = {(a//10+b//10)*10}. Add the ones: {a%10} + {b%10} = {a%10+b%10}. Together that makes {c}.")
    elif d == "medium":
        a = random.randint(30, 99); b = random.randint(11, a - 10)
        c = a - b
        add(g, t, d, f"What is {a} − {b}?", c, near(c),
            f"Start at {a} and count back {b}. {a} − {b} = {c}.")
    else:
        a, b, c2 = random.randint(15, 40), random.randint(10, 30), random.randint(5, 25)
        c = a + b - c2
        if c <= 0: return
        add(g, t, d, f"What is {a} + {b} − {c2}?", c, near(c),
            f"First add: {a} + {b} = {a+b}. Then subtract: {a+b} − {c2} = {c}.")

def g2_place(g, t, d):
    if d == "easy":
        n = random.randint(21, 99)
        which, val = random.choice([("tens", n//10), ("ones", n%10)])
        add(g, t, d, f"In the number {n}, what digit is in the {which} place?", val,
            [str(x) for x in range(10) if x != val],
            f"{n} has {n//10} tens and {n%10} ones, so the {which} digit is {val}.", allow_special=False)
    elif d == "medium":
        h, tn, o = random.randint(1,9), random.randint(0,9), random.randint(0,9)
        n = h*100 + tn*10 + o
        c = n
        add(g, t, d, f"Which number has {h} hundreds, {tn} tens, and {o} ones?", c,
            [str(h*100+o*10+tn), str(o*100+tn*10+h), str(n+10), str(n-100 if n>100 else n+100)],
            f"{h} hundreds = {h*100}, {tn} tens = {tn*10}, {o} ones = {o}. Together: {c}.")
    else:
        n = random.randint(101, 989)
        c = n + 10
        add(g, t, d, f"What is 10 more than {n}?", c, near(c),
            f"Adding 10 raises the tens digit by one: {n} + 10 = {c}.")

def g2_money(g, t, d):
    if d == "easy":
        q, dm = random.randint(1,3), random.randint(1,4)
        c = q*25 + dm*10
        add(g, t, d, f"You have {q} quarter{'s' if q>1 else ''} and {dm} dime{'s' if dm>1 else ''}. How many cents is that?",
            f"{c}¢", [f"{c+5}¢", f"{c-5}¢", f"{q*10+dm*25}¢", f"{c+10}¢"],
            f"{q} × 25¢ = {q*25}¢ and {dm} × 10¢ = {dm*10}¢. Together: {c}¢.")
    elif d == "medium":
        n = random.choice(NAMES)
        have, cost = random.randint(50, 99), random.randint(15, 45)
        c = have - cost
        add(g, t, d, f"{n} has {have}¢ and spends {cost}¢. How many cents are left?",
            f"{c}¢", [f"{c+10}¢", f"{c-5}¢", f"{have+cost}¢", f"{c+1}¢"],
            f"{have}¢ − {cost}¢ = {c}¢.")
    else:
        dollars = random.randint(2, 8); cents = random.choice([25, 50, 75, 10, 40])
        c = dollars*100 + cents
        add(g, t, d, f"How many cents is ${dollars}.{cents:02d}?",
            f"{c}¢", [f"{c+100}¢", f"{c-100}¢", f"{dollars*10+cents}¢", f"{c+10}¢"],
            f"Each dollar is 100¢, so ${dollars} = {dollars*100}¢. Add {cents}¢ to get {c}¢.")

def g2_time(g, t, d):
    if d == "easy":
        h = random.randint(1, 11); m = random.choice([0, 15, 30, 45])
        label = f"{h}:{m:02d}"
        half = "o'clock" if m == 0 else ("quarter past" if m == 15 else ("half past" if m == 30 else "quarter to"))
        hourword = h if m != 45 else (h + 1)
        c = f"{half} {hourword}" if m else f"{h} o'clock"
        wrongs = [f"quarter past {h}", f"half past {h}", f"{h} o'clock", f"quarter to {h+1}"]
        wrongs = [w for w in wrongs if w != c]
        add(g, t, d, f"How do you say the time {label}?", c, wrongs,
            f"{label} is read as “{c}”.", allow_special=False)
    elif d == "medium":
        h = random.randint(1, 10); m = random.choice([0, 15, 30])
        add_min = random.choice([15, 30, 45])
        total = m + add_min
        nh, nm = h + total // 60, total % 60
        c = f"{nh}:{nm:02d}"
        add(g, t, d, f"It is {h}:{m:02d}. What time will it be in {add_min} minutes?", c,
            [f"{h}:{(m+add_min)%60:02d}", f"{nh+1}:{nm:02d}", f"{h}:{nm:02d}", f"{nh}:{(nm+15)%60:02d}"],
            f"{m} minutes + {add_min} minutes = {total} minutes, which is {total//60} hour and {nm} minutes past {h}:00, so {c}.")
    else:
        start = random.randint(1, 9); dur = random.randint(2, 4)
        c = start + dur
        add(g, t, d, f"A movie starts at {start}:00 and lasts {dur} hours. What time does it end?",
            f"{c}:00", [f"{c+1}:00", f"{c-1}:00", f"{start+1}:00", f"{dur}:00"],
            f"{start} + {dur} = {c}, so the movie ends at {c}:00.")

SHAPES = [("triangle",3),("square",4),("rectangle",4),("pentagon",5),
          ("hexagon",6),("heptagon",7),("octagon",8)]

def g2_shapes(g, t, d):
    if d == "easy":
        shape, sides = random.choice(SHAPES)
        word = random.choice(["sides", "corners"])
        add(g, t, d, f"How many {word} does a {shape} have?", sides,
            [str(x) for x in [3,4,5,6,7,8] if x != sides],
            f"A {shape} has {sides} {word}. (Every flat shape has as many corners as sides.)",
            allow_special=False)
    elif d == "medium":
        s = random.randint(3, 12)
        c = 4*s
        add(g, t, d, f"A square has sides of {s} cm. What is the distance all the way around it?",
            f"{c} cm", [f"{s*s} cm", f"{2*s} cm", f"{c+4} cm", f"{c-4} cm"],
            f"A square has 4 equal sides: {s} + {s} + {s} + {s} = {c} cm.")
    else:
        rows, cols = random.randint(2, 6), random.randint(2, 6)
        c = rows*cols
        add(g, t, d, f"A rectangle is covered by {rows} rows of {cols} squares. How many squares cover it?",
            c, near(c), f"{rows} rows × {cols} squares in each row = {c} squares.")

def g2_skip(g, t, d):
    step = random.choice([2, 5, 10]) if d == "easy" else random.choice([3, 4, 6, 25])
    start = step * random.randint(1, 6)
    seq = [start + step*i for i in range(4)]
    c = seq[-1] + step
    add(g, t, d, f"What number comes next? {', '.join(map(str, seq))}, ___",
        c, near(c, [step, -step, 1, -1, step*2]),
        f"The pattern adds {step} each time: {seq[-1]} + {step} = {c}.")

GRADE2 = [("addsub", [g2_addsub]), ("place", [g2_place]), ("money", [g2_money]),
          ("time", [g2_time]), ("shapes", [g2_shapes]), ("patterns", [g2_skip])]

# ═══════════════════════════ GRADE 3 ═══════════════════════════

def g3_multdiv(g, t, d):
    if d == "easy":
        a, b = random.randint(2, 9), random.randint(2, 9)
        c = a*b
        add(g, t, d, f"What is {a} × {b}?", c, near(c, [1,-1,a,-a,b,-b,2,-2,10]),
            f"{a} × {b} means {a} added {b} times, which is {c}.")
    elif d == "medium":
        b, c = random.randint(2, 9), random.randint(2, 12)
        a = b*c
        add(g, t, d, f"What is {a} ÷ {b}?", c, near(c),
            f"Ask: {b} times what equals {a}? {b} × {c} = {a}, so the answer is {c}.")
    else:
        a, b = random.randint(11, 30), random.randint(3, 9)
        c = a*b
        add(g, t, d, f"What is {a} × {b}?", c, near(c, [b, -b, 10, -10, a, 100]),
            f"Break it up: ({a//10*10} × {b}) + ({a%10} × {b}) = {a//10*10*b} + {a%10*b} = {c}.")

def g3_fractions(g, t, d):
    if d == "easy":
        den = random.choice([2,3,4,6,8]); num = random.randint(1, den-1)
        c = f"{num}/{den}"
        add(g, t, d, f"A pizza is cut into {den} equal slices and {num} are eaten. What fraction was eaten?",
            c, [f"{den}/{num}", f"{num}/{den+1}", f"{num+1}/{den}", f"{den-num}/{den}"],
            f"{num} slices out of {den} equal slices is {num}/{den}.")
    elif d == "medium":
        n, den = random.choice([(1,2),(1,3),(1,4),(2,3),(3,4),(2,5),(3,5),(1,5),(5,6),(1,6)])
        k = random.randint(2, 6)
        add(g, t, d, f"Which fraction is the same as {n}/{den}?", f"{n*k}/{den*k}",
            [f"{n*k}/{den}", f"{n}/{den*k}", f"{n+k}/{den+k}", f"{den*k}/{n*k}", f"{n*k}/{den*k+1}"],
            f"Multiply top and bottom by {k}: {n}×{k}={n*k} and {den}×{k}={den*k}, so {n}/{den} = {n*k}/{den*k}.")
    else:
        den = random.choice([4, 6, 8, 10, 12])
        a = random.randint(1, den-2); b = random.randint(1, den-a-1)
        fr = Fraction(a+b, den)
        add(g, t, d, f"What is {a}/{den} + {b}/{den}?", fmt_frac(fr), near_frac(fr),
            f"The bottoms match, so add the tops: {a}+{b}={a+b}, giving {a+b}/{den} = {fmt_frac(fr)}.")

def g3_areaperim(g, t, d):
    l, w = random.randint(3, 12), random.randint(2, 10)
    if d == "easy":
        c = 2*(l+w)
        add(g, t, d, f"A rectangle is {l} cm long and {w} cm wide. What is its perimeter?",
            f"{c} cm", [f"{l*w} cm", f"{l+w} cm", f"{c+2} cm", f"{c-2} cm"],
            f"Perimeter is the distance around: {l} + {w} + {l} + {w} = {c} cm.")
    elif d == "medium":
        c = l*w
        add(g, t, d, f"What is the area of a rectangle {l} cm by {w} cm?",
            f"{c} sq cm", [f"{2*(l+w)} sq cm", f"{l+w} sq cm", f"{c+l} sq cm", f"{c-w} sq cm"],
            f"Area = length × width = {l} × {w} = {c} square cm.")
    else:
        area = l*w
        add(g, t, d, f"A rectangle has an area of {area} sq cm and a width of {w} cm. How long is it?",
            f"{l} cm", [f"{l+1} cm", f"{l-1 if l>1 else l+2} cm", f"{area-w} cm", f"{w} cm"],
            f"Area ÷ width = length: {area} ÷ {w} = {l} cm.")

def g3_rounding(g, t, d):
    if d == "easy":
        n = random.randint(11, 99)
        c = round(n, -1)
        c = int(c)
        add(g, t, d, f"Round {n} to the nearest ten.", c, near(c, [10,-10,20,-20,1]),
            f"{n} is {'closer to ' + str(c) if n % 10 != 5 else 'exactly halfway, so round up to ' + str(c)}. The answer is {c}.")
    elif d == "medium":
        n = random.randint(120, 980)
        c = int(round(n, -2))
        if c == 0: return
        add(g, t, d, f"Round {n} to the nearest hundred.", c, near(c, [100,-100,10,-10]),
            f"Look at the tens digit ({(n//10)%10}). {'Round up' if (n%100)>=50 else 'Round down'}: {c}.")
    else:
        a, b = random.randint(120, 480), random.randint(120, 480)
        ra, rb = int(round(a,-2)), int(round(b,-2))
        c = ra + rb
        add(g, t, d, f"Estimate {a} + {b} by rounding each number to the nearest hundred.",
            c, near(c, [100,-100,50,-50]),
            f"{a} rounds to {ra} and {b} rounds to {rb}. {ra} + {rb} = {c}.")

def g3_word(g, t, d):
    n = random.choice(NAMES); thing = random.choice(THINGS)
    if d == "easy":
        a, b = random.randint(12, 60), random.randint(10, 40)
        c = a + b
        add(g, t, d, f"{n} has {a} {thing} and finds {b} more. How many now?", c, near(c),
            f"{a} + {b} = {c} {thing}.")
    elif d == "medium":
        per, groups = random.randint(3, 9), random.randint(3, 8)
        c = per*groups
        add(g, t, d, f"{n} packs {thing} into {groups} bags with {per} in each bag. How many {thing} in all?",
            c, near(c), f"{groups} bags × {per} each = {c} {thing}.")
    else:
        total = random.randint(4, 9) * random.randint(3, 8)
        per = random.choice([x for x in range(3, 10) if total % x == 0])
        c = total // per
        add(g, t, d, f"{n} shares {total} {thing} equally among {per} friends. How many does each friend get?",
            c, near(c), f"{total} ÷ {per} = {c} {thing} each.")

GRADE3 = [("multdiv", [g3_multdiv]), ("fractions", [g3_fractions]), ("geometry", [g3_areaperim]),
          ("rounding", [g3_rounding]), ("wordprob", [g3_word])]

# ═══════════════════════════ GRADE 4 ═══════════════════════════

def g4_multidigit(g, t, d):
    if d == "easy":
        a, b = random.randint(21, 99), random.randint(3, 9)
        c = a*b
        add(g, t, d, f"What is {a} × {b}?", c, near(c, [b,-b,10,-10,100]),
            f"({a//10*10} × {b}) + ({a%10} × {b}) = {a//10*10*b} + {a%10*b} = {c}.")
    elif d == "medium":
        a, b = random.randint(12, 60), random.randint(11, 40)
        c = a*b
        add(g, t, d, f"What is {a} × {b}?", c, near(c, [a,-a,b,-b,10,100]),
            f"({a} × {b//10*10}) + ({a} × {b%10}) = {a*(b//10*10)} + {a*(b%10)} = {c}.")
    else:
        b, c = random.randint(3, 9), random.randint(30, 250)
        a = b*c
        add(g, t, d, f"What is {a} ÷ {b}?", c, near(c, [1,-1,10,-10,100]),
            f"{b} × {c} = {a}, so {a} ÷ {b} = {c}.")

def g4_fractions(g, t, d):
    if d == "easy":
        n, den = random.choice([(1,2),(1,3),(2,3),(1,4),(3,4),(2,5),(3,5),(1,6)])
        k = random.randint(2, 5)
        add(g, t, d, f"Simplify {n*k}/{den*k}.", f"{n}/{den}", near_frac(Fraction(n,den)),
            f"Divide top and bottom by {k}: {n*k}÷{k}={n}, {den*k}÷{k}={den}, giving {n}/{den}.")
    elif d == "medium":
        fs = random.sample([(1,2),(1,3),(2,3),(1,4),(3,4),(2,5),(3,5),(5,6),(3,8)], 4)
        vals = [Fraction(a,b) for a,b in fs]
        big = max(vals)
        c = f"{fs[vals.index(big)][0]}/{fs[vals.index(big)][1]}"
        add(g, t, d, f"Which fraction is largest: {', '.join(f'{a}/{b}' for a,b in fs)}?",
            c, [f"{a}/{b}" for a,b in fs if f"{a}/{b}" != c],
            f"As decimals, {c} ≈ {float(big):.2f}, larger than the rest.", allow_special=False)
    else:
        den = random.choice([3,4,5,6,8])
        w = random.randint(1,3); num = random.randint(1, den-1)
        improper = w*den + num
        add(g, t, d, f"Write {w} {num}/{den} as an improper fraction.", f"{improper}/{den}",
            [f"{improper+1}/{den}", f"{w*num}/{den}", f"{improper}/{den+1}", f"{den}/{improper}"],
            f"{w} wholes = {w}×{den} = {w*den} parts. Add {num} more: {improper}/{den}.")

def g4_decimals(g, t, d):
    if d == "easy":
        n = random.randint(1, 9)
        add(g, t, d, f"Write {n} tenths as a decimal.", f"0.{n}",
            [f"0.0{n}", f"{n}.0", f"0.{n}{n}", f"{n}/10"],
            f"Tenths sit one place after the decimal point, so {n} tenths is 0.{n}.")
    elif d == "medium":
        a = round(random.randint(11,99)/10, 1); b = round(random.randint(11,99)/10, 1)
        c = round(a+b, 1)
        add(g, t, d, f"What is {fmt_num(a)} + {fmt_num(b)}?", fmt_num(c), near_dec(c, 0.1),
            f"Line up the decimal points and add: {fmt_num(a)} + {fmt_num(b)} = {fmt_num(c)}.")
    else:
        if random.random() < 0.5:
            n = random.choice([25,50,75,20,40,60,80,5,10,15,35,45,55,65,85,95])
            fr = Fraction(n, 100)
            add(g, t, d, f"Write 0.{n:02d} as a fraction in simplest form.", fmt_frac(fr), near_frac(fr),
                f"0.{n:02d} means {n} hundredths = {n}/100, which simplifies to {fmt_frac(fr)}.")
        else:
            a = round(random.randint(101, 999)/100, 2)
            b = round(random.randint(101, 999)/100, 2)
            hi, lo = max(a, b), min(a, b)
            if hi == lo: return
            add(g, t, d, f"Which is greater, {fmt_num(a)} or {fmt_num(b)}?", fmt_num(hi),
                [fmt_num(lo), "They are equal", fmt_num(round(hi+0.1, 2)), fmt_num(round(lo-0.1, 2))],
                f"Compare place by place: {fmt_num(hi)} is larger than {fmt_num(lo)}.", allow_special=False)

def g4_angles(g, t, d):
    if d == "easy":
        kind = random.choice(["acute","acute","right","obtuse","obtuse","straight"])
        deg = {"acute": random.randint(5, 89), "right": 90,
               "obtuse": random.randint(91, 179), "straight": 180}[kind]
        add(g, t, d, f"An angle measures {deg}°. What kind of angle is it?", kind.capitalize(),
            [k.capitalize() for k in ["acute","right","obtuse","straight"] if k != kind],
            f"{'Under 90° is acute' if kind=='acute' else 'Exactly 90° is right' if kind=='right' else 'Between 90° and 180° is obtuse' if kind=='obtuse' else 'Exactly 180° is straight'}, so {deg}° is {kind}.",
            allow_special=False)
    elif d == "medium":
        a = random.randint(20, 70)
        c = 90 - a
        add(g, t, d, f"Two angles are complementary. One measures {a}°. What is the other?",
            f"{c}°", [f"{180-a}°", f"{c+10}°", f"{c-10}°", f"{a}°"],
            f"Complementary angles add to 90°: 90 − {a} = {c}°.")
    else:
        a = random.randint(30, 150)
        c = 180 - a
        add(g, t, d, f"Two angles are supplementary. One measures {a}°. What is the other?",
            f"{c}°", [f"{90-a if a<90 else a-90}°", f"{c+10}°", f"{c-10}°", f"{a}°"],
            f"Supplementary angles add to 180°: 180 − {a} = {c}°.")

def g4_factors(g, t, d):
    if d == "easy":
        n = random.choice([12,16,18,20,24,28,30,36])
        facs = [x for x in range(2, n) if n % x == 0]
        c = random.choice(facs)
        wrongs = [str(x) for x in range(2, 20) if n % x != 0][:5]
        add(g, t, d, f"Which number is a factor of {n}?", c, wrongs,
            f"{c} × {n//c} = {n}, so {c} is a factor of {n}.", allow_special=False)
    elif d == "medium":
        a = random.choice([12,18,24,30,36,16,20]); b = random.choice([8,12,18,24,27,40])
        if a == b: return
        c = math.gcd(a, b)
        if c < 2: return
        add(g, t, d, f"What is the greatest common factor of {a} and {b}?", c, near(c),
            f"{a} = {c}×{a//c} and {b} = {c}×{b//c}. The largest shared factor is {c}.")
    else:
        a = random.choice([4,6,8,9,10,12]); b = random.choice([6,8,9,10,12,15])
        if a == b: return
        c = a*b//math.gcd(a,b)
        add(g, t, d, f"What is the least common multiple of {a} and {b}?", c, near(c, [a,-a,b,-b,1]),
            f"Multiples of {a}: {a}, {2*a}, {3*a}… The smallest one {b} also divides is {c}.")

def g4_word(g, t, d):
    n = random.choice(NAMES)
    if d == "easy":
        packs, per = random.randint(4, 9), random.choice([6,8,10,12])
        c = packs*per
        add(g, t, d, f"{n} buys {packs} packs of {per} pencils. How many pencils in total?", c, near(c),
            f"{packs} × {per} = {c} pencils.")
    elif d == "medium":
        price, qty = random.randint(3, 12), random.randint(3, 8)
        extra = random.randint(2, 15)
        c = price*qty + extra
        add(g, t, d, f"{n} buys {qty} books at ${price} each plus a ${extra} bookmark. What is the total?",
            money(c), [money(price*qty), money(c+price), money(c-1), money(price+qty+extra)],
            f"{qty} × ${price} = ${price*qty}. Add ${extra}: ${c}.")
    else:
        total = random.randint(6, 12) * random.randint(4, 9)
        per = random.choice([x for x in range(4, 13) if total % x == 0])
        left = random.randint(1, per-1)
        c = total // per
        add(g, t, d, f"{n} has {total} stickers to share equally among {per} friends. How many does each get?",
            c, near(c), f"{total} ÷ {per} = {c} stickers each.")

GRADE4 = [("multdiv", [g4_multidigit]), ("fractions", [g4_fractions]), ("decimals", [g4_decimals]),
          ("geometry", [g4_angles]), ("factors", [g4_factors]), ("wordprob", [g4_word])]

# ═══════════════════════════ GRADE 5 ═══════════════════════════

def g5_decimals(g, t, d):
    if d == "easy":
        a = round(random.randint(101, 999)/100, 2); b = round(random.randint(101, 999)/100, 2)
        c = round(a+b, 2)
        add(g, t, d, f"What is {fmt_num(a)} + {fmt_num(b)}?", fmt_num(c), near_dec(c, 0.01),
            f"Line up the decimal points: {fmt_num(a)} + {fmt_num(b)} = {fmt_num(c)}.")
    elif d == "medium":
        a = round(random.randint(11, 99)/10, 1); b = random.randint(2, 9)
        c = round(a*b, 1)
        add(g, t, d, f"What is {fmt_num(a)} × {b}?", fmt_num(c), near_dec(c, 0.1),
            f"Multiply {int(a*10)} × {b} = {int(a*10)*b}, then put back one decimal place: {fmt_num(c)}.")
    else:
        b = random.choice([0.2, 0.25, 0.5, 0.4]); c = random.randint(3, 30)
        a = round(b*c, 2)
        add(g, t, d, f"What is {fmt_num(a)} ÷ {fmt_num(b)}?", c, near(c),
            f"Multiply both by 100 to clear decimals: {fmt_num(a*100)} ÷ {fmt_num(b*100)} = {c}.")

def g5_fracops(g, t, d):
    B = [(1,2),(1,3),(2,3),(1,4),(3,4),(2,5),(3,5),(1,6),(5,6),(3,8)]
    if d == "easy":
        n, den = random.choice(B)
        x = den*random.randint(3, 12)
        c = x*n//den
        add(g, t, d, f"What is {n}/{den} of {x}?", c, near(c),
            f"{x} ÷ {den} = {x//den}, then × {n} = {c}.")
    elif d == "medium":
        (a,b), (c2,d2) = random.choice(B), random.choice(B)
        res = Fraction(a,b) * Fraction(c2,d2)
        add(g, t, d, f"What is {a}/{b} × {c2}/{d2}?", fmt_frac(res), near_frac(res),
            f"Multiply across: {a}×{c2}={a*c2}, {b}×{d2}={b*d2}. Simplify {a*c2}/{b*d2} to {fmt_frac(res)}.")
    else:
        (a,b) = random.choice(B); (c2,d2) = random.choice(B)
        f1, f2 = Fraction(a,b), Fraction(c2,d2)
        op = random.choice(["+","-"])
        if op == "-" and f1 <= f2: f1, f2 = f2, f1; a,b,c2,d2 = f1.numerator,f1.denominator,f2.numerator,f2.denominator
        res = f1+f2 if op=="+" else f1-f2
        if res <= 0: return
        lcm = b*d2//math.gcd(b,d2)
        add(g, t, d, f"What is {a}/{b} {op} {c2}/{d2}?", fmt_frac(res), near_frac(res),
            f"Common denominator {lcm}: {a*lcm//b}/{lcm} {op} {c2*lcm//d2}/{lcm} = {fmt_frac(res)}.")

def g5_volume(g, t, d):
    l, w, h = random.randint(2,9), random.randint(2,8), random.randint(2,7)
    if d == "easy":
        c = l*w*h
        add(g, t, d, f"A box is {l} by {w} by {h} units. What is its volume?",
            f"{c} cubic units", [f"{l+w+h} cubic units", f"{l*w} cubic units", f"{c+l} cubic units", f"{2*(l*w+w*h+l*h)} cubic units"],
            f"Volume = length × width × height = {l} × {w} × {h} = {c}.")
    elif d == "medium":
        vol = l*w*h
        add(g, t, d, f"A box has a volume of {vol} cubic cm. Its base is {l} cm by {w} cm. How tall is it?",
            f"{h} cm", [f"{h+1} cm", f"{h-1 if h>1 else h+2} cm", f"{vol//l} cm", f"{l*w} cm"],
            f"Base area = {l}×{w} = {l*w}. Height = {vol} ÷ {l*w} = {h} cm.")
    else:
        if random.random() < 0.5:
            s = random.randint(2, 11)
            c = 6*s*s
            add(g, t, d, f"What is the surface area of a cube with edge {s} cm?",
                f"{c} sq cm", [f"{s**3} sq cm", f"{s*s} sq cm", f"{4*s*s} sq cm", f"{12*s} sq cm"],
                f"A cube has 6 faces of {s}×{s}={s*s} sq cm each: 6 × {s*s} = {c} sq cm.")
        else:
            c = 2*(l*w + w*h + l*h)
            add(g, t, d, f"What is the surface area of a box measuring {l} by {w} by {h} cm?",
                f"{c} sq cm", [f"{l*w*h} sq cm", f"{l*w+w*h+l*h} sq cm", f"{c+2} sq cm", f"{2*(l+w+h)} sq cm"],
                f"Opposite faces match: 2×({l}×{w}) + 2×({w}×{h}) + 2×({l}×{h}) = "
                f"{2*l*w} + {2*w*h} + {2*l*h} = {c} sq cm.")

def g5_orderops(g, t, d):
    if d == "easy":
        a, b, c2 = random.randint(2,12), random.randint(2,9), random.randint(2,9)
        c = a + b*c2
        add(g, t, d, f"What is {a} + {b} × {c2}?", c, [str((a+b)*c2)] + near(c),
            f"Multiplication comes first: {b}×{c2}={b*c2}, then {a}+{b*c2}={c}. (Going left to right would wrongly give {(a+b)*c2}.)")
    elif d == "medium":
        a,b,c2,e = random.randint(2,9), random.randint(2,9), random.randint(2,6), random.randint(1,10)
        c = (a+b)*c2 - e
        if c <= 0: return
        add(g, t, d, f"What is ({a} + {b}) × {c2} − {e}?", c, near(c),
            f"Parentheses: {a}+{b}={a+b}. Multiply: {a+b}×{c2}={(a+b)*c2}. Subtract: {c}.")
    else:
        b, c2, e = random.randint(2,5), random.randint(2,4), random.randint(1,12)
        c = e + b**2 * c2
        add(g, t, d, f"What is {e} + {b}² × {c2}?", c, near(c),
            f"Exponent first: {b}²={b*b}. Then {b*b}×{c2}={b*b*c2}. Then +{e} = {c}.")

def g5_coord(g, t, d):
    if d == "easy":
        x, y = random.randint(1,9), random.randint(1,9)
        add(g, t, d, f"Starting at (0, 0), you move {x} right and {y} up. What point are you at?",
            f"({x}, {y})", [f"({y}, {x})", f"({x}, {y+1})", f"({x+1}, {y})", f"(0, {x+y})"],
            f"The first number is across, the second is up: ({x}, {y}).")
    elif d == "medium":
        y = random.randint(1,9); x1 = random.randint(1,5); x2 = x1 + random.randint(2,8)
        c = x2-x1
        add(g, t, d, f"How far apart are the points ({x1}, {y}) and ({x2}, {y})?",
            f"{c} units", [f"{c+1} units", f"{c-1} units", f"{x1+x2} units", f"{y} units"],
            f"Same y-value, so subtract the x-values: {x2} − {x1} = {c} units.")
    else:
        x = random.randint(1,8); y1 = random.randint(1,4); y2 = y1 + random.randint(2,6)
        w = random.randint(2,6)
        h = y2-y1
        c = w*h
        add(g, t, d, f"A rectangle has corners at ({x}, {y1}), ({x+w}, {y1}), ({x+w}, {y2}), and ({x}, {y2}). What is its area?",
            f"{c} square units", [f"{2*(w+h)} square units", f"{w+h} square units", f"{c+w} square units", f"{h} square units"],
            f"Width = {w}, height = {y2}−{y1} = {h}. Area = {w} × {h} = {c}.")

def g5_word(g, t, d):
    n = random.choice(NAMES)
    if d == "easy":
        nums = [random.randint(60,100) for _ in range(3)]
        while sum(nums) % 3: nums[2] = nums[2]+1 if nums[2] < 100 else nums[2]-1
        c = sum(nums)//3
        add(g, t, d, f"{n} scored {nums[0]}, {nums[1]}, and {nums[2]}. What is the average?", c, near(c),
            f"Sum = {sum(nums)}. Divide by 3: {c}.")
    elif d == "medium":
        speed, hrs = random.choice([40,45,50,55,60]), random.randint(2,5)
        c = speed*hrs
        add(g, t, d, f"A car drives {speed} miles per hour for {hrs} hours. How far does it travel?",
            f"{c} miles", [f"{c+speed} miles", f"{c-speed} miles", f"{speed+hrs} miles", f"{c//2} miles"],
            f"Distance = speed × time = {speed} × {hrs} = {c} miles.")
    else:
        price = random.choice([40,60,80,120,200]); pct = random.choice([10,25,50,20])
        off = price*pct//100; c = price-off
        add(g, t, d, f"A ${price} jacket is {pct}% off. What is the sale price?",
            money(c), [money(off), money(c+5), money(c-5), money(price-pct)],
            f"{pct}% of ${price} is ${off}. ${price} − ${off} = ${c}.")

GRADE5 = [("decimals", [g5_decimals]), ("fractions", [g5_fracops]), ("geometry", [g5_volume]),
          ("orderops", [g5_orderops]), ("coordinates", [g5_coord]), ("wordprob", [g5_word])]

# ═══════════════════════════ GRADE 6 ═══════════════════════════

def g6_ratios(g, t, d):
    if d == "easy":
        a, b = random.choice([(2,3),(3,4),(1,2),(2,5),(3,5),(4,5)])
        k = random.randint(2, 6)
        add(g, t, d, f"Simplify the ratio {a*k}:{b*k}.", f"{a}:{b}",
            [f"{b}:{a}", f"{a}:{b+1}", f"{a+1}:{b}", f"{a*k}:{b}"],
            f"Divide both parts by {k}: {a*k}÷{k}={a}, {b*k}÷{k}={b}.")
    elif d == "medium":
        n2, hrs = random.randint(4, 12), random.randint(2, 8)
        total = n2*hrs
        add(g, t, d, f"A printer makes {total} pages in {hrs} minutes. How many pages per minute?",
            n2, near(n2), f"{total} ÷ {hrs} = {n2} pages per minute.")
    else:
        total = random.choice([24,36,48,60,72]); r1, r2 = random.choice([(1,2),(1,3),(2,3),(3,5),(1,5)])
        parts = r1+r2
        if total % parts: return
        unit = total//parts; c = r1*unit
        n1, nn = random.sample(NAMES, 2)
        add(g, t, d, f"{n1} and {nn} split {total} marbles in the ratio {r1}:{r2}. How many does {n1} get?",
            c, near(c), f"{r1}+{r2}={parts} parts. Each part = {total}÷{parts}={unit}. {n1} gets {r1}×{unit}={c}.")

def g6_percent(g, t, d):
    if d == "easy":
        p = random.choice([10, 25, 50]); x = random.choice([20,40,60,80,100,200])
        if x*p % 100: return
        c = x*p//100
        add(g, t, d, f"What is {p}% of {x}?", c, near(c),
            f"{p}% = {p}/100. {x} × {p} ÷ 100 = {c}.")
    elif d == "medium":
        p = random.choice([5,15,20,30,40,60,75,80]); x = random.choice([40,60,80,120,140,200,240])
        if x*p % 100: return
        c = x*p//100
        add(g, t, d, f"What is {p}% of {x}?", c, near(c),
            f"{x} × {p} ÷ 100 = {x*p} ÷ 100 = {c}.")
    else:
        part = random.choice([5,10,15,20,25,30]); whole = random.choice([20,25,50,40,60,200])
        if (part*100) % whole: return
        c = part*100//whole
        add(g, t, d, f"{part} is what percent of {whole}?", f"{c}%",
            [f"{c+10}%", f"{c-5 if c>5 else c+15}%", f"{part}%", f"{whole//part if part else 1}%"],
            f"{part} ÷ {whole} = {part/whole}, and × 100 gives {c}%.")

def g6_integers(g, t, d):
    if d == "easy":
        a = random.randint(-15, -1); b = random.randint(1, 20)
        c = a + b
        if c == 0: return
        add(g, t, d, f"What is ({a}) + {b}?", c, [str(a-b), str(abs(a)+b), str(c+1), str(c-1)],
            f"Start at {a} and move {b} to the right on the number line: {c}.")
    elif d == "medium":
        a = random.randint(1, 20); b = random.randint(1, 20)
        c = a - b - random.randint(1, 10)
        aa, bb = a, b + abs(c) + a  # ensure negative result
        c = aa - bb
        add(g, t, d, f"What is {aa} − {bb}?", c, [str(bb-aa), str(c+1), str(c-1), str(aa+bb)],
            f"Subtracting a bigger number gives a negative: {aa} − {bb} = {c}.")
    else:
        a = random.randint(-9, -2); b = random.randint(2, 9)
        c = a*b
        add(g, t, d, f"What is ({a}) × {b}?", c, [str(abs(c)), str(c+b), str(c-b), str(a+b)],
            f"A negative times a positive is negative: {abs(a)}×{b}={abs(c)}, so the answer is {c}.")

def g6_expressions(g, t, d):
    if d == "easy":
        x = random.randint(2, 12); a = random.randint(2, 9); b = random.randint(1, 20)
        c = a*x + b
        add(g, t, d, f"If x = {x}, what is {a}x + {b}?", c, near(c),
            f"Substitute: {a}×{x} = {a*x}, then + {b} = {c}.")
    elif d == "medium":
        a = random.randint(2, 9); c2 = random.randint(2, 12); b = a*c2
        add(g, t, d, f"Solve for x: {a}x = {b}", c2, near(c2),
            f"Divide both sides by {a}: x = {b} ÷ {a} = {c2}.")
    else:
        a = random.randint(2, 8); x = random.randint(2, 12); b = random.randint(1, 15)
        total = a*x + b
        add(g, t, d, f"Solve for x: {a}x + {b} = {total}", x, near(x),
            f"Subtract {b}: {a}x = {total-b}. Divide by {a}: x = {x}.")

def g6_stats(g, t, d):
    nums = sorted(random.sample(range(2, 40), 5))
    if d == "easy":
        c = nums[2]
        add(g, t, d, f"What is the median of {', '.join(map(str,nums))}?", c,
            [str(nums[0]), str(nums[4]), str(nums[1]), str(nums[3])],
            f"The numbers are already in order. The middle one of five values is {c}.", allow_special=False)
    elif d == "medium":
        vals = [random.randint(2, 20) for _ in range(4)]
        while sum(vals) % 4: vals[0] += 1
        c = sum(vals)//4
        add(g, t, d, f"What is the mean of {', '.join(map(str,vals))}?", c, near(c),
            f"Sum = {sum(vals)}. Divide by 4: {c}.")
    else:
        c = nums[4] - nums[0]
        add(g, t, d, f"What is the range of {', '.join(map(str,nums))}?", c, near(c),
            f"Range = largest − smallest = {nums[4]} − {nums[0]} = {c}.")

def g6_geometry(g, t, d):
    if d == "easy":
        b, h = random.choice([4,6,8,10,12,14]), random.choice([3,5,6,7,8,9,10])
        if b*h % 2: return
        c = b*h//2
        add(g, t, d, f"A triangle has base {b} cm and height {h} cm. What is its area?",
            f"{c} sq cm", [f"{b*h} sq cm", f"{c+2} sq cm", f"{b+h} sq cm", f"{c*2+2} sq cm"],
            f"Area = ½ × base × height = ½ × {b} × {h} = {c} sq cm.")
    elif d == "medium":
        b, h = random.randint(5,15), random.randint(3,12)
        c = b*h
        add(g, t, d, f"A parallelogram has base {b} m and height {h} m. What is its area?",
            f"{c} sq m", [f"{c//2} sq m", f"{2*(b+h)} sq m", f"{c+b} sq m", f"{b+h} sq m"],
            f"Area = base × height = {b} × {h} = {c} sq m.")
    else:
        b1, b2, h = random.randint(4,12), random.randint(4,12), random.choice([2,4,6,8])
        c = (b1+b2)*h//2
        if (b1+b2)*h % 2: return
        add(g, t, d, f"A trapezoid has parallel sides {b1} cm and {b2} cm, and height {h} cm. What is its area?",
            f"{c} sq cm", [f"{b1*b2} sq cm", f"{(b1+b2)*h} sq cm", f"{c+h} sq cm", f"{b1+b2+h} sq cm"],
            f"Area = ½ × (b₁+b₂) × h = ½ × ({b1}+{b2}) × {h} = {c} sq cm.")

GRADE6 = [("ratios",[g6_ratios]), ("percent",[g6_percent]), ("integers",[g6_integers]),
          ("expressions",[g6_expressions]), ("statistics",[g6_stats]), ("geometry",[g6_geometry])]

# ═══════════════════════════ GRADE 7 ═══════════════════════════

def g7_proportion(g, t, d):
    if d == "easy":
        a, b = random.choice([(2,5),(3,4),(2,3),(4,7),(3,8)])
        k = random.randint(3, 9); c = b*k
        add(g, t, d, f"Solve the proportion {a}/{b} = {a*k}/x.", c, near(c),
            f"{a} was multiplied by {k}, so multiply {b} by {k} too: {c}.")
    elif d == "medium":
        scale = random.choice([5,10,20,25,50]); cm = random.randint(3, 12)
        c = scale*cm
        add(g, t, d, f"On a map 1 cm represents {scale} km. Two towns are {cm} cm apart on the map. How far apart are they really?",
            f"{c} km", [f"{c+scale} km", f"{c-scale} km", f"{cm+scale} km", f"{c*2} km"],
            f"{cm} × {scale} = {c} km.")
    else:
        cups, serves = random.choice([2,3,4]), random.choice([4,6,8])
        mult = random.choice([2,3,4])
        c = cups*mult
        add(g, t, d, f"A recipe uses {cups} cups of flour for {serves} people. How many cups for {serves*mult} people?",
            f"{c} cups", [f"{cups+mult} cups", f"{c+1} cups", f"{c-1} cups", f"{serves*mult} cups"],
            f"{serves*mult} ÷ {serves} = {mult} times the recipe, so {cups} × {mult} = {c} cups.")

def g7_negatives(g, t, d):
    if d == "easy":
        a = random.randint(-20, -2); b = random.randint(-20, -2)
        c = a + b
        add(g, t, d, f"What is ({a}) + ({b})?", c, [str(abs(c)), str(a-b), str(c+2), str(c-2)],
            f"Both are negative, so add their sizes and keep the minus: {c}.")
    elif d == "medium":
        a = random.randint(2, 15); b = random.randint(2, 15)
        c = a - (-b)
        add(g, t, d, f"What is {a} − ({-b})?", c, [str(a-b), str(-a-b), str(c+1), str(c-1)],
            f"Subtracting a negative is the same as adding: {a} + {b} = {c}.")
    else:
        a = random.randint(-9, -2); b = random.randint(-9, -2)
        c = a*b
        add(g, t, d, f"What is ({a}) × ({b})?", c, [str(-c), str(a+b), str(c+a), str(c-b)],
            f"A negative times a negative is positive: {abs(a)}×{abs(b)} = {c}.")

def g7_equations(g, t, d):
    if d == "easy":
        x = random.randint(2, 15); a = random.randint(2, 9); b = random.randint(1, 20)
        add(g, t, d, f"Solve for x: {a}x + {b} = {a*x+b}", x, near(x),
            f"Subtract {b}: {a}x = {a*x}. Divide by {a}: x = {x}.")
    elif d == "medium":
        x = random.randint(2, 12); a = random.randint(2, 8); b = random.randint(1, 15)
        total = a*(x + b)
        add(g, t, d, f"Solve for x: {a}(x + {b}) = {total}", x, near(x),
            f"Divide both sides by {a}: x + {b} = {total//a}. Subtract {b}: x = {x}.")
    else:
        x = random.randint(2, 10); a = random.randint(3, 9); b = random.randint(1, 2)
        c2 = random.randint(1, 12)
        # a*x + c2 = b*x + (a-b)*x + c2  -> build a genuine two-sided equation
        left_const = random.randint(1, 10)
        right_const = (a - b)*x + left_const
        add(g, t, d, f"Solve for x: {a}x + {left_const} = {b}x + {right_const}", x, near(x),
            f"Subtract {b}x from both sides: {a-b}x + {left_const} = {right_const}. "
            f"Subtract {left_const}: {a-b}x = {right_const-left_const}. Divide by {a-b}: x = {x}.")

def g7_percentapp(g, t, d):
    if d == "easy":
        price = random.choice([20,40,50,80,100]); pct = random.choice([10,20,25,50])
        c = price - price*pct//100
        add(g, t, d, f"A ${price} game is {pct}% off. What is the sale price?", money(c),
            [money(price*pct//100), money(c+5), money(c-5), money(price-pct)],
            f"Discount = {pct}% of ${price} = ${price*pct//100}. ${price} − ${price*pct//100} = ${c}.")
    elif d == "medium":
        price = random.choice([20,40,60,80,120]); pct = random.choice([5,10,25])
        tax = price*pct//100; c = price+tax
        add(g, t, d, f"A ${price} item has {pct}% sales tax. What is the total cost?", money(c),
            [money(price-tax), money(tax), money(c+5), money(price)],
            f"Tax = {pct}% of ${price} = ${tax}. Total = ${price} + ${tax} = ${c}.")
    else:
        old = random.choice([40,50,80,100,200]); pct = random.choice([10,20,25,50])
        new = old + old*pct//100
        add(g, t, d, f"A price rose from ${old} to ${new}. What was the percent increase?",
            f"{pct}%", [f"{pct+10}%", f"{pct-5 if pct>5 else pct+15}%", f"{new-old}%", f"{100-pct}%"],
            f"Increase = ${new-old}. As a percent of the original: {new-old}/{old} = {pct}%.")

def g7_probability(g, t, d):
    if d == "easy":
        total = random.choice([6, 8, 10, 12]); want = random.randint(1, total-1)
        fr = Fraction(want, total)
        add(g, t, d, f"A bag has {total} equally likely marbles, {want} of them red. What is the probability of drawing a red one?",
            fmt_frac(fr), near_frac(fr),
            f"Probability = favorable ÷ total = {want}/{total} = {fmt_frac(fr)}.")
    elif d == "medium":
        sides = random.choice([6, 8, 10, 12, 20])
        form = random.choice(["single", "greater", "even"])
        if form == "single":
            face = random.randint(1, sides)
            fr = Fraction(1, sides)
            add(g, t, d, f"What is the probability of rolling a {face} on a fair {sides}-sided die?",
                fmt_frac(fr), near_frac(fr),
                f"There is 1 winning face out of {sides} equally likely faces: {fmt_frac(fr)}.")
        elif form == "greater":
            cut = random.randint(2, sides-1)
            fr = Fraction(sides-cut, sides)
            add(g, t, d, f"What is the probability of rolling greater than {cut} on a fair {sides}-sided die?",
                fmt_frac(fr), near_frac(fr),
                f"The faces above {cut} are {cut+1} through {sides}, which is {sides-cut} of {sides}: {fmt_frac(fr)}.")
        else:
            fr = Fraction(1, 2)
            add(g, t, d, f"What is the probability of rolling an even number on a fair {sides}-sided die?",
                "1/2", [f"1/{sides}", f"2/{sides}", f"{sides}/2", "1/4"],
                f"Half the faces are even: {sides//2} of {sides} = 1/2.")
    else:
        r, b2 = random.randint(2, 6), random.randint(2, 6)
        total = r + b2
        fr = Fraction(r, total)
        add(g, t, d, f"A jar holds {r} red and {b2} blue marbles. What is the probability of NOT drawing red?",
            fmt_frac(Fraction(b2, total)), near_frac(Fraction(b2, total)),
            f"Not red means blue: {b2} out of {total} = {fmt_frac(Fraction(b2,total))}.")

def g7_circles(g, t, d):
    r = random.randint(2, 12)
    if d == "easy":
        add(g, t, d, f"A circle has radius {r} cm. What is its diameter?",
            f"{2*r} cm", [f"{r} cm", f"{r*r} cm", f"{2*r+2} cm", f"{r//2 if r>1 else r+1} cm"],
            f"Diameter is twice the radius: 2 × {r} = {2*r} cm.")
    elif d == "medium":
        add(g, t, d, f"A circle has radius {r} cm. What is its circumference in terms of π?",
            f"{2*r}π cm", [f"{r}π cm", f"{r*r}π cm", f"{4*r}π cm", f"{r+2}π cm"],
            f"Circumference = 2πr = 2 × π × {r} = {2*r}π cm.")
    else:
        add(g, t, d, f"A circle has radius {r} cm. What is its area in terms of π?",
            f"{r*r}π sq cm", [f"{2*r}π sq cm", f"{r}π sq cm", f"{2*r*r}π sq cm", f"{r*r} sq cm"],
            f"Area = πr² = π × {r}² = {r*r}π sq cm.")

GRADE7 = [("proportions",[g7_proportion]), ("integers",[g7_negatives]), ("equations",[g7_equations]),
          ("percent",[g7_percentapp]), ("probability",[g7_probability]), ("geometry",[g7_circles])]

# ═══════════════════════════ GRADE 8 ═══════════════════════════

def g8_linear(g, t, d):
    if d == "easy":
        m = random.randint(2, 9); b = random.randint(1, 12); x = random.randint(2, 9)
        c = m*x + b
        add(g, t, d, f"For the line y = {m}x + {b}, what is y when x = {x}?", c, near(c),
            f"y = {m}×{x} + {b} = {m*x} + {b} = {c}.")
    elif d == "medium":
        x1, y1 = random.randint(0,5), random.randint(0,8)
        run = random.randint(1,5); rise = random.randint(1,9)
        x2, y2 = x1+run, y1+rise
        fr = Fraction(rise, run)
        add(g, t, d, f"What is the slope of the line through ({x1}, {y1}) and ({x2}, {y2})?",
            fmt_frac(fr), near_frac(fr),
            f"Slope = rise ÷ run = ({y2}−{y1}) ÷ ({x2}−{x1}) = {rise}/{run} = {fmt_frac(fr)}.")
    else:
        m = random.randint(2, 6); b = random.randint(1, 10); y = m*random.randint(2,9)+b
        x = (y-b)//m
        add(g, t, d, f"For the line y = {m}x + {b}, what is x when y = {y}?", x, near(x),
            f"{y} = {m}x + {b}. Subtract {b}: {y-b} = {m}x. Divide by {m}: x = {x}.")

def g8_systems(g, t, d):
    x, y = random.randint(1, 9), random.randint(1, 9)
    if d == "easy":
        s, diff = x+y, x-y
        if diff <= 0: return
        add(g, t, d, f"x + y = {s} and x − y = {diff}. What is x?", x, near(x),
            f"Add the two equations: 2x = {s}+{diff} = {s+diff}, so x = {x}.")
    elif d == "medium":
        a = random.randint(2, 5)
        e1 = a*x + y
        e2 = x + y
        if e1 == e2: return
        add(g, t, d, f"{a}x + y = {e1} and x + y = {e2}. What is x?", x, near(x),
            f"Subtract the second from the first: {a-1}x = {e1-e2}, so x = {x}.")
    else:
        a, b = random.randint(2, 4), random.randint(2, 4)
        e1 = a*x + b*y
        e2 = x - y
        add(g, t, d, f"{a}x + {b}y = {e1} and x − y = {e2}. What is y?", y, near(y),
            f"From the second equation x = y + {e2}. Substitute: {a}(y+{e2}) + {b}y = {e1}, "
            f"so {a+b}y = {e1 - a*e2}, giving y = {y}.")

def g8_exponents(g, t, d):
    if d == "easy":
        b, e = random.randint(2, 6), random.randint(2, 4)
        c = b**e
        if c > 1300: return
        sup = {2:"²",3:"³",4:"⁴"}[e]
        add(g, t, d, f"What is {b}{sup}?", c, near(c, [b,-b,1,-1,e]),
            f"{b}{sup} = {' × '.join([str(b)]*e)} = {c}.")
    elif d == "medium":
        b = random.randint(2, 5); e1, e2 = random.randint(2,4), random.randint(2,4)
        c = e1+e2
        add(g, t, d, f"Simplify {b}^{e1} × {b}^{e2} as a power of {b}.", f"{b}^{c}",
            [f"{b}^{e1*e2}", f"{b}^{abs(e1-e2) if e1!=e2 else e1+1}", f"{b*b}^{c}", f"{b}^{c+1}"],
            f"Multiplying powers with the same base adds the exponents: {e1}+{e2}={c}, so {b}^{c}.")
    else:
        n = random.choice([2,3,4,5,6,7,8,9]); zeros = random.randint(3, 7)
        val = f"{n}" + "0"*zeros
        add(g, t, d, f"Write {int(val):,} in scientific notation.", f"{n} × 10^{zeros}",
            [f"{n} × 10^{zeros+1}", f"{n} × 10^{zeros-1}", f"{n}0 × 10^{zeros}", f"0.{n} × 10^{zeros}"],
            f"Move the decimal point {zeros} places left to get {n}, so the value is {n} × 10^{zeros}.")

BASE_TRIPLES = [(3,4,5),(5,12,13),(8,15,17),(7,24,25),(20,21,29),(9,40,41)]

def g8_pythag(g, t, d):
    a, b, c = random.choice(BASE_TRIPLES)
    k = random.randint(1, 4)
    a, b, c = a*k, b*k, c*k
    if c > 200: return
    if random.random() < 0.5: a, b = b, a
    if d == "easy":
        add(g, t, d, f"A right triangle has legs {a} and {b}. What is the hypotenuse?", c, near(c),
            f"a² + b² = c²: {a}² + {b}² = {a*a} + {b*b} = {c*c}, and √{c*c} = {c}.")
    elif d == "medium":
        add(g, t, d, f"A right triangle has hypotenuse {c} and one leg {a}. What is the other leg?", b, near(b),
            f"c² − a² = b²: {c*c} − {a*a} = {b*b}, and √{b*b} = {b}.")
    else:
        add(g, t, d, f"Is a triangle with sides {a}, {b}, and {c} a right triangle?", "Yes",
            ["No", "Only if it is also isosceles", "Not enough information"],
            f"Check a² + b² = c²: {a*a} + {b*b} = {c*c}. It matches, so yes.", allow_special=False)

def g8_transform(g, t, d):
    x, y = random.randint(1, 8), random.randint(1, 8)
    if d == "easy":
        dx, dy = random.randint(1,6), random.randint(1,6)
        add(g, t, d, f"The point ({x}, {y}) is translated {dx} right and {dy} up. What are the new coordinates?",
            f"({x+dx}, {y+dy})", [f"({x-dx}, {y-dy})", f"({x+dy}, {y+dx})", f"({x+dx}, {y-dy})", f"({dx}, {dy})"],
            f"Add to each coordinate: ({x}+{dx}, {y}+{dy}) = ({x+dx}, {y+dy}).")
    elif d == "medium":
        add(g, t, d, f"The point ({x}, {y}) is reflected across the x-axis. What are the new coordinates?",
            f"({x}, -{y})", [f"(-{x}, {y})", f"(-{x}, -{y})", f"({y}, {x})", f"({x}, {y})"],
            f"Reflecting across the x-axis flips the sign of y: ({x}, -{y}).")
    else:
        k = random.randint(2, 4)
        add(g, t, d, f"The point ({x}, {y}) is dilated by a scale factor of {k} from the origin. What are the new coordinates?",
            f"({x*k}, {y*k})", [f"({x+k}, {y+k})", f"({x*k}, {y})", f"({x}, {y*k})", f"({x//k if x>=k else x}, {y//k if y>=k else y})"],
            f"Multiply both coordinates by {k}: ({x}×{k}, {y}×{k}) = ({x*k}, {y*k}).")

def g8_volume(g, t, d):
    r, h = random.randint(2, 8), random.randint(2, 10)
    if d == "easy":
        c = r*r*h
        add(g, t, d, f"A cylinder has radius {r} and height {h}. What is its volume in terms of π?",
            f"{c}π", [f"{2*r*h}π", f"{r*h}π", f"{c*3}π", f"{r*r+h}π"],
            f"Volume = πr²h = π × {r}² × {h} = {c}π.")
    elif d == "medium":
        if (r*r*h) % 3: return
        c = r*r*h//3
        add(g, t, d, f"A cone has radius {r} and height {h}. What is its volume in terms of π?",
            f"{c}π", [f"{r*r*h}π", f"{c*2}π", f"{c+r}π", f"{r*h}π"],
            f"Volume of a cone = ⅓πr²h = ⅓ × π × {r*r} × {h} = {c}π.")
    else:
        c = 2*r*r + 2*r*h
        add(g, t, d, f"A cylinder has radius {r} and height {h}. What is its total surface area in terms of π?",
            f"{c}π", [f"{2*r*h}π", f"{r*r*h}π", f"{c+r}π", f"{2*r*r}π"],
            f"Surface area = 2πr² + 2πrh = {2*r*r}π + {2*r*h}π = {c}π.")

# ── Grade 8 additions: the load-bearing prerequisites for a Geometry course ──

def g8_transversal(g, t, d):
    """Parallel lines cut by a transversal — the most-used tool in early Geometry."""
    a = random.randint(35, 145)
    b = 180 - a
    if a == 90: return
    if d == "easy":
        kind, val, why = random.choice([
            ("corresponding", a, "Corresponding angles sit in matching corners at each intersection. They are equal."),
            ("vertical", a, "Vertical angles are opposite each other where two lines cross. They are equal."),
        ])
        add(g, t, d, f"Two parallel lines are cut by a transversal. One angle measures {a}°. "
                     f"What is the measure of its {kind} angle?",
            f"{val}°", [f"{b}°", f"{val+10}°", f"{val-10}°", f"{90}°"],
            f"{why} So the answer is {val}°.")
    elif d == "medium":
        kind, val, why = random.choice([
            ("alternate interior", a, "Alternate interior angles lie between the parallel lines on opposite sides of the transversal. They are equal."),
            ("alternate exterior", a, "Alternate exterior angles lie outside the parallel lines on opposite sides of the transversal. They are equal."),
            ("co-interior (same-side interior)", b, "Co-interior angles lie between the parallel lines on the same side of the transversal. They add to 180°."),
        ])
        add(g, t, d, f"Two parallel lines are cut by a transversal. One angle measures {a}°. "
                     f"What is the measure of the {kind} angle?",
            f"{val}°", [f"{180-val}°", f"{val+10}°", f"{val-10}°", "90°"],
            f"{why} {'180 − ' + str(a) + ' = ' + str(val) + '°.' if val == b else 'So it is also ' + str(val) + '°.'}")
    else:
        x = random.randint(2, 12)
        k = random.randint(2, 6)
        c1 = k*x + random.randint(1, 20)
        # corresponding angles equal:  kx + c = angle
        add(g, t, d, f"Two parallel lines are cut by a transversal. One angle measures ({k}x + {c1 - k*x})° "
                     f"and its corresponding angle measures {c1}°. What is x?",
            x, near(x),
            f"Corresponding angles are equal, so {k}x + {c1 - k*x} = {c1}. "
            f"Subtract {c1 - k*x}: {k}x = {k*x}. Divide by {k}: x = {x}.")

def g8_radicals(g, t, d):
    """Square roots and simplifying radicals — needed for special right triangles."""
    if d == "easy":
        n = random.randint(2, 20)
        sq = n*n
        add(g, t, d, f"What is √{sq}?", n, near(n),
            f"√{sq} asks: what number times itself is {sq}? {n} × {n} = {sq}, so √{sq} = {n}.")
    elif d == "medium":
        n = random.randint(3, 15)
        sq = n*n
        lo, hi = n, n+1
        target = sq + random.randint(1, 2*n)
        if target == sq: return
        add(g, t, d, f"Between which two whole numbers does √{target} fall?",
            f"{lo} and {hi}", [f"{lo-1} and {lo}", f"{hi} and {hi+1}", f"{lo} and {hi+1}", f"{target//2} and {target//2+1}"],
            f"{lo}² = {sq} and {hi}² = {hi*hi}. Since {sq} < {target} < {hi*hi}, √{target} is between {lo} and {hi}.")
    else:
        outside = random.choice([2,3,4,5,6,7])
        inside  = random.choice([2,3,5,6,7,10,11])
        val = outside*outside*inside
        add(g, t, d, f"Simplify √{val}.", f"{outside}√{inside}",
            [f"{inside}√{outside}", f"{outside*inside}", f"{outside}√{inside+1}", f"{outside+1}√{inside}"],
            f"Look for a perfect-square factor: {val} = {outside*outside} × {inside}. "
            f"√{outside*outside} = {outside}, so √{val} = {outside}√{inside}.")

def g8_coordgeo(g, t, d):
    """Distance and midpoint — coordinate tools Geometry leans on constantly."""
    a, b, c = random.choice(BASE_TRIPLES)   # gives whole-number distances
    x1, y1 = random.randint(-6, 4), random.randint(-6, 4)
    x2, y2 = x1 + a, y1 + b
    if d == "easy":
        # midpoint with even sums so the answer stays whole
        mx1, my1 = random.randint(-8, 8), random.randint(-8, 8)
        mx2, my2 = mx1 + 2*random.randint(1, 6), my1 + 2*random.randint(1, 6)
        mx, my = (mx1+mx2)//2, (my1+my2)//2
        add(g, t, d, f"What is the midpoint of the segment from ({mx1}, {my1}) to ({mx2}, {my2})?",
            f"({mx}, {my})", [f"({mx2-mx1}, {my2-my1})", f"({mx+1}, {my})", f"({mx}, {my+1})", f"({mx1+mx2}, {my1+my2})"],
            f"Average each coordinate: x = ({mx1}+{mx2})÷2 = {mx}, y = ({my1}+{my2})÷2 = {my}.")
    elif d == "medium":
        add(g, t, d, f"What is the distance between ({x1}, {y1}) and ({x2}, {y2})?",
            c, near(c),
            f"Horizontal change {a}, vertical change {b}. "
            f"d = √({a}² + {b}²) = √({a*a} + {b*b}) = √{c*c} = {c}.")
    else:
        add(g, t, d, f"A segment has one endpoint at ({x1}, {y1}) and midpoint at "
                     f"({x1 + a}, {y1 + b}). Where is the other endpoint?",
            f"({x1 + 2*a}, {y1 + 2*b})",
            [f"({x1+a}, {y1+b})", f"({x1+3*a}, {y1+3*b})", f"({x1-a}, {y1-b})", f"({a}, {b})"],
            f"The midpoint is halfway, so go the same distance again: "
            f"({x1}+2×{a}, {y1}+2×{b}) = ({x1 + 2*a}, {y1 + 2*b}).")

GRADE8 = [("linear",[g8_linear]), ("systems",[g8_systems]), ("exponents",[g8_exponents]),
          ("pythagorean",[g8_pythag]), ("transformations",[g8_transform]), ("geometry",[g8_volume]),
          ("transversals",[g8_transversal]), ("radicals",[g8_radicals]), ("coordgeo",[g8_coordgeo])]

# ═══════════════════════ GRADE 9 · ALGEBRA I ═══════════════════════
# The rung between pre-algebra and a formal Geometry course.

def poly(a, b):
    """Render (x + b) style factor with correct sign."""
    return f"(x {'+' if b >= 0 else '−'} {abs(b)})"

def g9_equations(g, t, d):
    if d == "easy":
        x = random.randint(2, 15); a = random.randint(2, 9); b = random.randint(1, 20)
        add(g, t, d, f"Solve for x: {a}x − {b} = {a*x - b}", x, near(x),
            f"Add {b} to both sides: {a}x = {a*x}. Divide by {a}: x = {x}.")
    elif d == "medium":
        x = random.randint(2, 10); a = random.randint(3, 9); b = random.randint(1, 2)
        lc = random.randint(1, 10); rc = (a - b)*x + lc
        add(g, t, d, f"Solve for x: {a}x + {lc} = {b}x + {rc}", x, near(x),
            f"Subtract {b}x: {a-b}x + {lc} = {rc}. Subtract {lc}: {a-b}x = {rc-lc}. "
            f"Divide by {a-b}: x = {x}.")
    else:
        x = random.randint(2, 9); a = random.randint(2, 5); b = random.randint(1, 6)
        c = random.randint(1, 8)
        total = a*(x + b) - c
        add(g, t, d, f"Solve for x: {a}(x + {b}) − {c} = {total}", x, near(x),
            f"Add {c}: {a}(x + {b}) = {total + c}. Divide by {a}: x + {b} = {(total+c)//a}. "
            f"Subtract {b}: x = {x}.")

def g9_inequalities(g, t, d):
    if d == "easy":
        a = random.randint(2, 8); x = random.randint(2, 12); b = random.randint(1, 15)
        rhs = a*x + b
        add(g, t, d, f"Solve: {a}x + {b} < {rhs}", f"x < {x}",
            [f"x > {x}", f"x < {x+1}", f"x ≤ {x}", f"x < {rhs}"],
            f"Subtract {b}: {a}x < {a*x}. Divide by {a}: x < {x}.")
    elif d == "medium":
        a = random.randint(2, 8); x = random.randint(2, 12); b = random.randint(1, 15)
        add(g, t, d, f"Solve: −{a}x > {-a*x}", f"x < {x}",
            [f"x > {x}", f"x < {-x}", f"x > {-x}", f"x ≥ {x}"],
            f"Divide both sides by −{a}. Dividing by a negative FLIPS the inequality sign, "
            f"so x < {x}.")
    else:
        a = random.randint(2, 6); x = random.randint(3, 12); b = random.randint(1, 10)
        lo = a*x - b
        add(g, t, d, f"Solve: {a}x − {b} ≥ {lo}", f"x ≥ {x}",
            [f"x ≤ {x}", f"x > {x}", f"x ≥ {x+1}", f"x ≥ {lo}"],
            f"Add {b}: {a}x ≥ {a*x}. Divide by {a}: x ≥ {x}. The sign does not flip "
            f"because {a} is positive.")

def g9_factoring(g, t, d):
    r1 = random.randint(1, 9); r2 = random.randint(1, 9)
    if d == "easy":
        # x² + (r1+r2)x + r1r2
        b, c = r1 + r2, r1 * r2
        add(g, t, d, f"Factor: x² + {b}x + {c}", f"(x + {r1})(x + {r2})",
            [f"(x + {r1+1})(x + {r2})", f"(x − {r1})(x − {r2})", f"(x + {b})(x + {c})", f"(x + {r1})(x − {r2})"],
            f"Find two numbers that multiply to {c} and add to {b}: {r1} and {r2}. "
            f"So it factors as (x + {r1})(x + {r2}).", allow_special=False)
    elif d == "medium":
        # x² - (r1+r2)x + r1r2
        b, c = r1 + r2, r1 * r2
        add(g, t, d, f"Factor: x² − {b}x + {c}", f"(x − {r1})(x − {r2})",
            [f"(x + {r1})(x + {r2})", f"(x − {r1})(x + {r2})", f"(x − {b})(x − {c})", f"(x − {r1+1})(x − {r2})"],
            f"Both numbers must multiply to +{c} and add to −{b}, so both are negative: "
            f"−{r1} and −{r2}. So (x − {r1})(x − {r2}).", allow_special=False)
    else:
        n = random.randint(2, 12)
        add(g, t, d, f"Factor: x² − {n*n}", f"(x + {n})(x − {n})",
            [f"(x − {n})(x − {n})", f"(x + {n})(x + {n})", f"(x + {n*n})(x − 1)", f"x(x − {n*n})"],
            f"This is a difference of squares: x² − {n}² = (x + {n})(x − {n}).", allow_special=False)

def g9_quadratics(g, t, d):
    r1 = random.randint(1, 9); r2 = random.randint(1, 9)
    if d == "easy":
        b, c = r1 + r2, r1 * r2
        sols = sorted({-r1, -r2})
        txt = " and ".join(f"x = {s}" for s in sols)
        add(g, t, d, f"Solve: x² + {b}x + {c} = 0", txt,
            [" and ".join(f"x = {s}" for s in sorted({r1, r2})),
             f"x = {-b} and x = {c}", f"x = {b} and x = {c}", f"x = {-r1} and x = {r2}"],
            f"Factor to (x + {r1})(x + {r2}) = 0. Each factor can be zero, "
            f"so x = −{r1} or x = −{r2}.", allow_special=False)
    elif d == "medium":
        b, c = r1 + r2, r1 * r2
        sols = sorted({r1, r2})
        txt = " and ".join(f"x = {s}" for s in sols)
        add(g, t, d, f"Solve: x² − {b}x + {c} = 0", txt,
            [" and ".join(f"x = {s}" for s in sorted({-r1, -r2})),
             f"x = {b} and x = {c}", f"x = {-r1} and x = {r2}", f"x = {r1+1} and x = {r2}"],
            f"Factor to (x − {r1})(x − {r2}) = 0, so x = {r1} or x = {r2}.", allow_special=False)
    else:
        a, b, c = 1, random.randint(2, 10), random.randint(1, 9)
        disc = b*b - 4*a*c
        add(g, t, d, f"For x² + {b}x + {c} = 0, what is the discriminant b² − 4ac?",
            disc, near(disc if disc > 0 else abs(disc) + 1),
            f"b² − 4ac = {b}² − 4({a})({c}) = {b*b} − {4*c} = {disc}. "
            f"{'Positive, so there are two real solutions.' if disc > 0 else ('Zero, so there is one repeated solution.' if disc == 0 else 'Negative, so there are no real solutions.')}")

def g9_radicals(g, t, d):
    if d == "easy":
        o = random.choice([2,3,4,5,6]); i = random.choice([2,3,5,6,7,10])
        add(g, t, d, f"Simplify √{o*o*i}.", f"{o}√{i}",
            [f"{i}√{o}", f"{o*i}", f"{o+1}√{i}", f"{o}√{i+1}"],
            f"{o*o*i} = {o*o} × {i}, and √{o*o} = {o}, so √{o*o*i} = {o}√{i}.")
    elif d == "medium":
        i = random.choice([2,3,5,6,7]); a = random.randint(2, 6); b = random.randint(2, 6)
        add(g, t, d, f"Simplify: {a}√{i} + {b}√{i}", f"{a+b}√{i}",
            [f"{a*b}√{i}", f"{a+b}√{2*i}", f"{a+b}", f"{a+b}√{i*i}"],
            f"Like radicals add the same way like terms do: {a} + {b} = {a+b}, so {a+b}√{i}.")
    else:
        if random.random() < 0.5:
            i = random.choice([2,3,5,6,7,10,11,13,14,15])
            add(g, t, d, f"Simplify: √{i} × √{i}", i,
                [f"√{i}", f"{2*i}", f"{i*i}", f"2√{i}"],
                f"Multiplying a square root by itself undoes the root: √{i} × √{i} = {i}.")
        else:
            a = random.choice([2,3,5,6,7]); b = random.choice([2,3,5,6,7])
            prod = a*b
            root = int(prod ** 0.5)
            if root*root == prod: return          # keep the answer a true surd
            add(g, t, d, f"Simplify: √{a} × √{b}", f"√{prod}",
                [f"√{a+b}", f"{prod}", f"√{prod*2}", f"{a}√{b}"],
                f"Roots multiply under one radical: √{a} × √{b} = √({a}×{b}) = √{prod}.")

def g9_systems(g, t, d):
    x, y = random.randint(1, 9), random.randint(1, 9)
    if d == "easy":
        s, diff = x + y, x - y
        if diff <= 0: return
        add(g, t, d, f"Solve the system: x + y = {s}, x − y = {diff}. What is y?", y, near(y),
            f"Subtract the second equation from the first: 2y = {s} − {diff} = {s-diff}, so y = {y}.")
    elif d == "medium":
        a = random.randint(2, 5); b = random.randint(2, 5)
        e1 = a*x + y; e2 = x + b*y
        add(g, t, d, f"Solve the system: {a}x + y = {e1}, x + {b}y = {e2}. What is x?", x, near(x),
            f"From the first equation y = {e1} − {a}x. Substitute into the second: "
            f"x + {b}({e1} − {a}x) = {e2}, which gives x = {x}.")
    else:
        m1 = random.randint(2, 5); c1 = random.randint(1, 8)
        m2 = m1 + random.randint(1, 4); c2 = m1*x + c1 - m2*x
        add(g, t, d, f"At what x-value do the lines y = {m1}x + {c1} and y = {m2}x + {c2} intersect?",
            x, near(x),
            f"Set them equal: {m1}x + {c1} = {m2}x + {c2}. "
            f"Rearranged, {m2-m1}x = {c1-c2}, so x = {x}.")

def g9_functions(g, t, d):
    if d == "easy":
        a = random.randint(2, 9); b = random.randint(1, 12); x = random.randint(2, 9)
        add(g, t, d, f"If f(x) = {a}x + {b}, what is f({x})?", a*x+b, near(a*x+b),
            f"Substitute {x} for x: f({x}) = {a}({x}) + {b} = {a*x} + {b} = {a*x+b}.")
    elif d == "medium":
        a = random.randint(2, 5); b = random.randint(1, 9); x = random.randint(2, 6)
        val = a*x*x + b
        add(g, t, d, f"If f(x) = {a}x² + {b}, what is f({x})?", val, near(val),
            f"f({x}) = {a}({x})² + {b} = {a}({x*x}) + {b} = {a*x*x} + {b} = {val}.")
    else:
        m = random.randint(2, 6); b = random.randint(1, 10); y = m*random.randint(2, 9) + b
        x = (y - b)//m
        add(g, t, d, f"If f(x) = {m}x + {b} and f(x) = {y}, what is x?", x, near(x),
            f"Set {m}x + {b} = {y}. Subtract {b}: {m}x = {y-b}. Divide by {m}: x = {x}.")

GRADE9 = [("equations",[g9_equations]), ("inequalities",[g9_inequalities]),
          ("factoring",[g9_factoring]), ("quadratics",[g9_quadratics]),
          ("radicals",[g9_radicals]), ("systems",[g9_systems]), ("functions",[g9_functions])]

# ═══════════════════════ BUILD EVERY GRADE ═══════════════════════

GRADES = {2: GRADE2, 3: GRADE3, 4: GRADE4, 5: GRADE5, 6: GRADE6, 7: GRADE7,
          8: GRADE8, 9: GRADE9}
PER_BUCKET = 8

for grade, topics in GRADES.items():
    for topic, gens in topics:
        for diff in ("easy", "medium", "hard"):
            fill(grade, topic, diff, gens, PER_BUCKET)

# ───────────────────────── validation ─────────────────────────

for x in Q:
    assert 0 <= x["answer"] < len(x["choices"]), x
    assert len(set(x["choices"])) == len(x["choices"]), f"duplicate choices: {x}"
    assert len(x["choices"]) >= 4, x
    assert x["q"].strip() and x["explain"].strip(), x

counts = Counter((x["grade"], x["diff"]) for x in Q)
for grade in GRADES:
    for diff in ("easy", "medium", "hard"):
        n = counts[(grade, diff)]
        assert n >= 25, f"grade {grade} {diff} has only {n} questions (need 25 for a full test)"

print(f"Total questions: {len(Q)}")
for grade in sorted(GRADES):
    tops = sorted({x["topic"] for x in Q if x["grade"] == grade})
    per = [counts[(grade, d)] for d in ("easy","medium","hard")]
    print(f"  Grade {grade}: {sum(per):3d}  (e/m/h {per[0]}/{per[1]}/{per[2]})  topics: {', '.join(tops)}")

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "math_questions.json")
with open(out, "w") as f:
    json.dump(Q, f, ensure_ascii=False)
print("saved", os.path.basename(out))

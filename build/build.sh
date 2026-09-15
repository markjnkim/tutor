#!/usr/bin/env bash
# Regenerate the question/word banks and inline them into the app HTML files.
#
#   ./build/build.sh
#
# The apps are single self-contained files, so the banks are embedded at build
# time rather than fetched at runtime. Edit the templates or the word JSON,
# then run this to produce the playable HTML.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

echo "→ Generating math questions…"
python3 "$HERE/gen_math_grades.py"

echo "→ Deriving grade 5-6 word list…"
python3 - "$HERE" <<'PY'
# words_a/words_b are the originally authored grade 5-6 pool, written before
# words carried a grade tag. Both grades draw from that same pool, so tag a
# copy for each. Derived here so the file never has to be hand-maintained.
import json, sys, os
here = sys.argv[1]
base = json.load(open(os.path.join(here,'words_a.json'))) + \
       json.load(open(os.path.join(here,'words_b.json')))
out = []
for g in (5, 6):
    for e in base:
        w = dict(e); w['g'] = g; out.append(w)
json.dump(out, open(os.path.join(here,'words_g56.json'),'w'), ensure_ascii=False, indent=0)
print(f"   {len(out)} entries ({len(base)} words x grades 5,6)")
PY

echo "→ Merging spelling words…"
python3 - "$HERE" <<'PY'
import json, sys, os
here = sys.argv[1]
words = []
for f in ('words_g34.json','words_g56.json','words_g78.json'):
    words += json.load(open(os.path.join(here, f)))
seen = set()
for w in words:
    assert 'g' in w, f"missing grade tag: {w['w']}"
    k = (w['g'], w['w'].lower())
    assert k not in seen, f"duplicate word in grade {w['g']}: {w['w']}"
    seen.add(k)
    assert w['w'].lower() in w['s'].lower(), f"sentence missing its word: {w['w']}"
grades = sorted({w['g'] for w in words})
json.dump(words, open(os.path.join(here,'spelling_words.json'),'w'), ensure_ascii=False)
print(f"   {len(words)} words across grades {grades}")
PY

echo "→ Building panda-math.html…"
python3 - "$HERE" "$ROOT" <<'PY'
import sys, os
here, root = sys.argv[1], sys.argv[2]
qs = open(os.path.join(here,'math_questions.json')).read()
html = open(os.path.join(here,'panda-math.template.html')).read()
assert '__QUESTIONS__' in html, 'template missing __QUESTIONS__ placeholder'
open(os.path.join(root,'panda-math.html'),'w').write(html.replace('__QUESTIONS__', qs))
PY

echo "→ Building spelling-bee.html…"
python3 - "$HERE" "$ROOT" <<'PY'
import sys, os
here, root = sys.argv[1], sys.argv[2]
ws = open(os.path.join(here,'spelling_words.json')).read()
html = open(os.path.join(here,'spelling-bee.template.html')).read()
assert '__WORDS__' in html, 'template missing __WORDS__ placeholder'
open(os.path.join(root,'spelling-bee.html'),'w').write(html.replace('__WORDS__', ws))
PY

echo "→ Building geometry.html…"
python3 - "$HERE" "$ROOT" <<'PY'
import sys, os
here, root = sys.argv[1], sys.argv[2]
lessons = open(os.path.join(here,'geometry_lessons.js')).read()
html = open(os.path.join(here,'geometry.template.html')).read()
assert '__CURRICULUM__' in html, 'template missing __CURRICULUM__ placeholder'
open(os.path.join(root,'geometry.html'),'w').write(html.replace('__CURRICULUM__', lessons))
PY

echo "→ Building typing.html…"
python3 - "$HERE" "$ROOT" <<'PY'
import sys, os
here, root = sys.argv[1], sys.argv[2]
lessons = open(os.path.join(here,'typing_lessons.js')).read()
html = open(os.path.join(here,'typing.template.html')).read()
assert '__CURRICULUM__' in html, 'template missing __CURRICULUM__ placeholder'
open(os.path.join(root,'typing.html'),'w').write(html.replace('__CURRICULUM__', lessons))
PY

echo "✓ Build complete."
echo
echo "Run the tests with:  ./build/test.sh"

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# One-time git setup for the Tutor repo.
#
#   cd ~/Repos/tutor
#   bash setup-git.sh
#
# Creates the initial commit locally, then prints the command to
# create the private GitHub repo and push. It does NOT push by
# itself and never touches your credentials.
#
# Safe to read before running. It only touches this folder.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
echo "Working in: $(pwd)"
echo

# ── Already a real repo? Then this script has done its job. ──
if [ -d .git ] && git rev-parse HEAD >/dev/null 2>&1; then
  echo "This folder already has a git repo with commits."
  echo "Use normal git commands from here — for example:"
  echo
  echo "    git add -A && git commit -m 'your message'"
  echo "    git push"
  exit 0
fi

# An interrupted earlier attempt can leave an empty .git stub.
if [ -d .git ]; then
  echo "→ Removing incomplete .git stub…"
  rm -rf .git
fi

# Leftover scratch file from a sandbox permissions probe.
rm -f .__deltest

echo "→ git init"
git init -q
git branch -M main

git config user.name  >/dev/null 2>&1 || git config user.name  "Mark Kim"
git config user.email >/dev/null 2>&1 || git config user.email "mark.jn.kim@gmail.com"

echo "→ Staging files (.gitignore excludes images/, bak/ and node_modules/)"
git add -A

# ── Safety: student photos must never enter version control ──
if git diff --cached --name-only | grep -qiE '^images/|\.(jpe?g|png|heic)$'; then
  echo
  echo "STOPPING: image files are staged."
  echo "The images/ folder holds photos of student schoolwork, including an"
  echo "assessment report with a child's name, school, and teacher."
  echo "Check .gitignore before continuing."
  exit 1
fi
echo "   ✓ no photos or image files staged"

echo
echo "→ Files to be committed:"
git diff --cached --name-only | sed 's/^/     /'
echo

git commit -q -F - <<'COMMITMSG'
Tutor: browser-based practice apps for grades 2-8

Four self-contained HTML apps sharing one storage layer and one
sidebar. No build step needed to run them, no server, no runtime
dependencies — open index.html and pick a subject.

Apps:
- panda-math.html    25 multiple-choice questions, grades 2-8
- spelling-bee.html  20 spoken words typed back, grades 3-8
- korean.html        12-lesson Hangul curriculum journey
- tests/daily-test-2026-05-23-math7.html  grade 7 math
- index.html         subject picker

tutor-store.js is the shared storage layer. Logins are
case-insensitive, so Robin/robin/ROBIN resolve to one account with
the first spelling kept as the display name. Each app namespaces its
data under a single student record, so subjects score separately but
travel together. Full per-question history is retained, including
time spent and, for spelling, replay counts and which audio helpers
were used. Deleting requires confirmation and archives to a
deleted-data page rather than erasing.

tutor-nav.js is the sidebar. Apps call TutorNav.init({app: APP_ID})
and it builds itself, marking the current app and working out link
depth from the URL so pages under tests/ resolve through ../ without
being told.

Grade level decides which concepts appear; easy/medium/hard tunes
difficulty within that grade, so a strong student can take the next
grade on Easy. Math covers grades 2-8 with 984 questions across six
topics per grade; spelling covers 3-8 with 580 words across eight
spelling patterns. Grades 9-12 appear in the picker but are disabled
until content exists. Korean has no grade picker on purpose — it is a
sequential curriculum where lessons unlock in order.

Question and word banks are generated and validated by scripts in
build/ rather than hand-maintained in the HTML. Math answers are
computed with exact arithmetic so a stated answer cannot drift from
the real one, and a separate check re-parses question text to
recompute answers independently, so a generator bug cannot validate
itself. Spelling words are dictionary-checked and verified to appear
in their own example sentences. build.sh inlines the banks into the
app files, which is what keeps each app a single portable file.
Rebuilds are deterministic.

Six test suites cover the storage layer, all three student apps,
grade selection, sidebar routing, grading edge cases, and the
no-speech-support fallback. Run ./build/test.sh.

Excluded from version control: images/, which holds photos of student
schoolwork including an assessment report with a child's name, school
and teacher; and bak/, which holds superseded originals kept locally
for reference. Both stay on the local machine.
COMMITMSG

echo "✓ Commit created:"
git log --oneline -1 | sed 's/^/     /'
echo

cat <<'NEXT'
─────────────────────────────────────────────────────────────
Next: create the GitHub repo and push.

If you have the GitHub CLI (gh):

    gh repo create tutor --private --source=. --remote=origin --push

Without gh — create an empty private repo named "tutor" at
https://github.com/new (no README, no .gitignore, no license), then:

    git remote add origin https://github.com/YOUR-USERNAME/tutor.git
    git push -u origin main

To check gh is signed in first:  gh auth status
─────────────────────────────────────────────────────────────
NEXT

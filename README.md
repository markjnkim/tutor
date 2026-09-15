# Tutor

A set of self-contained, browser-based practice tests for a grade 5–6 student.
No build step, no server, no dependencies — every app is a single HTML file you
open directly in a browser.

## Apps

| File | Subject | Format |
|---|---|---|
| `index.html` | Home | Subject picker |
| `panda-math.html` | Math, grades 2–8 | 25 multiple-choice questions |
| `spelling-bee.html` | Spelling, grades 3–8 | 20 words read aloud, typed answers |
| `geometry.html` | Geometry | 12-lesson illustrated curriculum |
| `typing.html` | Typing | 12-stop typing journey, screen then ear |
| `states-capitals.html` | US geography | Map quiz, states + capitals |
| `korean.html` | Korean (한글) | 12-lesson curriculum journey |
| `tests/daily-test-2026-05-23-math7.html` | Math, grade 7 | 20 multiple-choice questions |

Open `index.html` and pick a subject from the dropdown. Every page also has a
sidebar (the ☰ button, top left) for jumping between apps without going home.

## Grade levels

Both student apps have a grade picker. **Grade decides which concepts appear;
easy/medium/hard tunes the challenge within that grade** — so a strong fifth
grader can run Grade 6 on Easy.

- Math covers **grades 2–9**: 1,224 questions. Grade 9 is Algebra I.
- Spelling covers **grades 3–8**: 580 words, eight spelling patterns.
- Grades 10–12 show in the picker but are disabled until content exists.

한글 Adventure has **no grade picker**. It is a sequential curriculum — alphabet,
then syllables, then words, then phrases — where lessons unlock in order, so a
grade band would not mean anything. It still uses the same login and shares one
student record with the other apps.

The chosen grade is saved per student, so it comes back next visit.

When a grade/difficulty bucket has fewer entries than a full test needs, the
app tops up from the same grade's other difficulty bands rather than repeating
items or shipping a short test.

## Shared pieces

**`tutor-nav.js`** — the sidebar. Apps call `TutorNav.init({app: APP_ID})` and
it builds itself; no markup needed in the page. It marks the current app and
works out link depth from the URL, so pages under `tests/` resolve through `../`
without being told. Add an entry to the `APPS` array and the link appears in
every sidebar.

**`tutor-store.js`** — the storage layer every app uses. Handles:

- **Case-insensitive logins.** `Robin`, `robin`, and `ROBIN` are one account;
  the first spelling entered becomes the display name.
- **Per-app data** under one user record, so a student's math and spelling
  progress live together but score separately.
- **Full answer history** — every question, what was answered, whether it was
  right, and how long it took.
- **Archive-on-delete.** Deleting progress moves it to a "deleted data" page
  rather than erasing it. Deletion always requires confirmation.
- **Selective delete.** `deleteResults(name, appId, dates)` removes individual
  test records rather than a whole app's history, archives them the same way,
  and recomputes the stored best score — the deleted run may have been holding it.

Everything persists to `localStorage` under the key `tutorApp.v1`. Data never
leaves the browser — there is no backend.

### Stored per test

```
app, subject, gradeLevel, date, player, playerKey, difficulty,
timed, timeLimitSec, timeTakenSec, score, total, pct, win, perfect,
skippedCount, topics{}, answers[]
```

### Stored per question

```
qId/word, topic or pattern, difficulty, order, question text, choices,
correct answer, what the student picked or typed, correct, skipped,
seconds spent
```

Spelling adds `replays` (how many times the word was played) and `helpers`
(which of slow / sentence / definition were used). A word answered correctly
after five replays is worth a second look — accuracy alone hides that.

## How the apps work

Both student-facing tests share the same shape:

1. Log in by name.
2. Pick a difficulty. This sets both the question pool and the timer length.
   The timer is optional and can be extended mid-test.
3. Answer questions. Skipping is allowed and counts as incorrect.
4. A panda advances toward bamboo with each correct answer.
   80% feeds the panda (confetti); 100% earns a bonus treat (fireworks).
5. Results show every missed question with a full explanation, mastery bars by
   topic, a leaderboard, and full history.

Explanations are deliberately withheld until the end so the test measures what
the student knows rather than teaching mid-question.

### Spelling specifics

Words are spoken with the browser's built-in Web Speech API — no API key, no
audio files, works offline. Voice quality varies by machine, so the setup
screen has a voice picker with a preview button.

Two behaviors that look like bugs but aren't:

- **The first word isn't spoken automatically.** Browsers block audio until the
  user interacts with the page, so the student clicks to hear word one.
- **The example sentence is shown with the word blanked out** (`______`) while
  being spoken in full. Displaying it would give away the spelling.

Grading is exact and case-insensitive; surrounding whitespace is ignored.
The review screen shows a letter-by-letter diff — wrong letters in red, missing
letters in blue.

## Question and word banks

Both banks are generated and validated by scripts rather than hand-maintained
in the HTML:

- Math questions are produced with exact arithmetic (Python `Fraction`), so a
  stated answer cannot drift from the real one. `build/gen_math_grades.py` holds
  one generator set per grade. A separate check in the test suite re-parses
  question text and recomputes answers independently, so a bug in a generator
  can't validate itself.
- Spelling words are checked against a dictionary, verified to appear in their
  own example sentence, and checked for duplicates.

The generated banks are inlined into the HTML at build time, which is what keeps
each app a single portable file.

## Adding a new subject

1. Copy `panda-math.html` or `spelling-bee.html` as a starting point.
2. Give it a unique `APP_ID`. That key namespaces its data inside `tutor-store.js`.
3. Add an `<option>` to the dropdown in `index.html`.
4. Add a row to the `APPS` array in `tutor-nav.js` so it joins the sidebar.

Any new app that includes `tutor-store.js` inherits logins, history, the
leaderboard, and the delete/archive behavior automatically.

## Reviewing mistakes

**Every app** keeps a **Review past mistakes** panel on its progress page. Pick any earlier test from the dropdown and every question missed or
skipped comes back with the correct answer and the original explanation —
spelling additionally shows the letter-by-letter diff, an example sentence, the
definition, and a button to hear the word again. Tests where nothing was missed
are left out of the picker, so the list only contains things worth revisiting.

What each app shows in review:

| App | Brings back |
|---|---|
| Panda Math | Question, her answer, correct answer, worked explanation |
| Spelling Bee | Letter-by-letter diff, correct spelling, replay button, sentence, definition |
| Shape Quest | Question **with its diagram**, choice made, correct answer, explanation |
| Wind Courier | The mistyped line with a keystroke-level diff against the intended text |
| Math Grade 7 | Question, answer picked, correct answer, explanation |

Math Grade 7 had no progress page at all before this — it went login, test,
results. It now has one, reachable from the results screen and from the login
screen (type your name, then "See my past results") so you can look back
without retaking the test.

The history table gives each test a checkbox and, where relevant, a
`Review N` button. Selected records can be deleted on their own; the rest of the
history stays put and the page does not navigate away. Deleting everything is
still available but is labelled distinctly so the two are hard to confuse.

Partial deletes are careful about derived state. The stored best score is
recomputed from what remains, since the deleted run may have been holding it.
In Shape Quest and Wind Courier, deleting an attempt does **not** re-lock
lessons or reset per-stop bests — removing a record of a past run should not
undo progress the student actually earned.

## Where geometry and typing fit

**Shape Quest** (`geometry.html`) teaches geometry from a single point through
to writing a short proof, in 12 illustrated stops. Every teaching step carries
an SVG diagram — 49 of them — because angles and parallel lines cannot be taught
by quizzing alone. Lessons unlock in order and need 75% to clear.

It doubles as the bridge to a formal Geometry course. The standard US path runs
Pre-Algebra (8) → Algebra I (9) → Geometry (10), and the pieces most often
missing when a student arrives at Geometry are parallel-line angle rules,
radicals, the distance and midpoint formulas, and any experience of deductive
reasoning. Shape Quest covers the first and last directly; the middle two were
added to Panda Math grade 8 (`transversals`, `radicals`, `coordgeo`), and
grade 9 now offers a full Algebra I tier.

**The Wind Courier** (`typing.html`) teaches touch typing as a journey across a
valley. Fundamentals first — home row, then reaching up and down — followed by
rote drills on pangrams and the commonest English words, and finally typing
**by ear alone** with the text hidden. Graded on words per minute and accuracy,
with 90% accuracy required to move on, because speed built on sloppy fingers
does not hold. Each line is scored character by character and the review shows
exactly which keystrokes slipped.

## 한글 Adventure

A different shape from the two test apps: a journey where Mei walks home, one
lesson per stop, unlocking as you go. Seeds are the reward currency and each
lesson ends with a quiz.

Its lesson progress is stored under the signed-in name like everything else,
and each completed quiz is also written to shared history so Korean appears in
progress reporting alongside math and spelling.

The standalone version kept everything in a browser key called `hangul_v2` with
no name attached. On first login the app claims that data, writes it to the
signed-in student, and clears the old key — otherwise the next student to sign
in would inherit someone else's progress.

## Sharing with another person on the same Mac

`share-with-family.sh` copies the apps to `/Users/Shared/Tutor` and makes them
world-readable. macOS home folders are private by default, so a second account
cannot reach `~/Repos/tutor` — `/Users/Shared` exists for exactly this.

    bash share-with-family.sh

Re-run it after any rebuild to push the newest version across.

### Two layers of "account", and how they interact

1. **The macOS login.** Browsers store data per macOS account, so a second
   person logging into their own Mac account gets a completely separate
   `localStorage` — their own scores, history and bests, with nothing shared
   in either direction. No code does this; the operating system does.
2. **The name typed into the app.** This is the in-app layer, for when several
   people share one macOS account. Names are case-insensitive and each gets its
   own record inside that one browser's storage.

If each child has their own macOS login, layer 1 already separates them and the
in-app name is just a label. If they share a login, layer 2 is what keeps their
progress apart.

## A note on file layout

`tests/` sits one level down, so the Grade 7 test loads the store from `../`
while the root apps load it from `./`. Moving files between those levels breaks
the script path — adjust the `<script src>` if you reorganize.

## bak/ and apps/

`bak/` holds superseded originals — the standalone `korean.html` before it was
integrated, and the first grade 5–6-only math generator. Nothing there is live.
It is **excluded from version control**: git history already preserves anything
that was committed, so there is no reason to ship dead code. It stays on the
local machine for reference. `bak/README.md` says what replaced what.

`apps/` is a leftover folder containing only a redirect stub. It can be deleted.

## What is and isn't committed

The built apps (`panda-math.html`, `spelling-bee.html`) **are** committed even
though `build.sh` generates them — they are the deliverable, and a clone should
be usable by opening `index.html` without installing Python or Node.

The intermediate JSON is **not** committed. Those files are large, written by
machine, and rewritten wholesale on every build, which makes for noisy diffs and
pointless merge conflicts. Everything needed to regenerate them is in the repo:

| Not committed | Rebuilt from |
|---|---|
| `build/math_questions.json` | `build/gen_math_grades.py` |
| `build/words_g56.json` | `build/words_a.json` + `build/words_b.json` |
| `build/spelling_words.json` | `words_g34` + `words_g56` + `words_g78` |

Deleting all three and running `./build/build.sh` reproduces both app files
byte-for-byte.

`build/package-lock.json` **is** committed, so the test suites always run
against the jsdom version they were written for.

## Not in this repo

The `images/` folder is intentionally excluded (see `.gitignore`). It contains
photos of student schoolwork, including an assessment report with a child's
name, school, and teacher. That material stays on the local machine.

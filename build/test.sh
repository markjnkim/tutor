#!/usr/bin/env bash
# Run every test suite against the built HTML apps.
#
#   ./build/test.sh
#
# Requires jsdom:  npm install jsdom
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

if [ ! -d node_modules/jsdom ]; then
  echo "Installing jsdom…"
  npm install jsdom --silent
fi

fail=0
for suite in lib_test.js smoke.js store_test.js spell_test.js grade_test.js korean_test.js geom_test.js typing_test.js wattsup_test.js review_test.js review_all_test.js; do
  echo
  echo "═══ $suite ═══"
  if node "$suite" 2>&1 | grep -v "Not implemented"; then :; else fail=1; fi
done

echo
if [ "$fail" -eq 0 ]; then echo "✓ All suites passed."; else echo "✗ Some suites failed."; fi
exit "$fail"

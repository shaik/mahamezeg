#!/bin/sh
set -e

echo "→ Linting..."
if [ -f node_modules/.bin/eslint ]; then
  npm run lint
else
  echo "  (ESLint not installed — run 'npm install' once to enable full linting)"
  echo "  Running Node.js syntax check as fallback..."
  for f in app.js weatherService.js phraseMatrix.js locationConfig.js demoMode.js; do
    node --check "$f" && echo "  ✓ $f"
  done
fi

echo "→ Pushing..."
git push
echo "✓ Deployed to https://shaikfir.com/mahamezeg/"

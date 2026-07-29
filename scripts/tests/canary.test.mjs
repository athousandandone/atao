// Canary matcher tests: the guarded surface is git push, gh pr create,
// gh pr merge and the Netlify CLI. Matching biases towards recall — an
// accepted false positive costs one permission prompt; a false negative
// defeats the canary. Run: node --test scripts/tests/*.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findGuardedCommand } from '../../.claude/hooks/canary.mjs';

test('plain and argumented git push are guarded', () => {
  assert.equal(findGuardedCommand('git push'), 'git push');
  assert.equal(findGuardedCommand('git push origin main'), 'git push');
  assert.equal(findGuardedCommand('git push --force-with-lease'), 'git push');
});

test('git push behind flags, -C paths and env assignments is guarded', () => {
  assert.equal(findGuardedCommand('git -C /Users/olvado/scrivener/endeavour/atao push'), 'git push');
  assert.equal(findGuardedCommand('git -c user.name=x push'), 'git push');
  assert.equal(findGuardedCommand('GIT_TRACE=1 git push'), 'git push');
});

test('git push inside compound commands and substitutions is guarded', () => {
  assert.equal(findGuardedCommand('npm test && git push'), 'git push');
  assert.equal(findGuardedCommand('git fetch; git push origin main'), 'git push');
  assert.equal(findGuardedCommand('echo $(git push)'), 'git push');
});

test('recall bias: a bare push token in a git command trips the canary', () => {
  // Accepted false positive — costs one prompt under "ask" enforcement.
  assert.equal(findGuardedCommand('git log --grep push'), 'git push');
});

test('non-push git commands pass', () => {
  assert.equal(findGuardedCommand('git status'), null);
  assert.equal(findGuardedCommand('git log --grep=push'), null);
  assert.equal(findGuardedCommand('git checkout -b chore/canary-hook'), null);
  assert.equal(findGuardedCommand('git commit -m "push the boundary"'), null);
});

test('gh pr create and merge are guarded', () => {
  assert.equal(findGuardedCommand('gh pr create --title "Canary"'), 'gh pr create');
  assert.equal(findGuardedCommand('gh pr merge 8 --rebase'), 'gh pr merge');
  assert.equal(findGuardedCommand('gh --repo athousandandone/atao pr merge 8'), 'gh pr merge');
});

test('read-only gh commands and review replies pass', () => {
  assert.equal(findGuardedCommand('gh pr view 8'), null);
  assert.equal(findGuardedCommand('gh pr list'), null);
  assert.equal(findGuardedCommand('gh api repos/athousandandone/atao/pulls/8/comments'), null);
});

test('the Netlify CLI is guarded under both names', () => {
  assert.equal(findGuardedCommand('netlify deploy --prod'), 'netlify (Netlify CLI)');
  assert.equal(findGuardedCommand('netlify status'), 'netlify (Netlify CLI)');
  assert.equal(findGuardedCommand('ntl deploy'), 'ntl (Netlify CLI)');
});

test('mentions inside plain strings pass', () => {
  assert.equal(findGuardedCommand('echo "git push"'), null);
  assert.equal(findGuardedCommand('grep -r "netlify" docs/'), null);
});

test('unrelated commands pass', () => {
  assert.equal(findGuardedCommand('npm run build && npm run verify'), null);
  assert.equal(findGuardedCommand('ls -la'), null);
  assert.equal(findGuardedCommand(''), null);
});

// Canary (working agreement): push, PR creation, merge and deploy happen
// only on the Editor's explicit instruction. This PreToolUse hook enforces
// that structurally — outside the assistant's reasoning — by forcing a
// per-invocation permission prompt ("ask") for the guarded commands, which
// overrides any standing allowlist entry.
//
// Guarded surface: any `git … push`, `gh pr create`, `gh pr merge`, and the
// Netlify CLI (`netlify` / `ntl`). Matching biases towards recall: a false
// positive costs one extra prompt; a false negative is the failure the
// canary exists to prevent. Known residual gaps, accepted and recorded:
// commands nested inside quoted strings (e.g. `sh -c "git push"`) and
// mutation-shaped `gh api` calls are not intercepted — `gh api` stays open
// because threaded review replies legitimately use it.
//
// Contract: reads the tool-call JSON on stdin; on a match, emits a
// hookSpecificOutput JSON with permissionDecision "ask". On no match, exits
// silently. On malformed input it exits 1 (visible, non-blocking) rather
// than paralysing every Bash call.

import { pathToFileURL } from 'node:url';

// Wrapper commands and environment assignments that may precede the real
// command within a simple-command chunk.
const WRAPPERS = new Set([
  'sudo', 'env', 'command', 'exec', 'time', 'nice', 'nohup', 'xargs',
]);

const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

/** Split a shell command into simple-command chunks at compound operators,
 * pipes, newlines, subshells and command substitutions. Quoting is
 * deliberately not parsed — see the recall bias note above. */
function splitSimpleCommands(command) {
  return String(command).split(/\|\||&&|;|\||\n|\$\(|`|\(|\)/);
}

function leadingTokens(chunk) {
  const tokens = chunk.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < tokens.length && (ENV_ASSIGNMENT.test(tokens[i]) || WRAPPERS.has(tokens[i]))) {
    i += 1;
  }
  return tokens.slice(i);
}

/** Return a short description of the guarded command found, or null. */
export function findGuardedCommand(command) {
  for (const chunk of splitSimpleCommands(command)) {
    const tokens = leadingTokens(chunk);
    if (tokens.length === 0) continue;
    const head = tokens[0];

    if (head === 'git' && tokens.slice(1).includes('push')) {
      return 'git push';
    }

    if (head === 'gh') {
      // Non-flag words only, located positionally rather than at a fixed
      // index so global flags with arguments (e.g. --repo <name>) cannot
      // hide the subcommand.
      const words = tokens.slice(1).filter((t) => !t.startsWith('-'));
      const pr = words.indexOf('pr');
      if (pr !== -1 && (words[pr + 1] === 'create' || words[pr + 1] === 'merge')) {
        return `gh pr ${words[pr + 1]}`;
      }
    }

    if (head === 'netlify' || head === 'ntl') {
      return `${head} (Netlify CLI)`;
    }
  }
  return null;
}

async function main() {
  let raw = '';
  for await (const piece of process.stdin) raw += piece;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write('canary: could not parse hook input\n');
    process.exit(1);
  }

  if (payload.tool_name !== 'Bash') return;

  const hit = findGuardedCommand(payload.tool_input?.command ?? '');
  if (hit === null) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        `Canary: ${hit} requires the Editor's per-invocation approval — `
        + 'push, PR creation, merge and deploy happen only on explicit '
        + 'instruction (.claude/rules/00-working-agreement.md).',
    },
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

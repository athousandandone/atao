#!/bin/bash
# Canary: verify the pen's final message opens with a salutation to the Editor.
#
# The greeting (.claude/rules/00-working-agreement.md) is a deliberate
# context-drift canary: it is the cheapest instruction to follow, so the first
# thing to slip when context thins. A miss is therefore an early warning that
# weightier rules — the push/PR/merge/deploy checkpoints, secrets discipline —
# may be slipping too. The Slice 6 breach (2026-07-28) was this failure mode:
# good ruled text, thinned out of a long context at the wrong moment.
#
# This hook moves detection out of model discretion. On a miss it blocks the
# stop and asks the pen to RE-ANCHOR on .claude/rules/ before replying again —
# turning the canary into a recovery trigger, not just a reminder.
#
# Wired via .claude/settings.json Stop hook. Name-agnostic: it checks for the
# greeting *form* (a name must be present), not a particular name.

# Kill-switch: `export CLAUDE_DISABLE_SALUTATION_CANARY=1` disables the canary
# locally with no commit. Hooks merge additively across settings files, so
# settings.local.json cannot remove a hook that settings.json defines; the env
# var is the per-machine opt-out. The default stays on.
[[ -n "$CLAUDE_DISABLE_SALUTATION_CANARY" ]] && exit 0

INPUT=$(cat)

# The canary must never block normal work on its own infra failures: if jq is
# unavailable, do nothing rather than risk a false trip. Checked before any jq
# use. printf (not echo) avoids -n/-e flag and escape quirks on the JSON input.
command -v jq >/dev/null 2>&1 || exit 0

# Avoid loops: if we're already inside a stop-hook continuation, allow the stop.
ACTIVE=$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
[[ "$ACTIVE" == "true" ]] && exit 0

TRANSCRIPT=$(printf '%s' "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
[[ -z "$TRANSCRIPT" || ! -f "$TRANSCRIPT" ]] && exit 0

# First ~80 chars of the last assistant text block in the transcript.
LAST=$(jq -rs '[.[] | select(.type=="assistant")] | last
                | .message.content[]? | select(.type=="text") | .text' \
        "$TRANSCRIPT" 2>/dev/null | head -c 80)
[[ -z "$LAST" ]] && exit 0

# Greeting present if the message opens with either (leading markdown/space
# ignored; case-insensitive; no \b — BSD/macOS grep -E does not support it):
#   A) a greeting word followed by a name token: "Hi Oli ...", "Hello, Oli ..."
#   B) a name immediately followed by an em/en dash: the "{Name} —" form.
# Both forms require an actual name, matching the rule's "greet by name".
if printf '%s' "$LAST" | grep -qiE '^[[:space:]>*_]*(hi|hello|hey)[,!]?[[:space:]]+[a-z]' \
   || printf '%s' "$LAST" | grep -qiE "^[[:space:]>*_]*[a-z][a-z'.-]*[[:space:]]*[—–]"; then
  exit 0
fi

# Canary tripped — block and prompt a re-anchor.
printf '%s\n' "Salutation canary: your reply did not open by greeting the Editor by name (.claude/rules/00-working-agreement.md). A dropped greeting is an early context-drift signal — do not just add the greeting. Re-read .claude/rules/ (00-working-agreement, 01-git-workflow, 02-secrets-and-security) to re-anchor, then reply again opening with the salutation." >&2
exit 2

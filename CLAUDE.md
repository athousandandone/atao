<!-- @format -->

# CLAUDE.md

# A Thousand And One

This repository contains the source for the **A Thousand And One** website.

Read the repository before proposing changes.

## Operating Rules

Concise always-on reminders live in `.claude/rules/`:

- `.claude/rules/00-working-agreement.md`
- `.claude/rules/01-git-workflow.md`

## Identity

- Use British English.
- **A Thousand And One** is the primary identity.
- **MI** is the Roman numeral representation of one thousand and one.
- The MI device is a supporting identifier associated with A Thousand And One. It is intended for uses such as favicons, social avatars, browser tabs, footer marks and other small-format applications.
- The A Thousand And One wordmark remains the primary identity.

## Philosophy

A Thousand And One explores the idea that **everything is product**.

Software, AI, engineering, food, travel, literature, design, art and music may appear unrelated, but they share the same underlying craft: observing the world, making something, learning from the result and making it better.

Favour:

- clarity over cleverness
- substance over novelty
- typography over decoration
- longevity over trends

Every dependency must earn its place.

## Architecture

The website is intended to remain:

- statically generated
- Markdown-first
- semantic HTML
- CSS-first
- database-free
- free of browser JavaScript

Node-based tooling used during development and static generation is acceptable.

No JavaScript should be shipped to the browser unless explicitly approved.

An article is a document, not an application.

HTML provides meaning.

CSS provides presentation.

The build provides relationships.

The browser already provides navigation, scrolling, printing, searching, bookmarking and history.

## Design

The repository contains a design direction under `design/`.

Treat it as the visual source of truth.

Do not redesign or reinterpret the visual language without discussion.

The implementation should preserve the intent of the approved designs while embracing semantic HTML and maintainable CSS.

## Working Style

Before making changes:

1. Inspect the repository.
2. Read the relevant documentation.
3. State assumptions explicitly.
4. Propose the smallest coherent change.
5. Wait for approval where the direction is uncertain.

Prefer evolution over replacement.

Do not add architecture for hypothetical future needs.

## Safety

Do not:

- push
- merge
- deploy
- modify external services

without explicit instruction.

Always verify generated output rather than assuming correctness.

When in doubt, stop and ask.

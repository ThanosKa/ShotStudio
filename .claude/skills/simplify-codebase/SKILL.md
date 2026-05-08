---
name: simplify-codebase
description: Review the entire codebase (or a specified directory) for reuse, quality, and efficiency, then fix any issues found. Same checks as /simplify but scoped to the full repo or a target path instead of a git diff.
---

# Simplify Codebase: Full-Repo Code Review and Cleanup

Review files across the codebase for reuse, quality, and efficiency. Fix any issues found.

## Phase 1: Identify Scope

Determine what to review:

1. If the user supplied a path (file, directory, or glob), use that as the scope.
2. Otherwise, default to the project's primary source directory (e.g. `src/`). If the project has multiple obvious source roots, ask the user which one to target before proceeding.
3. Skip vendored, generated, and build output paths: `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/`, `.turbo/`, `out/`, lockfiles, and anything matched by `.gitignore`.

Collect the list of files in scope and pass it (with full contents or relevant excerpts) to the review agents below. Do **not** rely on `git diff` — this skill reviews committed code, not pending changes.

## Phase 2: Launch Three Review Agents in Parallel

Use the Agent tool to launch all three agents concurrently in a single message. Pass each agent the list of files in scope so it has the complete context.

### Agent 1: Code Reuse Review

For each file in scope:

1. **Search for existing utilities and helpers** that could replace duplicated code. Look for similar patterns across the codebase — common locations are utility directories, shared modules, and files adjacent to the reviewed ones.
2. **Flag any function that duplicates existing functionality.** Suggest the existing function to use instead.
3. **Flag any inline logic that could use an existing utility** — hand-rolled string manipulation, manual path handling, custom environment checks, ad-hoc type guards, and similar patterns are common candidates.
4. **Flag near-duplicate functions across files** — different names, same behavior. Pick one as canonical and remove the rest.

### Agent 2: Code Quality Review

Review the same files for hacky patterns:

1. **Redundant state**: state that duplicates existing state, cached values that could be derived, observers/effects that could be direct calls
2. **Parameter sprawl**: functions with too many parameters that should be generalized or restructured
3. **Copy-paste with slight variation**: near-duplicate code blocks that should be unified with a shared abstraction
4. **Leaky abstractions**: exposing internal details that should be encapsulated, or breaking existing abstraction boundaries
5. **Stringly-typed code**: using raw strings where constants, enums (string unions), or branded types already exist in the codebase
6. **Unnecessary JSX nesting**: wrapper Boxes/elements that add no layout value — check if inner component props (flexShrink, alignItems, etc.) already provide the needed behavior
7. **Nested conditionals**: ternary chains (`a ? x : b ? y : ...`), nested if/else, or nested switch 3+ levels deep — flatten with early returns, guard clauses, a lookup table, or an if/else-if cascade
8. **Unnecessary comments**: comments explaining WHAT the code does (well-named identifiers already do that), narrating past changes, or referencing tasks/callers — delete; keep only non-obvious WHY (hidden constraints, subtle invariants, workarounds)
9. **Dead code**: unused exports, unreachable branches, commented-out blocks, orphaned helpers with no callers

### Agent 3: Efficiency Review

Review the same files for efficiency:

1. **Unnecessary work**: redundant computations, repeated file reads, duplicate network/API calls, N+1 patterns
2. **Missed concurrency**: independent operations run sequentially when they could run in parallel
3. **Hot-path bloat**: blocking work on startup or per-request/per-render hot paths
4. **Recurring no-op updates**: state/store updates inside polling loops, intervals, or event handlers that fire unconditionally — add a change-detection guard so downstream consumers aren't notified when nothing changed. Also: if a wrapper function takes an updater/reducer callback, verify it honors same-reference returns (or whatever the "no change" signal is) — otherwise callers' early-return no-ops are silently defeated
5. **Unnecessary existence checks**: pre-checking file/resource existence before operating (TOCTOU anti-pattern) — operate directly and handle the error
6. **Memory**: unbounded data structures, missing cleanup, event listener leaks
7. **Overly broad operations**: reading entire files when only a portion is needed, loading all items when filtering for one

## Phase 3: Fix Issues

Wait for all three agents to complete. Aggregate their findings and fix each issue directly. If a finding is a false positive or not worth addressing, note it and move on — do not argue with the finding, just skip it.

Because this skill operates on committed code (not a diff), **be conservative with deletions and renames**: when a function or export is flagged as unused, double-check by searching the full repo (including tests, configs, and dynamic imports) before removing it.

When done, briefly summarize what was fixed (or confirm the code was already clean).

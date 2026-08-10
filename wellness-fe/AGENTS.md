# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code. The repository may still run SDK 54; do not upgrade dependencies unless the user requests it, but use the current versioned documentation to check changed APIs before implementation.

Before changing this repository, read `WORK_HANDOFF.md` completely. If this is a newly configured machine, also read `CODEX_COMPANY_SETUP.md`. Treat the current Git state as authoritative when a document and Git disagree.

Every screen must be production-oriented: use native React Native controls, Safe Area, accessible 44px touch targets, loading/error/empty states, validated input, API-replaceable repositories, and consistent back navigation with a safe fallback. Static mockups with inert controls are not complete.

For UI work, `REDESIGN_V3.md` is the sole visual source of truth. Preserve routes, data contracts, and working behavior, but do not preserve the existing JSX layout, cards, hero sections, chat bubbles, or component composition. A color, spacing, border, or radius adjustment is not a redesign. Do not mark a screen visually complete before real-device screenshot review.

For every UI implementation, modification, redesign, or visual review, always load and apply all three installed skills before changing code: `frontend-ui-engineering`, `gpt-taste`, and `ui-ux-pro-max`. Use them together to cover production component structure and state handling, non-generic visual quality, and a consistent design language including layout, motion, density, typography, accessibility, and design-system rules. Do not treat a text or feature-only edit as complete when it changes a screen; review the affected layout and interaction states as part of the same task.

Run `npx tsc --noEmit`, `git diff --check`, and an iOS Expo export before committing application changes. Never commit Codex credentials, `.env` secrets, `~/.codex/auth.json`, company tokens, or local machine paths containing private data.

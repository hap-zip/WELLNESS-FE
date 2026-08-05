# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Before changing this repository, read `WORK_HANDOFF.md` completely. If this is a newly configured machine, also read `CODEX_COMPANY_SETUP.md`. Treat the current Git state as authoritative when a document and Git disagree.

Every screen must be production-oriented: use native React Native controls, Safe Area, accessible 44px touch targets, loading/error/empty states, validated input, API-replaceable repositories, and consistent back navigation with a safe fallback. Static mockups with inert controls are not complete.

Run `npx tsc --noEmit`, `git diff --check`, and an iOS Expo export before committing application changes. Never commit Codex credentials, `.env` secrets, `~/.codex/auth.json`, company tokens, or local machine paths containing private data.

# Contributing to Kairos

Kairos is a training repository. Keep changes focused, issue-linked, and safe to
reset to `gym-baseline/v1`.

1. Start from an assigned issue and branch from `main` using `feature/*` or `fix/*`.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` locally.
3. Open a PR using the template and include `Closes #N` in its body.
4. Reply to review threads before resolving them; re-request review after fixes.
5. Squash-merge and delete the branch after all five required checks pass.

Never add real credentials or production data. Local state belongs in `data/`.

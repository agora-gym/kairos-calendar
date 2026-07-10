# Kairos Calendar

Kairos is the public sample application for **GitHub Gym**, a training simulation.
Its issues, pull requests, reviews, and occasional incidents may be created by
clearly labeled AI teammates. Do not use this repository for real work: training
missions can reset `main` to the `gym-baseline/v1` tag.

## Local development

```sh
pnpm install
pnpm dev
```

The app stores local events in `data/kairos.db`. It provides a month grid and a
small JSON CRUD API at `/api/events`. Supabase and Vercel deployment arrive in
GitHub Gym Phase 3; Phase 0 intentionally uses only the local SQLite database.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

The required GitHub check names are fixed: `ci/lint`, `ci/typecheck`, `ci/unit`,
`ci/e2e`, and `ci/build`.

---
paths:
  - "wrangler.jsonc"
  - "packages/worker/**"
  - "scripts/build-all.mjs"
  - "shelf/**"
---

# Deployment

- **Cloudflare Workers with static assets** (not Pages). `wrangler.jsonc` at the repo root serves
  `./dist` as assets, with a small Worker (`packages/worker/`) in front for `/api/*`; static files
  are served before it runs. The build and deploy are
  `npm ci && npm test && npm run build`, then `npx wrangler deploy`. A failing test stops the deploy,
  because the chain stops. Add `--dry-run` to check the config without publishing.
- `html_handling: "auto-trailing-slash"` means `/games/<slug>/` is the real URL; a request for
  `/games/<slug>/index.html` is redirected to it. Keep the shelf's links pointing at `index.html`
  anyway, so the same `dist/` also works when opened as plain files.
- **Commit and push freely, without asking** (my instruction, 2026-11-26). Pushing to `main` triggers
  a Workers build (`npm ci && npm test && npm run build`, then `npx wrangler deploy`), so every push
  deploys. A failing test stops it before anything is published.
- **What a build costs:** Workers Builds gives **3,000 build minutes a month free**, and serving the
  built site is free and unlimited, because static assets aren't billed. Our builds run about 4
  minutes warm and 12 minutes cold (`npm ci` dominates: `wrangler` pulls a `workerd` binary), so
  roughly 700 pushes a month fit in the allowance. Don't batch commits to save builds; it isn't worth
  the bookkeeping.
- **The only way in is `https://games.csx.tools`,** a custom domain on the `pnp-games` Worker.
  `workers_dev` and `preview_urls` are `false` in `wrangler.jsonc`: no `*.workers.dev` URL, no preview
  URLs. Keep them off — the games contain the publishers' art. Never link to the site anywhere.
- **Cloudflare Access** guards it, and the Access application's destination is the *Worker*, not a
  hostname, so every URL the Worker ever answers on is covered. One policy, `Only tuzikov@gmail.com`,
  allows that one email; login is by one-time PIN (or Cloudflare account login, same address) and a
  session lasts 1 month (`730h`). Team domain: `tuzikov.cloudflareaccess.com`.
- That policy is **reusable** (account-level), so edit it at `/accounts/<id>/access/policies/<id>`.
  The application endpoint refuses with `can not update reusable policies through this endpoint`.
- **Verified on 2026-11-26:** from a fresh browser session `https://games.csx.tools` asks for login,
  the one-time PIN to that inbox gets in, and the shelf and Recycled load with their art.

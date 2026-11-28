# @pnp/kit

Shelf features every game needs, moved here the second time a game needed them (2026-11-28,
Legend of Hexdom after Recycled):

- `save.ts` - `saveKeys(slug)`: the save, broken-save and playtest keys under `pnp:<slug>:`.
- `cloudSave.ts` - `createCloudSave({ slug, isUntouched })`: keeping a game in step across
  devices through `packages/worker`; plus `cloudEnabled`, `deviceLabel`, `ago`.
- `playtest.ts` - the `?playtest=1` flag, the journal key, safe storage helpers. Each game keeps its
  own journal format, because replaying goes through that game's `newGame` and `act`.

Source only: each game imports `@pnp/kit/<module>` and its Vite build bundles what it uses.
The look of the top bar and dialogs stays with each game; the behaviour behind them lives here.

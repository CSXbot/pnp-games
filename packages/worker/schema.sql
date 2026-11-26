-- The shelf's save store: one row per player per game.
--
-- Apply to the real database:   npx wrangler d1 execute pnp-saves --remote --file packages/worker/schema.sql
-- Apply to the local one:       npx wrangler d1 execute pnp-saves --local  --file packages/worker/schema.sql
CREATE TABLE IF NOT EXISTS saves (
  user_email TEXT NOT NULL,
  game       TEXT NOT NULL,
  state      TEXT NOT NULL,     -- JSON.stringify(GameState)
  saved_at   INTEGER NOT NULL,  -- epoch ms from the device that saved it; decides conflicts
  device     TEXT,              -- a label, so a conflict prompt can name the other device
  stored_at  INTEGER NOT NULL,  -- epoch ms as seen by the Worker
  PRIMARY KEY (user_email, game)
);

# Icons

New art, so generated rather than cut from a PDF (see the Art section of the root `CLAUDE.md`).
`source-512.png` is the master; the shipped sizes are derived from it with `sips -z <n> <n>`.

Deliberately **not** inlined: iOS reads `apple-touch-icon` from a URL when a page is added to the
Home Screen, so these are copied to the root of `dist/` by `scripts/build-all.mjs` and referenced
absolutely. Everything else on the shelf stays inside its single HTML file.

Regenerate with:

```
node scripts/gen-image.mjs --out shelf/icons/source.png --quality low --prompt \
  "Square app icon, flat poster style, no text. Rusty orange-brown scratched metal background. \
   Centred: a cream-white silhouette of a 1970s cosmonaut helmet, visor facing forward, with a \
   small recycling arrow loop reflected in the visor. Soviet space programme signage, bold shapes, \
   high contrast, no gradients, no gloss. Legible shrunk to 60 pixels."
```

Model used: `gpt-image-2.6-flare` (2026-11-26). Two rejected alternatives were a plain hexagon +
recycling arrows (crisp but anonymous) and a honeycomb with a shuttle (the shuttle turned to mush
at 60 px).

// Art tooling: the model as art director, with the originals in front of it.
//
//   art.mjs generate --prompt "..." --out f.png [--n 3] [--size 1024x1024] [--quality low]
//   art.mjs edit     --prompt "..." --image target.png [--ref ctx.png]... [--mask m.png] --out f.png
//   art.mjs review   --ask "..." --image a.png [--label "what this is"]... [--out notes.md]
//
// Add `--game <slug>` to any of them to attach that game's standing brief and decision log from
// games/<slug>/art/. The Art Director has no memory between calls: without this it re-decides
// settled questions, and has twice proposed work the Game Director had already rejected.
//
// `generate` makes art that doesn't exist in the sheets. `edit` is reference-guided: the target
// image plus whatever context helps (the whole card, a sibling card for palette or lighting), and
// optionally a mask so only part of the target may change. `review` is the loop closer - a vision
// model comparing an original, a candidate and a screenshot at play size.
//
// This is a local asset tool. Nothing here ships: the built game is still one offline file.
// Key in ~/.openai-token or $OPENAI_API_KEY. **Read .claude/rules/art.md before using this** for
// what may be generated, what may only be masked, and what must never be model-written (text).
// Running this from a shell does not load that rule on its own; it is an ordinary file, open it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VISION_MODEL = 'gpt-4.1';
// Checked against this account on 2026-11-27: plain `gpt-image-1` does not exist here, and none of
// these accept `input_fidelity`, so passing it 400s the whole chain.
const IMAGE_MODELS = ['gpt-image-2.6-flare', 'gpt-image-1.5'];

/** --flag value, repeatable flags collected into arrays. */
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    if (out[key] === undefined) out[key] = val;
    else out[key] = [].concat(out[key], val);
  }
  return out;
}
const list = (v) => (v === undefined ? [] : [].concat(v));

const args = parseArgs(process.argv.slice(2));

/** The game's standing brief plus its decision log, as one block to prepend. */
function notebook(slug) {
  if (!slug || slug === 'true') return '';
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'games', slug, 'art');
  const parts = [];
  for (const [file, heading] of [
    ['art-direction.md', 'STANDING BRIEF for this game - read before deciding anything'],
    ['decisions.md', 'DECISIONS ALREADY MADE - do not reopen these; they are the Game Director\'s'],
  ]) {
    const f = path.join(dir, file);
    if (existsSync(f)) parts.push(`===== ${heading} =====\n${readFileSync(f, 'utf8').trim()}`);
  }
  if (!parts.length) {
    console.error(`no notebook at games/${slug}/art/ - proceeding without it`);
    return '';
  }
  console.log(`notebook: ${slug} (${parts.length} file${parts.length > 1 ? 's' : ''})`);
  return parts.join('\n\n') + '\n\n===== THE TASK =====\n';
}
const brief = notebook(args.game);
const cmd = args._[0];

const keyFile = path.join(homedir(), '.openai-token');
const key = process.env.OPENAI_API_KEY ?? (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : null);
if (!key) {
  console.error('No OpenAI key: put one in ~/.openai-token or set OPENAI_API_KEY.');
  process.exit(1);
}
const auth = { authorization: `Bearer ${key}` };

function writeImages(data, out) {
  mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const files = data.data.map((img, i) => {
    const f = data.data.length === 1 ? out : out.replace(/(\.png)?$/, `-${i + 1}.png`);
    writeFileSync(f, Buffer.from(img.b64_json, 'base64'));
    return f;
  });
  if (data.usage) console.log('usage:', JSON.stringify(data.usage));
  for (const f of files) console.log(`wrote ${f} (${Math.round(readFileSync(f).length / 1024)} KB)`);
  return files;
}

const blob = (f) => new Blob([readFileSync(f)], { type: 'image/png' });

async function generate() {
  const body = {
    prompt: brief + args.prompt,
    n: Number(args.n ?? 1),
    size: args.size ?? '1024x1024',
    quality: args.quality ?? 'medium',
    background: args.background ?? 'opaque',
  };
  for (const model of args.model ? [args.model] : IMAGE_MODELS) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, model }),
    });
    const json = await res.json();
    if (res.ok) {
      console.log(`model: ${model}`);
      return writeImages(json, args.out);
    }
    console.error(`${model}: ${json.error?.message ?? res.status}`);
  }
  process.exit(1);
}

async function edit() {
  // The target comes first; references follow. The model is told in the prompt what each is for.
  const images = [args.image, ...list(args.ref)];
  for (const f of images) {
    if (!existsSync(f)) {
      console.error(`missing image: ${f}`);
      process.exit(1);
    }
  }
  for (const model of args.model ? [args.model] : IMAGE_MODELS) {
    const form = new FormData();
    form.set('model', model);
    form.set('prompt', brief + args.prompt);
    form.set('n', String(args.n ?? 1));
    if (args.size) form.set('size', args.size);
    if (args.quality) form.set('quality', args.quality);
    if (args.fidelity) form.set('input_fidelity', args.fidelity); // unsupported by current models; kept for when it isn't
    for (const f of images) form.append('image[]', blob(f), path.basename(f));
    if (args.mask) form.set('mask', blob(args.mask), path.basename(args.mask));

    const res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: auth, body: form });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.data) {
      console.log(`model: ${model} | target: ${args.image} | refs: ${list(args.ref).length}${args.mask ? ' | masked' : ''}`);
      return writeImages(json, args.out);
    }
    console.error(`${model}: HTTP ${res.status} - ${json.error?.message ?? 'no data in response'}`);
  }
  process.exit(1);
}

async function review() {
  const images = list(args.image);
  const labels = list(args.label);
  const content = [{ type: 'input_text', text: brief + args.ask }];
  images.forEach((f, i) => {
    if (labels[i]) content.push({ type: 'input_text', text: `Image ${i + 1} - ${labels[i]}:` });
    content.push({
      type: 'input_image',
      image_url: `data:image/png;base64,${readFileSync(f).toString('base64')}`,
      detail: 'high',
    });
  });
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ model: args.model ?? VISION_MODEL, input: [{ role: 'user', content }] }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(json.error?.message ?? res.status);
    process.exit(1);
  }
  const text =
    json.output_text ??
    (json.output ?? [])
      .flatMap((o) => o.content ?? [])
      .map((c) => c.text)
      .filter(Boolean)
      .join('\n');
  if (args.out) {
    mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
    writeFileSync(args.out, text + '\n');
    console.log(`wrote ${args.out}`);
  }
  console.log(text);
}

const commands = { generate, edit, review };
if (!commands[cmd]) {
  console.error('Usage: art.mjs generate|edit|review  (see the comment at the top of this file)');
  process.exit(1);
}
await commands[cmd]();

// Generate new art that doesn't exist in the PDFs, without a human carrying prompts between tools.
//
//   node scripts/gen-image.mjs --prompt "..." --out path.png [--n 3] [--size 1024x1024]
//                              [--quality low|medium|high] [--model gpt-image-2.6-flare]
//
// Needs an OpenAI key in ~/.openai-token (or $OPENAI_API_KEY). Only for art that carries no
// geometry: boards and Depot sheets are cut from the PDFs in code, never generated. See the Art
// section of CLAUDE.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split(/\s--/)
    .filter(Boolean)
    .map((s) => s.replace(/^--/, ''))
    .map((s) => {
      const i = s.indexOf(' ');
      return i === -1 ? [s, 'true'] : [s.slice(0, i), s.slice(i + 1).replace(/^["']|["']$/g, '')];
    }),
);

const keyFile = path.join(homedir(), '.openai-token');
const key = process.env.OPENAI_API_KEY ?? (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : null);
if (!key) {
  console.error('No OpenAI key. Put one in ~/.openai-token or set OPENAI_API_KEY.');
  process.exit(1);
}
if (!args.prompt || !args.out) {
  console.error('Need --prompt and --out.');
  process.exit(1);
}

const models = args.model ? [args.model] : ['gpt-image-2.6-flare', 'gpt-image-1.5', 'gpt-image-1'];
const n = Number(args.n ?? 1);
const body = {
  prompt: args.prompt,
  n,
  size: args.size ?? '1024x1024',
  quality: args.quality ?? 'medium',
  background: args.background ?? 'opaque',
};

let data = null;
let used = null;
for (const model of models) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, model }),
  });
  const json = await res.json();
  if (res.ok) {
    data = json;
    used = model;
    break;
  }
  console.error(`${model}: ${json.error?.message ?? res.status}`);
}
if (!data) process.exit(1);

mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
const written = [];
data.data.forEach((img, i) => {
  const out = n === 1 ? args.out : args.out.replace(/(\.png)?$/, `-${i + 1}.png`);
  writeFileSync(out, Buffer.from(img.b64_json, 'base64'));
  written.push(out);
});
console.log(`model: ${used}`);
if (data.usage) console.log('usage:', JSON.stringify(data.usage));
for (const f of written) console.log(`wrote ${f} (${Math.round(Buffer.byteLength(readFileSync(f)) / 1024)} KB)`);

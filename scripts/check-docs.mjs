// The always-loaded rules have a budget, and this is what enforces it.
//
// Root CLAUDE.md loads into every session in this repo, so its size is a tax on all of them. It was
// 449 lines on 2026-11-27 before being split into .claude/rules and .claude/skills; the limit that
// replaced it was a sentence in the file, and a sentence is not a budget. The consultant's point,
// the same day: the file-size budget was made mechanical and proven to fail, and this one deserves
// the same. Moving the limit is fine - it is one line here - but it cannot now happen quietly.
//
// Words, not lines: the cost is tokens, and one table row can be two hundred characters.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Always-loaded files, and what each may spend. Raise a number deliberately, in a commit of its own. */
const BUDGETS = [{ file: 'CLAUDE.md', maxWords: 2100 }];

const over = [];
for (const { file, maxWords } of BUDGETS) {
  const words = readFileSync(path.join(root, file), 'utf8').split(/\s+/).filter(Boolean).length;
  const verdict = words > maxWords ? 'OVER' : 'ok';
  console.log(`  ${file}  ${words} words / ${maxWords}  ${verdict}`);
  if (words > maxWords) {
    over.push(`${file} is ${words} words, over its ${maxWords}-word budget by ${words - maxWords}`);
  }
}

if (over.length) {
  console.error(`\n${over.join('\n')}\n\nMove the detail into .claude/rules or .claude/skills, or raise the number in scripts/check-docs.mjs on purpose.`);
  process.exit(1);
}

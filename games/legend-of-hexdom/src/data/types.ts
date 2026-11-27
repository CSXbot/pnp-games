// Shared vocabulary for the game's data, and the small notation the tables are written in.
//
// A table cell is written the way the sheet prints it, left to right, top to bottom:
//   F+3   gain 3 food              F-2   pay 2 food (slashed food icons)
//   H+1   gain a heart             H-1   lose a heart (a slashed heart)
//   A+1   an attribute point of the player's choice (the purple "+" square; A+2 for two)
//   STR+2 / AGI+1 / MAG+1          that many points of that attribute (sword / bow / staff)
//   GEM   a gem (outlined)         T:hook   a Treasure (spear, hook, crow, hammer, skull, book)
// An enemy's requirement is written STR10 (single box), AGI9&MAG2 (two solid boxes joined: linked,
// meet both) or AGI3/MAG4 (two dashed boxes: unlinked, the player chooses one). Rulebook p16, p52-53.

export type Attr = 'str' | 'agi' | 'mag';
export const ATTRS: Attr[] = ['str', 'agi', 'mag'];
export const ATTR_NAME: Record<Attr, string> = { str: 'Strength', agi: 'Agility', mag: 'Magic' };

export type TreasureId = 'spear' | 'hook' | 'crow' | 'hammer' | 'skull' | 'book';
export const TREASURES: TreasureId[] = ['spear', 'hook', 'crow', 'hammer', 'skull', 'book'];
/** Names from the rulebook's lore where it gives one (p56, p60, p62, p64, p111-112). The crow is unnamed. */
export const TREASURE_NAME: Record<TreasureId, string> = {
  spear: 'Serpent Spear',
  hook: 'Little Scythe',
  crow: 'Crow',
  hammer: 'Silver Hammer',
  skull: 'Lost Skull',
  book: 'Book of Shadows',
};

export type Effect =
  | { k: 'food'; n: number }
  | { k: 'heart'; n: number }
  | { k: 'point'; n: number }
  | { k: 'attr'; a: Attr; n: number }
  | { k: 'gem' }
  | { k: 'treasure'; t: TreasureId };

export type ReqType = 'single' | 'linked' | 'unlinked';
export interface Requirement {
  type: ReqType;
  reqs: { a: Attr; v: number }[];
}

/** Table columns, in the sheet's order. */
export const COLUMNS = ['grove', 'forest', 'plains', 'swamp', 'valley', 'village', 'castle'] as const;
export type Column = (typeof COLUMNS)[number];

/** Table rows: die faces 1-2, 3-4, 5-6. */
export const rowOfDie = (die: number): 0 | 1 | 2 => (die <= 2 ? 0 : die <= 4 ? 1 : 2);

const ATTR_TOKEN: Record<string, Attr> = { STR: 'str', AGI: 'agi', MAG: 'mag' };

/** Parses a cell such as "F-1 H+1" or "A+1 T:skull". Throws on anything it doesn't know. */
export function parseEffects(cell: string): Effect[] {
  return cell
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok): Effect => {
      let m: RegExpMatchArray | null;
      if (tok === 'GEM') return { k: 'gem' };
      if ((m = tok.match(/^T:(spear|hook|crow|hammer|skull|book)$/))) return { k: 'treasure', t: m[1] as TreasureId };
      if ((m = tok.match(/^([FHA])([+-]\d)$/))) {
        const n = Number(m[2]);
        if (m[1] === 'A' && n < 0) throw new Error(`bad token ${tok}`);
        return { k: m[1] === 'F' ? 'food' : m[1] === 'H' ? 'heart' : 'point', n };
      }
      if ((m = tok.match(/^(STR|AGI|MAG)\+(\d)$/))) return { k: 'attr', a: ATTR_TOKEN[m[1]], n: Number(m[2]) };
      throw new Error(`bad token ${tok} in "${cell}"`);
    });
}

/** Parses "STR10", "AGI9&MAG2" (linked) or "AGI3/MAG4" (unlinked). */
export function parseRequirement(text: string): Requirement {
  const one = (s: string) => {
    const m = s.match(/^(STR|AGI|MAG)(\d+)$/);
    if (!m) throw new Error(`bad requirement ${text}`);
    return { a: ATTR_TOKEN[m[1]], v: Number(m[2]) };
  };
  if (text.includes('&')) return { type: 'linked', reqs: text.split('&').map(one) };
  if (text.includes('/')) return { type: 'unlinked', reqs: text.split('/').map(one) };
  return { type: 'single', reqs: [one(text)] };
}

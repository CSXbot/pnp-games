// The three characters in scope, from their A5 cards (A5-CharacterSheet-<Name>.pdf). `text` is
// what the card says, icons put into words and nothing else; how each is read is in RULES-NOTES.md.

import type { Attr } from './types';

export type CharacterId = 'warrior' | 'archer' | 'mage';
export type SkillId =
  | 'adrenaline'
  | 'overcoming'
  | 'magicBlood'
  | 'focus'
  | 'crossTraining'
  | 'magicBerry'
  | 'enchant'
  | 'manaShield'
  | 'greed';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  /** Starting attributes, printed filled on the card. */
  start: Record<Attr, number>;
  /** The starting skill, then the skills unlocked at food 20 and food 40. */
  skills: [SkillId, SkillId, SkillId];
}

export const SKILL_TEXT: Record<SkillId, { name: string; text: string }> = {
  adrenaline: { name: 'Adrenaline', text: 'When travelling, if you have 2 hearts or less: Strength +1' },
  overcoming: { name: 'Overcoming', text: 'When you lose a heart, gain a food (once a round)' },
  magicBlood: { name: 'Magic Blood', text: 'After travelling, you may lose a heart to gain Magic +1' },
  focus: { name: 'Focus', text: 'After you Adventure twice in a round, gain Agility +1' },
  crossTraining: { name: 'Cross Training', text: 'Before travelling, you may pay 2 food: Strength +1' },
  magicBerry: { name: 'Magic Berry', text: 'Every time you improve your Magic, gain a food' },
  enchant: { name: 'Enchant', text: 'When in combat, you can lose a heart to use Magic instead of Strength' },
  manaShield: { name: 'Mana Shield', text: 'You can pay a food to resist losing a heart, once a round' },
  greed: { name: 'Greed', text: 'Every time you get a gem, gain an attribute point' },
};

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  warrior: { id: 'warrior', name: 'Warrior', start: { str: 2, agi: 0, mag: 0 }, skills: ['adrenaline', 'overcoming', 'magicBlood'] },
  archer: { id: 'archer', name: 'Archer', start: { str: 0, agi: 2, mag: 0 }, skills: ['focus', 'crossTraining', 'magicBerry'] },
  mage: { id: 'mage', name: 'Mage', start: { str: 0, agi: 0, mag: 2 }, skills: ['enchant', 'manaShield', 'greed'] },
};

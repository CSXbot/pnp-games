// The character card and the boxes the player marks: hearts, food, attributes, Treasures, Relic box.
// Marks follow the paper (art/art-direction.md): a gained heart, food or level is painted; food spent
// is slashed; a heart lost is crossed.

import { CHARACTERS, SKILL_TEXT, type SkillId } from '../data/characters';
import { ATTR_MAX, FOOD_BOX, FOOD_POINT_AT, FOOD_SKILL_AT, HEART_BOX } from '../data/rules';
import { ATTR_NAME, ATTRS, TREASURES, TREASURE_NAME } from '../data/types';
import { sheetOf, skillsUnlocked, type GameState } from '../engine/game';
import { PORTRAIT, RELIC_ART, TREASURE_ART } from './art';
import { AttrIcon, FoodIcon, HeartIcon } from './Icons';

/** How each skill is used on this screen - the part the card can't say. */
export const SKILL_HOW: Record<SkillId, string> = {
  adrenaline: 'automatic, when you travel',
  overcoming: 'automatic, the first heart you lose each round',
  magicBlood: 'button in the turn panel, right after you travel',
  focus: 'automatic, on your second Adventure of a round',
  crossTraining: 'button in the turn panel, before you travel',
  magicBerry: 'automatic, whenever your Magic goes up',
  enchant: 'switch in the turn panel, before an Adventure or a Boss',
  manaShield: 'switch in the turn panel, for the next action',
  greed: 'automatic, for every gem',
};

export function Sheet({ s }: { s: GameState }) {
  const ch = CHARACTERS[s.character];
  const unlocked = skillsUnlocked(s);
  const sheet = sheetOf(s);
  return (
    <section className="sheet panel" aria-label="Character sheet">
      <div className="card-head">
        <img src={PORTRAIT[s.character]} alt="" className="portrait" />
        <div>
          <h2>the {ch.name}</h2>
          <ul className="skills">
            {ch.skills.map((k, i) => (
              <li key={k} className={i < unlocked ? 'on' : 'off'} title={SKILL_TEXT[k].text}>
                {i > 0 && <span className={`unlock-diamond d${i}`} aria-hidden="true" />}
                <b>{SKILL_TEXT[k].name}</b>
                {i < unlocked ? (
                  <>
                    : {SKILL_TEXT[k].text} <span className="how">({SKILL_HOW[k]})</span>
                  </>
                ) : (
                  <span className="how"> - locked until food {FOOD_SKILL_AT[i - 1]} (the red diamond)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tracks">
        <Box title="HP" note={`${s.heartsPainted - s.heartsLost} left`}>
          <div className="grid hearts">
            {Array.from({ length: HEART_BOX }, (_, i) => (
              <HeartIcon key={i} state={i < s.heartsLost ? 'crossed' : i < s.heartsPainted ? 'painted' : 'empty'} />
            ))}
          </div>
        </Box>
        <Box title="Food" note={`${s.foodPainted - s.foodSpent} to eat`}>
          <div className="grid food">
            {Array.from({ length: FOOD_BOX }, (_, i) => (
              <FoodIcon
                key={i}
                state={i < s.foodSpent ? 'slashed' : i < s.foodPainted ? 'painted' : 'empty'}
                mark={FOOD_POINT_AT.includes(i + 1) ? 'plus' : FOOD_SKILL_AT.includes(i + 1) ? 'skill' : undefined}
              />
            ))}
          </div>
        </Box>
      </div>

      <Box title="Attributes">
        <div className="attrs">
          {ATTRS.map((a) => (
            <div key={a} className="attr-row" aria-label={`${ATTR_NAME[a]} ${s.attrs[a]}`}>
              <AttrIcon a={a} size={20} />
              {Array.from({ length: ATTR_MAX }, (_, i) => (
                <span key={i} className={`ring${i < s.attrs[a] ? ' painted' : ''}${i === ATTR_MAX - 1 ? ' max' : ''}`} />
              ))}
              <b className="num">{s.attrs[a]}</b>
            </div>
          ))}
        </div>
      </Box>

      <div className="boxes">
        <Box title="Treasure">
          <div className="treasures">
            {TREASURES.map((t) => (
              <span key={t} className={s.treasures.includes(t) ? 'owned' : ''} title={TREASURE_NAME[t]}>
                <span className={`ring${s.treasures.includes(t) ? ' painted' : ''}`} />
                <img src={TREASURE_ART[t]} alt={TREASURE_NAME[t]} className="t-icon" />
              </span>
            ))}
          </div>
        </Box>
        <Box title="Relic" note={`${s.relic}/${sheet.relic.size}`}>
          <img src={RELIC_ART[sheet.id]} alt={`Relic box (${sheet.relic.size} gems) and Trade`} className="relic-art" />
        </Box>
      </div>
    </section>
  );
}

function Box({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="box">
      <div className="box-title">
        {title}
        {note && <span className="box-note">{note}</span>}
      </div>
      {children}
    </div>
  );
}

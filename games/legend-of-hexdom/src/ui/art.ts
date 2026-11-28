// The provisional art (tools/extract_art.mjs), imported so the single-file build inlines it.
import geometry from '../assets/art.json';
import bosses from '../assets/bosses.jpg';
import giftsA from '../assets/gifts-A.jpg';
import giftsB from '../assets/gifts-B.jpg';
import giftsC from '../assets/gifts-C.jpg';
import map1 from '../assets/map-1.jpg';
import map2 from '../assets/map-2.jpg';
import map3 from '../assets/map-3.jpg';
import pArcher from '../assets/portrait-archer.png';
import pMage from '../assets/portrait-mage.png';
import pWarrior from '../assets/portrait-warrior.png';
import relicA from '../assets/relic-A.jpg';
import relicB from '../assets/relic-B.jpg';
import relicC from '../assets/relic-C.jpg';
import tablesA from '../assets/tables-A.jpg';
import tablesB from '../assets/tables-B.jpg';
import tablesC from '../assets/tables-C.jpg';
import tBook from '../assets/treasure-book.png';
import tCrow from '../assets/treasure-crow.png';
import tHammer from '../assets/treasure-hammer.png';
import tHook from '../assets/treasure-hook.png';
import tSkull from '../assets/treasure-skull.png';
import tSpear from '../assets/treasure-spear.png';
import scoreLine from '../assets/score-line.png';
import travel from '../assets/travel.jpg';

export const GEO = geometry;
export const MAP_ART: Record<number, string> = { 1: map1, 2: map2, 3: map3 };
export const TABLE_ART: Record<string, string> = { A: tablesA, B: tablesB, C: tablesC };
export const GIFT_ART: Record<string, string> = { A: giftsA, B: giftsB, C: giftsC };
export const RELIC_ART: Record<string, string> = { A: relicA, B: relicB, C: relicC };
export const BOSS_ART = bosses;
export const PORTRAIT: Record<string, string> = { warrior: pWarrior, archer: pArcher, mage: pMage };
/** The six Treasures as the sheet prints them (cut from its Treasure box). */
export const TREASURE_ART: Record<string, string> = { spear: tSpear, hook: tHook, crow: tCrow, hammer: tHammer, skull: tSkull, book: tBook };
export const TRAVEL_ART = travel;
export const SCORE_ART = scoreLine;

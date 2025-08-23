// Import types and functions from core
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { calculateXPBonus, getMaxXp } from '@drpg/core/utils/DinozUtils';
import { ASSAULT_POWER } from '@drpg/core/utils/fightConstants';
import { generateMonsterList } from 'ed-be/business/fightService';
import { DetailedFight } from 'ed-be/utils/fight/generateFight';
import { getRandomNumber } from 'ed-be/utils/tools';

export type SimplifiedMission = {
  id: number,
  dinozId: number | null,
  missionId: number,
  step: number,
  isFinished: boolean | null,
  progress: number | null
}

export type SimplifiedDinoz = {
  id: number,
  playerId: string,
  placeId: number,
  level: number,
  experience: number,
  skills: {
    skillId: number,
  }[],
  status: {
    statusId: number
  }[]
  missions: SimplifiedMission[]
}


export type SimplifiedPlayer = {
  teacher: boolean
}

export type SimplifiedFightResult = {
  monsters: string[]
  xp: number,
  gold: number
}

export class StatisticsService {

  calculateXpAndGold(player: SimplifiedPlayer, team: SimplifiedDinoz[], monsters: MonsterFiche[]) {
    const MAX_LEVEL = 50;
    const INITIAL_MAX_LEVEL = 50;
    const XP_NEWB_BONUS = [15, 10, 6.6, 4.3, 2.5];

    // let teamLevel = 0;
    // teamLevel += dinozData.level;

    const goldFactor = 1.0;
    const xpFactor = 1.0;
    let totalWinXP = 0;

    const teamLevel = team.reduce((acc, dinoz) => acc + dinoz.level, 0);

    let fgold = 0;
    let levelup = false;

    for (const d of team) {
      //TODO escape
      /*//if escaped, no XP !
      if( Lambda.has( escaped, r.f) )
        continue;*/

      let xp = 0;
      const cur = d.level / teamLevel;

      /** Restrict the use of low level dinoz in order to make easy money **/
      let gfact = 1.0;
      if (d.experience >= getMaxXp(d) && d.level <= 5) gfact = 0.1;

      for (const f of monsters) {
        const factor = f.level >= d.level ? 1 : 4 / (4 + (d.level - f.level));
        let monsterXp = (f.xp ?? 10) * factor * cur;
        fgold += (f.gold ?? 1.0) * factor * cur * gfact;
        // newbie bonus
        if (d.level <= 5) monsterXp += XP_NEWB_BONUS[d.level - 1] * cur;
        // bonus for fighters of same level of the monster
        if (Math.abs(f.level - d.level) <= 5 && f.xpBonus) monsterXp += f.xpBonus;
        xp += monsterXp;
      }

      // Previous xp coef computation
      const lvlDiff = MAX_LEVEL - d.level;
      let xpf = 1.2 + 0.8 * (lvlDiff / MAX_LEVEL);
      if (xpf < 1.0) xpf = 1.0;

      // New one, applied if better
      if (MAX_LEVEL / INITIAL_MAX_LEVEL > xpf)
        xpf = MAX_LEVEL / INITIAL_MAX_LEVEL;

      xp = calculateXPBonus(d, Math.round(xp * xpFactor * xpf), player);
      const max = getMaxXp(d);
      if (d.experience >= max) {
        // No xp is the dinoz was already at max
        levelup = true;
        xp = 0;
      } else if (d.experience + xp >= max) {
        // Else, allow xp overflow (should happen only) and raise levelup flag
        levelup = true;
      }
      totalWinXP += xp;
    }

    const fprob = getRandomNumber(0, 100);
    let goldMultiplier = 1;
    if (fprob < 1) goldMultiplier = 10;
    else if (fprob < 11) goldMultiplier = 3;

    let totalGold = (getRandomNumber(0, 10) + 28) * 10;

    totalGold += Math.round(totalGold * goldMultiplier * fgold * goldFactor);

    if (monsters.length === 0) {
      totalGold = 0;
    }

    return {
      xp: totalWinXP,
      gold: totalGold
    }
  }

  calculateMonstersStatistics(team: SimplifiedDinoz[], place: number): SimplifiedFightResult {
    let monsters: MonsterFiche[] = generateMonsterList(team, place);
    let player: SimplifiedPlayer = { teacher: false};

    let result = this.calculateXpAndGold(player, team, monsters);
    return {
      xp: result.xp,
      gold: result.gold,
      monsters: monsters.map(m => m.name),
    };
  }
}

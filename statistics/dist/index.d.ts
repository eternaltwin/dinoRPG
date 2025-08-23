import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
export type SimplifiedMission = {
    id: number;
    dinozId: number | null;
    missionId: number;
    step: number;
    isFinished: boolean | null;
    progress: number | null;
};
export type SimplifiedDinoz = {
    id: number;
    playerId: string;
    placeId: number;
    level: number;
    experience: number;
    skills: {
        skillId: number;
    }[];
    status: {
        statusId: number;
    }[];
    missions: SimplifiedMission[];
};
export type SimplifiedPlayer = {
    teacher: boolean;
};
export type SimplifiedFightResult = {
    monsters: string[];
    xp: number;
    gold: number;
};
export declare class StatisticsService {
    calculateXpAndGold(player: SimplifiedPlayer, team: SimplifiedDinoz[], monsters: MonsterFiche[]): {
        xp: number;
        gold: number;
    };
    calculateMonstersStatistics(team: SimplifiedDinoz[], place: number): SimplifiedFightResult;
}

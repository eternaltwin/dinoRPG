import { PlaceEnum } from "../enums/PlaceEnum.mjs";
import { monsterList } from "../fight/MonsterList.mjs";
import { SpecialActions } from "./specialActions.mjs";

export const specialActionsList: Readonly<Record<string, SpecialActions>> = {
    // COMBATS MADAME X 
    TRAP: {
        name: 'trap',
        place: PlaceEnum.FORCEBRUT,
        condition: {},
        allies: [],
        opponents: [monsterList.GLUON],
        reward: [],
        startText: {
            type: 'announce',
            text: 'fight_trap'
        },
        endText: {
            type: 'announce',
            text: 'end_trap'
        }
    },
    ATTACK: {
        name: 'attack',
        place: PlaceEnum.DINOVILLE,
        condition: {},
        allies: [],
        opponents: [monsterList.MERCH1],
        reward: [],
        // Monstre qui doit parler => fight_attack
        endText: {
            type: 'announce',
            text: 'end_attack'
        }
    },
    ATTACK_2: {
        name: 'attack_2',
        place: PlaceEnum.DINOVILLE,
        condition: {},
        allies: [],
        opponents: [monsterList.MERCH1],
        reward: [],
        // Monstre qui doit parler => fight_attack_2
        endText: {
            type: 'announce',
            text: 'end_attack_2'
        }
    },
    INVESTIGATION : {
        name: 'investigation',
        place: PlaceEnum.DINOVILLE,
        condition: {},
        allies: [],
        opponents: [monsterList.MERCH2, monsterList.MERCH2, monsterList.MERCH2],
        reward: [],
        startText: {
            type: 'announce',
            text: 'fight_investigation'
        },
        endText: {
            type: 'announce',
            text: 'end_investigation'
        }
    },
    NEUTRALIZE_THEM : {
        name: 'neutralize_them',
        place: PlaceEnum.DINOVILLE,
        condition: {},
        // Monstres à ajouter à la team Dinoz
        allies: [monsterList.GANG1, monsterList.GANG2, monsterList.GANG3],
        opponents: [monsterList.BORG],
        reward: [],
        // Monstre allié gang2 qui doit parler => fight_neutralize_them
        endText: {
            type: 'announce',
            text: 'end_neutralize_them'
        }
    },
    RUSH_HIM : {
        name: 'rush_him',
        place: PlaceEnum.FOSSELAVE,
        condition: {},
        allies: [],
        opponents: [monsterList.SUSPC1],
        reward: []
    },
    RUSH_THEM : {
        name: 'rush_them',
        place: PlaceEnum.FOSSELAVE,
        condition: {},
        allies: [],
        opponents: [monsterList.SUSPC, monsterList.SUSPC, monsterList.SUSPC],
        reward: [],
        endText: {
            type: 'announce',
            text: 'end_rush_them'
        }
    }
}
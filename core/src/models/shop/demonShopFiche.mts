import { Skill } from "../dinoz/SkillList.mjs";

export interface demonShopFiche {
    sacrificed: sacrificedDinozFiche[],
    shop: demonDinozFiche[]
}

export interface sacrificedDinozFiche {
    id: number,
    level: number,
    display: string,
    fire: number,
    wood: number,
    water: number,
    lightning: number,
    air: number,
    skills: Skill[]
    // unlocked skills?
}

export interface demonDinozFiche {
    id: number,
    level: number,
    display: string,
    fire: number,
    wood: number,
    water: number,
    lightning: number,
    air: number,
    skills: Skill[]
}

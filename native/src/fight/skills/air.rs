/// Implementations of all air skills from Vanilla and Ether skill trees
use rand::Rng;

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- AIR Skills ---
// --- AIR VANILLA Skills ---

// --- AIR VANILLA Passive Skills ---
pub static AGILITE: Skill = Skill {
    id: SkillId::AGILITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 5;
    },
    ignore: false,
};

pub static ESQUIVE: Skill = Skill {
    id: SkillId::ESQUIVE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
    },
    ignore: false,
};

pub static SAUT: Skill = Skill {
    id: SkillId::SAUT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.can_touch_flying = true;
    },
    ignore: false,
};

pub static TAICHI: Skill = Skill {
    id: SkillId::TAICHI,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 15;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.2;
    },
    ignore: false,
};

pub static ELASTICITE: Skill = Skill {
    id: SkillId::ELASTICITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 10;
        f.defense[ElementIndex::Air as usize] += 3.0;
    },
    ignore: false,
};

pub static FURTIVITE: Skill = Skill {
    id: SkillId::FURTIVITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 2.0;
        f.defense[ElementIndex::Water as usize] += 2.0;
        f.defense[ElementIndex::Lightning as usize] += 2.0;
    },
    ignore: false,
};

pub static TALON_DACHILLE: Skill = Skill {
    id: SkillId::TALON_DACHILLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.all_assaults_bonus += 2;
    },
    ignore: false,
};

pub static EVEIL: Skill = Skill {
    id: SkillId::EVEIL,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.speed_per_element[ElementIndex::Air as usize] *= 1.2;
    },
    ignore: false,
};

pub static MEDITATION_SOLITAIRE: Skill = Skill {
    id: SkillId::MEDITATION_SOLITAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 3.0;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.5;
    },
    ignore: false,
};

pub static MEDITATION_TRANCHANTE: Skill = Skill {
    id: SkillId::MEDITATION_TRANCHANTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 6.0;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.5;
    },
    ignore: false,
};

// --- AIR VANILLA Active Skills ---
// pub static MISTRAL => MISTRAL,
// pub static ENVOL =>  ENVOL,
// pub static TORNADE => TORNADE,
// pub static DISQUE_VACUUM => DISQUE_VACUUM,
// pub static ATTAQUE_PLONGEANTE => ATTAQUE_PLONGEANTE,
// pub static NUAGE_TOXIQUE => NUAGE_TOXIQUE,
// pub static PAUME_EJECTABLE => PAUME_EJECTABLE,
// pub static TROU_NOIR => TROU_NOIR,

// --- AIR VANILLA Event Skills ---
// pub static VENT_VIF => VENT_VIF,

// --- AIR VANILLA Special Skills ---
// pub static STRATEGIE => STRATEGIE,
// pub static ANALYSE => ANALYSE,
// pub static SPECIALISTE => SPECIALISTE,
// pub static FORME_VAPOREUSE => FORME_VAPOREUSE,
// pub static MAITRE_LEVITATEUR => MAITRE_LEVITATEUR,
// pub static HALEINE_FETIVE => HALEINE_FETIVE,
// pub static SOUFFLE_DE_VIE => SOUFFLE_DE_VIE,
// pub static FORME_ETHERALE => FORME_ETHERALE,

// --- AIR VANILLA COLLECT Skills ---
// pub static CUEILLETTE => CUEILLETTE,
// pub static OEIL_DE_LYNX => OEIL_DE_LYNX,

// --- AIR VANILLA UNIVERSAL Skills ---
// pub static PROFESSEUR => PROFESSEUR,

// --- AIR ETHER Skills ---
// --- AIR ETHER Passive Skills ---
pub static MAITRISE_CORPORELLE: Skill = Skill {
    id: SkillId::MAITRISE_CORPORELLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.recovery_multiplier *= 1.25;
    },
    ignore: false,
};

pub static BLANC: Skill = Skill {
    id: SkillId::BLANC,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
    },
    ignore: false,
};

pub static ANAEROBIE: Skill = Skill {
    id: SkillId::ANAEROBIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 0.75) as u32;
    },
    ignore: false,
};

pub static DOUBLE_FACE: Skill = Skill {
    id: SkillId::DOUBLE_FACE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        let random: f32 = m.random_generator.gen_range(0.0..=1.0);
        if random <= 0.50 {
            f.time -= (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        } else {
            f.time += (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        }
    },
    ignore: false,
};

pub static FLAGELLATION: Skill = Skill {
    id: SkillId::FLAGELLATION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 0.85) as u32;
    },
    ignore: false,
};

pub static SOUFFLE_DANGE: Skill = Skill {
    id: SkillId::SOUFFLE_DANGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 20.0;
    },
    ignore: false,
};

pub static OURAGAN: Skill = Skill {
    id: SkillId::OURAGAN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 20;
    },
    ignore: false,
};

pub static TWINOID_500MG: Skill = Skill {
    id: SkillId::TWINOID_500MG,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.5) as u32;
    },
    ignore: false,
};

// pub static LONDUHAUT => LONDUHAUT, useless

// --- AIR ETHER Active Skills ---
// pub static OURANOS => OURANOS,
// pub static RECEPTABLE_THERMIQUE => RECEPTABLE_THERMIQUE,
// pub static SYLPHIDES => SYLPHIDES,

// --- AIR ETHER Event Skills ---
// pub static QI_GONG => QI_GONG,
// pub static MUTINERIE => MUTINERIE,
// pub static MAINS_COLLANTES => MAINS_COLLANTES,

// --- AIR ETHER Special Skills ---
// pub static SURPLIS_DHADES => SURPLIS_DHADES,

// --- AIR ETHER Universal Skills ---
// pub static MESSIE => MESSIE,

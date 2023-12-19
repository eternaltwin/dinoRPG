/// Implementations of all air skills from Vanilla and Ether skill trees
use rand::Rng;

use crate::fight::manager::{AttackResult, Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- AIR Skills ---
// --- AIR VANILLA Skills ---

// --- AIR VANILLA Passive Skills ---
pub static AGILITE: Skill = Skill {
    id: SkillId::AGILITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 5;
        vec![AttackResult::PassiveSkill(SkillId::AGILITE)]
    },
    ignore: false,
};

pub static ESQUIVE: Skill = Skill {
    id: SkillId::ESQUIVE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
        vec![AttackResult::PassiveSkill(SkillId::ESQUIVE)]
    },
    ignore: false,
};

pub static SAUT: Skill = Skill {
    id: SkillId::SAUT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.can_touch_flying = true;
        vec![AttackResult::PassiveSkill(SkillId::SAUT)]
    },
    ignore: false,
};

pub static TAICHI: Skill = Skill {
    id: SkillId::TAICHI,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 15;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.2;
        vec![AttackResult::PassiveSkill(SkillId::TAICHI)]
    },
    ignore: false,
};

pub static ELASTICITE: Skill = Skill {
    id: SkillId::ELASTICITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 10;
        f.defense[ElementIndex::Air as usize] += 3.0;
        vec![AttackResult::PassiveSkill(SkillId::ELASTICITE)]
    },
    ignore: false,
};

pub static FURTIVITE: Skill = Skill {
    id: SkillId::FURTIVITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 2.0;
        f.defense[ElementIndex::Water as usize] += 2.0;
        f.defense[ElementIndex::Lightning as usize] += 2.0;
        vec![AttackResult::PassiveSkill(SkillId::FURTIVITE)]
    },
    ignore: false,
};

pub static TALON_DACHILLE: Skill = Skill {
    id: SkillId::TALON_DACHILLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.all_assaults_bonus += 2;
        vec![AttackResult::PassiveSkill(SkillId::TALON_DACHILLE)]
    },
    ignore: false,
};

pub static EVEIL: Skill = Skill {
    id: SkillId::EVEIL,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.speed_per_element[ElementIndex::Air as usize] *= 1.2;
        vec![AttackResult::PassiveSkill(SkillId::EVEIL)]
    },
    ignore: false,
};

pub static MEDITATION_SOLITAIRE: Skill = Skill {
    id: SkillId::MEDITATION_SOLITAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 3.0;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.5;
        vec![AttackResult::PassiveSkill(SkillId::MEDITATION_SOLITAIRE)]
    },
    ignore: false,
};

pub static MEDITATION_TRANCHANTE: Skill = Skill {
    id: SkillId::MEDITATION_TRANCHANTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 6.0;
        f.speed_per_element[ElementIndex::Air as usize] *= 1.5;
        vec![AttackResult::PassiveSkill(SkillId::MEDITATION_TRANCHANTE)]
    },
    ignore: false,
};

// --- AIR VANILLA Active Skills ---
pub static MISTRAL: Skill = Skill {
    id: SkillId::MISTRAL,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::MISTRAL)]
    },
    ignore: false,
};

pub static ENVOL: Skill = Skill {
    id: SkillId::ENVOL,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::ENVOL)]
    },
    ignore: false,
};

pub static TORNADE: Skill = Skill {
    id: SkillId::TORNADE,
    skill_type: SkillType::ACTIVE,
    energy: 30,
    priority: 5,
    probability: 3,
    effect: |f: &mut Fighter, m: &mut Manager| {
        m.attack_team(f, f.compute_attack(ElementIndex::Air, 5))
    },
    ignore: false,
};

pub static DISQUE_VACUUM: Skill = Skill {
    id: SkillId::DISQUE_VACUUM,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::DISQUE_VACUUM)]
    },
    ignore: false,
};

pub static ATTAQUE_PLONGEANTE: Skill = Skill {
    id: SkillId::ATTAQUE_PLONGEANTE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::ATTAQUE_PLONGEANTE)]
    },
    ignore: false,
};

pub static NUAGE_TOXIQUE: Skill = Skill {
    id: SkillId::NUAGE_TOXIQUE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::NUAGE_TOXIQUE)]
    },
    ignore: false,
};

pub static PAUME_EJECTABLE: Skill = Skill {
    id: SkillId::PAUME_EJECTABLE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::PAUME_EJECTABLE)]
    },
    ignore: false,
};

pub static TROU_NOIR: Skill = Skill {
    id: SkillId::TROU_NOIR,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::TROU_NOIR)]
    },
    ignore: false,
};

// --- AIR VANILLA Event Skills ---
pub static VENT_VIF: Skill = Skill {
    id: SkillId::VENT_VIF,
    skill_type: SkillType::EVENT,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::VENT_VIF)]
    },
    ignore: false,
};

// --- AIR VANILLA Special Skills ---
pub static STRATEGIE: Skill = Skill {
    id: SkillId::STRATEGIE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::STRATEGIE)]
    },
    ignore: false,
};

pub static ANALYSE: Skill = Skill {
    id: SkillId::ANALYSE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::ANALYSE)]
    },
    ignore: false,
};

pub static SPECIALISTE: Skill = Skill {
    id: SkillId::SPECIALISTE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::SPECIALISTE)]
    },
    ignore: false,
};
pub static FORME_VAPOREUSE: Skill = Skill {
    id: SkillId::FORME_VAPOREUSE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::FORME_VAPOREUSE)]
    },
    ignore: false,
};

pub static MAITRE_LEVITATEUR: Skill = Skill {
    id: SkillId::MAITRE_LEVITATEUR,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::MAITRE_LEVITATEUR)]
    },
    ignore: false,
};

pub static HALEINE_FETIVE: Skill = Skill {
    id: SkillId::HALEINE_FETIVE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::HALEINE_FETIVE)]
    },
    ignore: false,
};

pub static SOUFFLE_DE_VIE: Skill = Skill {
    id: SkillId::SOUFFLE_DE_VIE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::SOUFFLE_DE_VIE)]
    },
    ignore: false,
};

pub static FORME_ETHERALE: Skill = Skill {
    id: SkillId::FORME_ETHERALE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::FORME_ETHERALE)]
    },
    ignore: false,
};

// --- AIR ETHER Skills ---
// --- AIR ETHER Passive Skills ---
pub static MAITRISE_CORPORELLE: Skill = Skill {
    id: SkillId::MAITRISE_CORPORELLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.recovery_multiplier *= 1.25;
        vec![AttackResult::PassiveSkill(SkillId::MAITRISE_CORPORELLE)]
    },
    ignore: false,
};

pub static BLANC: Skill = Skill {
    id: SkillId::BLANC,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::PassiveSkill(SkillId::BLANC)]
    },
    ignore: false,
};

pub static ANAEROBIE: Skill = Skill {
    id: SkillId::ANAEROBIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 0.75) as u32;
        vec![AttackResult::PassiveSkill(SkillId::ANAEROBIE)]
    },
    ignore: false,
};

pub static DOUBLE_FACE: Skill = Skill {
    id: SkillId::DOUBLE_FACE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        let random: f32 = m.random_generator.gen_range(0.0..=1.0);
        if random <= 0.50 {
            f.time -= (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        } else {
            f.time += (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        }
        vec![AttackResult::PassiveSkill(SkillId::DOUBLE_FACE)]
    },
    ignore: false,
};

pub static FLAGELLATION: Skill = Skill {
    id: SkillId::FLAGELLATION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 0.85) as u32;
        vec![AttackResult::PassiveSkill(SkillId::FLAGELLATION)]
    },
    ignore: false,
};

pub static SOUFFLE_DANGE: Skill = Skill {
    id: SkillId::SOUFFLE_DANGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 20.0;
        vec![AttackResult::PassiveSkill(SkillId::SOUFFLE_DANGE)]
    },
    ignore: false,
};

pub static OURAGAN: Skill = Skill {
    id: SkillId::OURAGAN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Air as usize] += 20;
        vec![AttackResult::PassiveSkill(SkillId::OURAGAN)]
    },
    ignore: false,
};

pub static TWINOID_500MG: Skill = Skill {
    id: SkillId::TWINOID_500MG,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.5) as u32;
        vec![AttackResult::PassiveSkill(SkillId::TWINOID_500MG)]
    },
    ignore: false,
};

// --- AIR ETHER Active Skills ---
pub static OURANOS: Skill = Skill {
    id: SkillId::OURANOS,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::OURANOS)]
    },
    ignore: false,
};

pub static RECEPTABLE_THERMIQUE: Skill = Skill {
    id: SkillId::RECEPTABLE_THERMIQUE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::RECEPTABLE_THERMIQUE)]
    },
    ignore: false,
};

pub static SYLPHIDES: Skill = Skill {
    id: SkillId::SYLPHIDES,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::SYLPHIDES)]
    },
    ignore: false,
};

// --- AIR ETHER Event Skills ---
pub static QI_GONG: Skill = Skill {
    id: SkillId::QI_GONG,
    skill_type: SkillType::EVENT,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::QI_GONG)]
    },
    ignore: false,
};

pub static MUTINERIE: Skill = Skill {
    id: SkillId::MUTINERIE,
    skill_type: SkillType::EVENT,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::MUTINERIE)]
    },
    ignore: false,
};

pub static MAINS_COLLANTES: Skill = Skill {
    id: SkillId::MAINS_COLLANTES,
    skill_type: SkillType::EVENT,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::MAINS_COLLANTES)]
    },
    ignore: false,
};

// --- AIR ETHER Special Skills ---
pub static SURPLIS_DHADES: Skill = Skill {
    id: SkillId::SURPLIS_DHADES,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // extra item space handled in node
        vec![AttackResult::PassiveSkill(SkillId::SURPLIS_DHADES)]
    },
    ignore: false,
};

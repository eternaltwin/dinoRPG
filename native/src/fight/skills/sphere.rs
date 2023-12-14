/// Implementations of all sphere skills
use log::{error, trace};

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{fighter::Fighter, manager::AttackResult};

use super::{Skill, SkillId, SkillType};

// --- SPHERE Skills ---

// --- SPHERE FIRE Skills ---
pub static DETONATION: Skill = Skill {
    id: SkillId::DETONATION,
    skill_type: SkillType::EVENT,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::DETONATION)]
    },
    ignore: false,
};

pub static BRASERO: Skill = Skill {
    id: SkillId::BRASERO,
    skill_type: SkillType::EVENT,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BRASERO)]
    },
    ignore: false,
};

// --- SPHERE WOOD Skills ---
pub static LANCEUR_DE_GLAND: Skill = Skill {
    id: SkillId::LANCEUR_DE_GLAND,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::LANCEUR_DE_GLAND)]
    },
    ignore: false,
};

pub static GROSSE_BEIGNE: Skill = Skill {
    id: SkillId::GROSSE_BEIGNE,
    skill_type: SkillType::EVENT,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::GROSSE_BEIGNE)]
    },
    ignore: false,
};

// --- SPHERE WATER Skills ---
pub static VITALITE: Skill = Skill {
    id: SkillId::VITALITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::VITALITE)]
    },
    ignore: false,
};

pub static MOIGNONS_LIQUIDES: Skill = Skill {
    id: SkillId::MOIGNONS_LIQUIDES,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::MOIGNONS_LIQUIDES)]
    },
    ignore: false,
};

pub static DELUGE: Skill = Skill {
    id: SkillId::DELUGE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::DELUGE)]
    },
    ignore: false,
};

// --- SPHERE LIGHTNING Skills ---
pub static REFLEX: Skill = Skill {
    id: SkillId::REFLEX,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.time -= (5.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        vec![AttackResult::PassiveSkill(SkillId::REFLEX)]
    },
    ignore: false,
};

pub static ECLAIR_SINUEUX: Skill = Skill {
    id: SkillId::ECLAIR_SINUEUX,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ECLAIR_SINUEUX)]
    },
    ignore: false,
};

pub static SURVIE: Skill = Skill {
    id: SkillId::SURVIE,
    skill_type: SkillType::SPECIAL,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SURVIE)]
    },
    ignore: false,
};

// --- SPHERE AIR Skills ---
pub static AIGUILLON: Skill = Skill {
    id: SkillId::AIGUILLON,
    skill_type: SkillType::EVENT,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::AIGUILLON)]
    },
    ignore: false,
};

pub static AURA_PUANTE: Skill = Skill {
    id: SkillId::AURA_PUANTE,
    skill_type: SkillType::SPECIAL,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::AURA_PUANTE)]
    },
    ignore: false,
};

pub static HYPNOSE: Skill = Skill {
    id: SkillId::HYPNOSE,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::HYPNOSE)]
    },
    ignore: false,
};

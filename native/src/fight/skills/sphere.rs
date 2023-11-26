/// Implementations of all sphere skills
use log::{error, trace};

use crate::fight::manager::Manager;
use crate::fight::{fighter::Fighter, manager::AttackResult};

use super::{Skill, SkillId, SkillType};

// --- SPHERE Skills ---

// --- SPHERE FIRE Skills ---
pub static DETONATION: Skill = Skill {
    id: SkillId::DETONATION,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static BRASERO: Skill = Skill {
    id: SkillId::BRASERO,

    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static COEUR_DE_PHOENIX: Skill = Skill {
    id: SkillId::PAUME_CHALUMEAU,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Coeur de Phoenix skill is useless in fights");
        AttackResult::TodoSkill
    },
    ignore: true,
};

// --- SPHERE WOOD Skills ---
pub static LANCEUR_DE_GLAND: Skill = Skill {
    id: SkillId::LANCEUR_DE_GLAND,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static GRATTEUR: Skill = Skill {
    id: SkillId::GRATTEUR,

    skill_type: SkillType::COLLECT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default");
        AttackResult::TodoSkill
    },
    ignore: true,
};

pub static GROSSE_BEIGNE: Skill = Skill {
    id: SkillId::GROSSE_BEIGNE,

    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- SPHERE WATER Skills ---
// static VITALITE => VITALITE,
// static MOIGNONS_LIQUIDES => MOIGNONS_LIQUIDES,
// static DELUGE => DELUGE,

// --- SPHERE LIGHTNING Skills ---
// static REFLEX => REFLEX,
// static SURVIE => SURVIE,
// static ECLAIR_SINUEUX => ECLAIR_SINUEUX,

// --- SPHERE AIR Skills ---
// static AIGUILLON => AIGUILLON,
// static AURA_PUANTE => AURA_PUANTE,
// static HYPNOSE => HYPNOSE,

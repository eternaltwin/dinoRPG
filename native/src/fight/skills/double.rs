/// Implementations of all double skills
use log::error;

use crate::fight::elements::ElementIndex;
use crate::fight::fighter::Fighter;
use crate::fight::manager::{Manager, TIMECOEF};

use super::{Skill, SkillId, SkillType};

// --- DOUBLE Skills ---

// --- Active Skills ---

// pub static SECOUSSE => SECOUSSE,

// --- Passive Skills ---

// pub static SURCHARGE => SURCHARGE,

pub static VENDETTA: Skill = Skill {
    id: SkillId::VENDETTA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.counter_attack_chance *= 1.2;
    },
    ignore: false,
};

pub static ARMURE_DE_BASALTE: Skill = Skill {
    id: SkillId::ARMURE_DE_BASALTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.armor += 3;
    },
    ignore: false,
};

pub static SPRINT: Skill = Skill {
    id: SkillId::SPRINT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.time -= (6.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
    },
    ignore: false,
};

pub static MAITRE_ELEMENTAIRE: Skill = Skill {
    id: SkillId::MAITRE_ELEMENTAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |_: &mut Fighter, _: &mut Manager| {
        // element bonus handled in node
    },
    ignore: false,
};

pub static INCREVABLE: Skill = Skill {
    id: SkillId::INCREVABLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 2.0;
        f.defense[ElementIndex::Fire as usize] += 2.0;
        f.defense[ElementIndex::Lightning as usize] += 2.0;
        f.defense[ElementIndex::Water as usize] += 2.0;
        f.defense[ElementIndex::Wood as usize] += 2.0;
    },
    ignore: false,
};

// pub static BULLE => BULLE,

pub static ELECTROLYSE: Skill = Skill {
    id: SkillId::ELECTROLYSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.speed_global *= 0.95;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.speed_global *= 0.95;
            }
        }
    },
    ignore: false,
};

// --- Special Skills ---

pub static CHOC: Skill = Skill {
    id: SkillId::CHOC,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

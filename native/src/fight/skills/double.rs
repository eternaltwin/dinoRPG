/// Implementations of all double skills
use log::error;

use crate::fight::elements::ElementIndex;
use crate::fight::fighter::Fighter;
use crate::fight::manager::{AttackResult, Manager, TIMECOEF};

use super::{Skill, SkillId, SkillType};

// --- DOUBLE Skills ---

// --- Active Skills ---

pub static SECOUSSE: Skill = Skill {
    id: SkillId::SECOUSSE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _: &mut Manager| {
        // TODO
        vec![AttackResult::TodoSkill(SkillId::SECOUSSE)]
    },
    ignore: false,
};

// --- Passive Skills ---

pub static SURCHARGE: Skill = Skill {
    id: SkillId::SURCHARGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.multi_assault_chance *= 1.15;
        vec![AttackResult::PassiveSkill(SkillId::SURCHARGE)]
    },
    ignore: false,
};

pub static VENDETTA: Skill = Skill {
    id: SkillId::VENDETTA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.counter_attack_chance *= 1.2;
        vec![AttackResult::PassiveSkill(SkillId::VENDETTA)]
    },
    ignore: false,
};

pub static ARMURE_DE_BASALTE: Skill = Skill {
    id: SkillId::ARMURE_DE_BASALTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.armor += 3;
        vec![AttackResult::PassiveSkill(SkillId::ARMURE_DE_BASALTE)]
    },
    ignore: false,
};

pub static SPRINT: Skill = Skill {
    id: SkillId::SPRINT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.time -= (6.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        vec![AttackResult::PassiveSkill(SkillId::SPRINT)]
    },
    ignore: false,
};

pub static MAITRE_ELEMENTAIRE: Skill = Skill {
    id: SkillId::MAITRE_ELEMENTAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_: &mut Fighter, _: &mut Manager| {
        // element bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::MAITRE_ELEMENTAIRE)]
    },
    ignore: false,
};

pub static INCREVABLE: Skill = Skill {
    id: SkillId::INCREVABLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 2.0;
        f.defense[ElementIndex::Fire as usize] += 2.0;
        f.defense[ElementIndex::Lightning as usize] += 2.0;
        f.defense[ElementIndex::Water as usize] += 2.0;
        f.defense[ElementIndex::Wood as usize] += 2.0;
        vec![AttackResult::PassiveSkill(SkillId::INCREVABLE)]
    },
    ignore: false,
};

pub static BULLE: Skill = Skill {
    id: SkillId::BULLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::BULLE)]
    },
    ignore: false,
};

pub static ELECTROLYSE: Skill = Skill {
    id: SkillId::ELECTROLYSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.speed_global *= 0.95;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.speed_global *= 0.95;
            }
        }
        vec![AttackResult::PassiveSkill(SkillId::ELECTROLYSE)]
    },
    ignore: false,
};

// --- Special Skills ---

pub static CHOC: Skill = Skill {
    id: SkillId::CHOC,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::CHOC)]
    },
    ignore: false,
};

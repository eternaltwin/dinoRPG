/// Implementations of all race (including demons) skills
use crate::fight::{
    elements::ElementIndex,
    fighter::Fighter,
    manager::{AttackResult, Manager},
};

use super::{Skill, SkillId, SkillType};

// --- RACE & DEMON Skills ---

// --- Active Skills ---

// pub static ECRASEMENT => ECRASEMENT,
// pub static CHARGE_PIGMOU => CHARGE_PIGMOU,

// --- Event Skills ---

// pub static FRENESIE_COLLECTIVE => FRENESIE_COLLECTIVE,

// --- Passive Skills ---

pub static COQUE: Skill = Skill {
    id: SkillId::COQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m_: &mut Manager| {
        f.armor += 1;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static CHARGE_CORNUE: Skill = Skill {
    id: SkillId::CHARGE_CORNUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m_: &mut Manager| {
        f.next_assault_multiplier = 1.2;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static DUR_A_CUIRE: Skill = Skill {
    id: SkillId::DUR_A_CUIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 6.0;
        f.defense[ElementIndex::Fire as usize] += 6.0;
        f.defense[ElementIndex::Lightning as usize] += 6.0;
        f.defense[ElementIndex::Water as usize] += 6.0;
        f.defense[ElementIndex::Wood as usize] += 6.0;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static GROS_COSTAUD: Skill = Skill {
    id: SkillId::GROS_COSTAUD,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.all_assaults_bonus += 5;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static ORIGINE_CAUSHEMESHENNE: Skill = Skill {
    id: SkillId::ORIGINE_CAUSHEMESHENNE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static FORCE_DE_LUMIERE: Skill = Skill {
    id: SkillId::FORCE_DE_LUMIERE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static FORCE_DES_TENEBRES: Skill = Skill {
    id: SkillId::FORCE_DES_TENEBRES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.recovery_multiplier *= 1.25;
        f.max_energy = (f.max_energy as f32 * 1.25) as u32;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

// --- Special Skills ---

// pub static ROCK => ROCK,

pub static PIETINEMENT: Skill = Skill {
    id: SkillId::PIETINEMENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.cancel_armor = true;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

// pub static CUIRASSE => CUIRASSE,

pub static INSAISISSABLE: Skill = Skill {
    id: SkillId::INSAISISSABLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

pub static DEPLACEMENT_INSTANTANE: Skill = Skill {
    id: SkillId::DEPLACEMENT_INSTANTANE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![(None, AttackResult::PassiveSkill)]
    },
    ignore: false,
};

// pub static NAPOMAGICIEN => NAPOMAGICIEN,
// pub static BIGMAGNON => BIGMAGNON,

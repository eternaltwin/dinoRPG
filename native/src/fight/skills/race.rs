use rand::Rng;

/// Implementations of all race (including demons) skills
use crate::fight::{
    elements::ElementIndex,
    fighter::Fighter,
    manager::{AttackResult, Manager},
};

use super::{Skill, SkillId, SkillType};

// --- RACE & DEMON Skills ---

// --- Active Skills ---

pub static ECRASEMENT: Skill = Skill {
    id: SkillId::ECRASEMENT,
    skill_type: SkillType::ACTIVE,
    energy: 0,      // todo
    priority: 0,    // todo
    probability: 0, // todo
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::ECRASEMENT)]
    },
    ignore: false,
};

pub static CHARGE_PIGMOU: Skill = Skill {
    id: SkillId::CHARGE_PIGMOU,
    skill_type: SkillType::EVENT,
    energy: 0,      // todo
    priority: 0,    // todo
    probability: 0, // todo
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::CHARGE_PIGMOU)]
    },
    ignore: false,
};

// --- Event Skills ---

pub static FRENESIE_COLLECTIVE: Skill = Skill {
    id: SkillId::FRENESIE_COLLECTIVE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::FRENESIE_COLLECTIVE)]
    },
    ignore: false,
};

// --- Passive Skills ---

pub static COQUE: Skill = Skill {
    id: SkillId::COQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m_: &mut Manager| {
        f.armor += 1;
        vec![AttackResult::PassiveSkill(SkillId::COQUE)]
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
        vec![AttackResult::PassiveSkill(SkillId::CHARGE_CORNUE)]
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
        vec![AttackResult::PassiveSkill(SkillId::DUR_A_CUIRE)]
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
        vec![AttackResult::PassiveSkill(SkillId::GROS_COSTAUD)]
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
        vec![AttackResult::TodoSkill(SkillId::ORIGINE_CAUSHEMESHENNE)]
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
        vec![AttackResult::TodoSkill(SkillId::FORCE_DE_LUMIERE)]
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
        vec![AttackResult::PassiveSkill(SkillId::FORCE_DES_TENEBRES)]
    },
    ignore: false,
};

// --- Special Skills ---

pub static ROCK: Skill = Skill {
    id: SkillId::ROCK,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::PassiveSkill(SkillId::ROCK)]
    },
    ignore: false,
};

pub static PIETINEMENT: Skill = Skill {
    id: SkillId::PIETINEMENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.cancel_armor = true;
        vec![AttackResult::PassiveSkill(SkillId::PIETINEMENT)]
    },
    ignore: false,
};

pub static CUIRASSE: Skill = Skill {
    id: SkillId::CUIRASSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defensive_effects.push(
            |_a: &mut Fighter,
             _t: &mut Fighter,
             m: &mut Manager,
             damage: &mut i32,
             is_assault: bool,
             _| {
                if is_assault && m.random_generator.gen_range(0..=100) < 5 {
                    *damage -= 5;
                    if *damage < 0 {
                        *damage = 0;
                    }
                }
            },
        );
        vec![AttackResult::PassiveSkill(SkillId::CUIRASSE)]
    },
    ignore: false,
};

pub static INSAISISSABLE: Skill = Skill {
    id: SkillId::INSAISISSABLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
        vec![AttackResult::PassiveSkill(SkillId::INSAISISSABLE)]
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
        vec![AttackResult::TodoSkill(SkillId::DEPLACEMENT_INSTANTANE)]
    },
    ignore: false,
};

pub static NAPOMAGICIEN: Skill = Skill {
    id: SkillId::NAPOMAGICIEN,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::NAPOMAGICIEN)]
    },
    ignore: false,
};

pub static BIGMAGNON: Skill = Skill {
    id: SkillId::BIGMAGNON,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::BIGMAGNON)]
    },
    ignore: false,
};

/// Implementations of all invocation skills
use log::error;

use crate::fight::manager::Manager;
use crate::fight::{fighter::Fighter, manager::AttackResult};

use super::{Skill, SkillId, SkillType};

// --- INVOCATION Skills ---

// pub static GOLEM => GOLEM,
// pub static RAIJIN => RAIJIN,
// pub static QUETZACOATL => QUETZACOATL,
// pub static ROI_DES_SINGES => ROI_DES_SINGES,
// pub static TOTEM_ANCESTRAL_AEROPORTE => TOTEM_ANCESTRAL_AEROPORTE,
// pub static FUJIN => FUJIN,
// pub static DJINN => DJINN,
// pub static HADES => HADES,
pub static BOUDDHA: Skill = Skill {
    id: SkillId::PAUME_CHALUMEAU,

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

pub static SALAMANDRE: Skill = Skill {
    id: SkillId::SALAMANDRE,

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

pub static VULCAIN: Skill = Skill {
    id: SkillId::VULCAIN,

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

pub static ARMURE_DIFRIT: Skill = Skill {
    id: SkillId::ARMURE_DIFRIT,

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

pub static BENEDICTION_DES_FEES: Skill = Skill {
    id: SkillId::BENEDICTION_DES_FEES,

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

pub static LOUP_GAROU: Skill = Skill {
    id: SkillId::LOUP_GAROU,
    skill_type: SkillType::INVOCATION,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// pub static ONDINE => ONDINE,
// pub static LEVIATHAN => LEVIATHAN,

// pub static HERCOLUBUS => HERCOLUBUS,
// pub static REINE_DE_LA_RUCHE => REINE_DE_LA_RUCHE,
// pub static BIG_MAMA => BIG_MAMA,
// pub static YGGDRASIL => YGGDRASIL,
// pub static BALEINE_BLANCHE => BALEINE_BLANCHE,

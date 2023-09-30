use std::collections::HashMap;

/// Implementations of all invocation skills
use log::{error, trace};

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

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
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static SALAMANDRE: Skill = Skill {
    id: SkillId::SALAMANDRE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static VULCAIN: Skill = Skill {
    id: SkillId::VULCAIN,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static ARMURE_DIFRIT: Skill = Skill {
    id: SkillId::ARMURE_DIFRIT,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static BENEDICTION_DES_FEES: Skill = Skill {
    id: SkillId::BENEDICTION_DES_FEES,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static LOUP_GAROU: Skill = Skill {
    id: SkillId::LOUP_GAROU,
    skill_type: SkillType::INVOCATION,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented")
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

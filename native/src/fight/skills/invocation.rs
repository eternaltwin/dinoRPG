/// Implementations of all invocation skills
use log::error;

use crate::fight::manager::Manager;
use crate::fight::{fighter::Fighter, manager::AttackResult};

use super::{Skill, SkillId, SkillType};

// --- INVOCATION Skills ---

pub static GOLEM: Skill = Skill {
    id: SkillId::GOLEM,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::GOLEM)]
    },
    ignore: false,
};

pub static RAIJIN: Skill = Skill {
    id: SkillId::RAIJIN,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RAIJIN)]
    },
    ignore: false,
};

pub static QUETZACOATL: Skill = Skill {
    id: SkillId::QUETZACOATL,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::QUETZACOATL)]
    },
    ignore: false,
};
pub static ROI_DES_SINGES: Skill = Skill {
    id: SkillId::ROI_DES_SINGES,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ROI_DES_SINGES)]
    },
    ignore: false,
};

pub static TOTEM_ANCESTRAL_AEROPORTE: Skill = Skill {
    id: SkillId::TOTEM_ANCESTRAL_AEROPORTE,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::TOTEM_ANCESTRAL_AEROPORTE)]
    },
    ignore: false,
};

pub static FUJIN: Skill = Skill {
    id: SkillId::FUJIN,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::FUJIN)]
    },
    ignore: false,
};

pub static DJINN: Skill = Skill {
    id: SkillId::DJINN,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::DJINN)]
    },
    ignore: false,
};

pub static HADES: Skill = Skill {
    id: SkillId::HADES,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::HADES)]
    },
    ignore: false,
};

pub static BOUDDHA: Skill = Skill {
    id: SkillId::BOUDDHA,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BOUDDHA)]
    },
    ignore: false,
};

pub static SALAMANDRE: Skill = Skill {
    id: SkillId::SALAMANDRE,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SALAMANDRE)]
    },
    ignore: false,
};

pub static VULCAIN: Skill = Skill {
    id: SkillId::VULCAIN,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::VULCAIN)]
    },
    ignore: false,
};

pub static ARMURE_DIFRIT: Skill = Skill {
    id: SkillId::ARMURE_DIFRIT,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ARMURE_DIFRIT)]
    },
    ignore: false,
};

pub static BENEDICTION_DES_FEES: Skill = Skill {
    id: SkillId::BENEDICTION_DES_FEES,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BENEDICTION_DES_FEES)]
    },
    ignore: false,
};

pub static LOUP_GAROU: Skill = Skill {
    id: SkillId::LOUP_GAROU,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::LOUP_GAROU)]
    },
    ignore: false,
};

pub static ONDINE: Skill = Skill {
    id: SkillId::ONDINE,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ONDINE)]
    },
    ignore: false,
};

pub static LEVIATHAN: Skill = Skill {
    id: SkillId::LEVIATHAN,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::LEVIATHAN)]
    },
    ignore: false,
};

pub static HERCOLUBUS: Skill = Skill {
    id: SkillId::HERCOLUBUS,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::HERCOLUBUS)]
    },
    ignore: false,
};

pub static REINE_DE_LA_RUCHE: Skill = Skill {
    id: SkillId::REINE_DE_LA_RUCHE,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::REINE_DE_LA_RUCHE)]
    },
    ignore: false,
};

pub static BIG_MAMA: Skill = Skill {
    id: SkillId::BIG_MAMA,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BIG_MAMA)]
    },
    ignore: false,
};

pub static YGGDRASIL: Skill = Skill {
    id: SkillId::YGGDRASIL,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::YGGDRASIL)]
    },
    ignore: false,
};

pub static BALEINE_BLANCHE: Skill = Skill {
    id: SkillId::BALEINE_BLANCHE,
    skill_type: SkillType::INVOCATION,
    energy: 0,      // TODO
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        error!("Default invocation skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BALEINE_BLANCHE)]
    },
    ignore: false,
};

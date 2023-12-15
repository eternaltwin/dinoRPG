/// Implementations of all wood skills from Vanilla and Ether skill trees
use log::{error};

use crate::fight::manager::{AttackResult, Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- WOOD Skills ---

// --- WOOD VANILLA Skills ---

// --- WOOD VANILLA Passive Skills ---
pub static CARAPACE: Skill = Skill {
    id: SkillId::CARAPACE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.armor += 1;
        vec![AttackResult::PassiveSkill(SkillId::CARAPACE)]
    },
    ignore: false,
};

pub static SAUVAGERIE: Skill = Skill {
    id: SkillId::SAUVAGERIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 5;
        vec![AttackResult::PassiveSkill(SkillId::SAUVAGERIE)]
    },
    ignore: false,
};

pub static ENDURANCE: Skill = Skill {
    id: SkillId::ENDURANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 2.0;
        vec![AttackResult::PassiveSkill(SkillId::ENDURANCE)]
    },
    ignore: false,
};

pub static TENACITE: Skill = Skill {
    id: SkillId::TENACITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.minimum_damage += 1;
        vec![AttackResult::PassiveSkill(SkillId::TENACITE)]
    },
    ignore: false,
};

pub static CROISSANCE: Skill = Skill {
    id: SkillId::CROISSANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 1;
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::CROISSANCE)]
    },
    ignore: false,
};

pub static INSTINCT_SAUVAGE: Skill = Skill {
    id: SkillId::INSTINCT_SAUVAGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::INSTINCT_SAUVAGE)]
    },
    ignore: false,
};

pub static LARGE_MACHOIRE: Skill = Skill {
    id: SkillId::LARGE_MACHOIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 15;
        vec![AttackResult::PassiveSkill(SkillId::LARGE_MACHOIRE)]
    },
    ignore: false,
};

pub static ACROBATE: Skill = Skill {
    id: SkillId::ACROBATE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_global *= 0.85;
        vec![AttackResult::PassiveSkill(SkillId::ACROBATE)]
    },
    ignore: false,
};

pub static HERITAGE_FAROE: Skill = Skill {
    id: SkillId::HERITAGE_FAROE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 12;
        f.armor += 1;
        vec![AttackResult::PassiveSkill(SkillId::HERITAGE_FAROE)]
    },
    ignore: false,
};

pub static GEANT: Skill = Skill {
    id: SkillId::GEANT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 5;
        f.speed_global *= 1.2;
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::GEANT)]
    },
    ignore: false,
};

pub static GARDE_FORESTIER: Skill = Skill {
    id: SkillId::GARDE_FORESTIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 3.0;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.defense[ElementIndex::Wood as usize] += 3.0;
            }
        }
        vec![AttackResult::PassiveSkill(SkillId::GARDE_FORESTIER)]
    },
    ignore: false,
};

pub static COLOSSE: Skill = Skill {
    id: SkillId::COLOSSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 15;
        f.speed_global *= 1.5;
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::COLOSSE)]
    },
    ignore: false,
};

// --- WOOD VANILLA Active Skills ---
pub static VIGNES: Skill = Skill {
    id: SkillId::VIGNES,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::VIGNES)]
    },
    ignore: false,
};

// --- WOOD VANILLA Event Skills ---
pub static RENFORTS_KORGON: Skill = Skill {
    id: SkillId::RENFORTS_KORGON,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RENFORTS_KORGON)]
    },
    ignore: false,
};

pub static ETAT_PRIMAL: Skill = Skill {
    id: SkillId::ETAT_PRIMAL,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ETAT_PRIMAL)]
    },
    ignore: false,
};

pub static PRINTEMPS_PRECOCE: Skill = Skill {
    id: SkillId::PRINTEMPS_PRECOCE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::PRINTEMPS_PRECOCE)]
    },
    ignore: false,
};

pub static RESISTANCE_A_LA_MAGIE: Skill = Skill {
    id: SkillId::RESISTANCE_A_LA_MAGIE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RESISTANCE_A_LA_MAGIE)]
    },
    ignore: false,
};

pub static ESPRIT_GORILLOZ: Skill = Skill {
    id: SkillId::ESPRIT_GORILLOZ,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ESPRIT_GORILLOZ)]
    },
    ignore: false,
};

// --- WOOD VANILLA Special Skills ---
// None

// --- WOOD ETHER Skills ---

// --- WOOD ETHER Passive Skills ---
pub static OXYGENATION_MUSCULAIRE: Skill = Skill {
    id: SkillId::OXYGENATION_MUSCULAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.2) as u32;
        vec![AttackResult::PassiveSkill(SkillId::OXYGENATION_MUSCULAIRE)]
    },
    ignore: false,
};

pub static VERT: Skill = Skill {
    id: SkillId::VERT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::VERT)]
    },
    ignore: false,
};

pub static ACIDE_LACTIQUE: Skill = Skill {
    id: SkillId::ACIDE_LACTIQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 0.85) as u32;
        vec![AttackResult::PassiveSkill(SkillId::ACIDE_LACTIQUE)]
    },
    ignore: false,
};

pub static FORCE_CONTROL: Skill = Skill {
    id: SkillId::FORCE_CONTROL,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        if f.minimum_assault_damage < 10 {
            f.minimum_assault_damage = 10;
        }
        vec![AttackResult::TodoSkill(SkillId::FORCE_CONTROL)]
    },
    ignore: false,
};

pub static PEAU_DE_FER: Skill = Skill {
    id: SkillId::PEAU_DE_FER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::TodoSkill(SkillId::PEAU_DE_FER)]
    },
    ignore: false,
};

pub static COURANT_DE_VIE: Skill = Skill {
    id: SkillId::COURANT_DE_VIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Water as usize] += 20.0;
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 20;
        vec![AttackResult::TodoSkill(SkillId::COURANT_DE_VIE)]
    },
    ignore: false,
};

pub static RIVIERE_DE_VIE: Skill = Skill {
    id: SkillId::RIVIERE_DE_VIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.time -= (20.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        vec![AttackResult::TodoSkill(SkillId::RIVIERE_DE_VIE)]
    },
    ignore: false,
};

pub static PEAU_DACIER: Skill = Skill {
    id: SkillId::PEAU_DACIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::TodoSkill(SkillId::PEAU_DACIER)]
    },
    ignore: false,
};

// --- WOOD ETHER Active Skills ---
pub static LANCER_DE_ROCHE: Skill = Skill {
    id: SkillId::LANCER_DE_ROCHE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::LANCER_DE_ROCHE)]
    },
    ignore: false,
};

pub static MUR_DE_BOUE: Skill = Skill {
    id: SkillId::MUR_DE_BOUE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::MUR_DE_BOUE)]
    },
    ignore: false,
};

pub static AMAZONIE: Skill = Skill {
    id: SkillId::AMAZONIE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::AMAZONIE)]
    },
    ignore: false,
};

pub static RECEPTACLE_AQUEUX: Skill = Skill {
    id: SkillId::RECEPTACLE_AQUEUX,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RECEPTACLE_AQUEUX)]
    },
    ignore: false,
};

// --- WOOD ETHER Event Skills ---
pub static BOUCLIER_DINOZ: Skill = Skill {
    id: SkillId::BOUCLIER_DINOZ,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BOUCLIER_DINOZ)]
    },
    ignore: false,
};

pub static COURBATURES: Skill = Skill {
    id: SkillId::COURBATURES,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::COURBATURES)]
    },
    ignore: false,
};

pub static BERSERK: Skill = Skill {
    id: SkillId::BERSERK,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BERSERK)]
    },
    ignore: false,
};

pub static SHARIGNAN: Skill = Skill {
    id: SkillId::SHARIGNAN,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SHARIGNAN)]
    },
    ignore: false,
};

// --- WOOD ETHER Special Skills ---
pub static SOURCE_DE_VIE: Skill = Skill {
    id: SkillId::SOURCE_DE_VIE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SOURCE_DE_VIE)]
    },
    ignore: false,
};

pub static VIDE_ENERGETIQUE: Skill = Skill {
    id: SkillId::VIDE_ENERGETIQUE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::VIDE_ENERGETIQUE)]
    },
    ignore: false,
};

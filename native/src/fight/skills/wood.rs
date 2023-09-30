/// Implementations of all wood skills from Vanilla and Ether skill trees
use log::{debug, error, trace};

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- WOOD Skills ---

// --- WOOD VANILLA Skills ---

// --- WOOD VANILLA Passive Skills ---
pub static CARAPACE: Skill = Skill {
    id: SkillId::CARAPACE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.armor += 1;
    },
    ignore: false,
};

pub static SAUVAGERIE: Skill = Skill {
    id: SkillId::SAUVAGERIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 5;
    },
    ignore: false,
};

pub static ENDURANCE: Skill = Skill {
    id: SkillId::ENDURANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 2.0;
    },
    ignore: false,
};

pub static TENACITE: Skill = Skill {
    id: SkillId::TENACITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.minimum_damage += 1;
    },
    ignore: false,
};

pub static CROISSANCE: Skill = Skill {
    id: SkillId::CROISSANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 1;
        // hp bonus handled in node
    },
    ignore: false,
};

pub static INSTINCT_SAUVAGE: Skill = Skill {
    id: SkillId::INSTINCT_SAUVAGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // element bonus handled in node
    },
    ignore: false,
};

pub static LARGE_MACHOIRE: Skill = Skill {
    id: SkillId::LARGE_MACHOIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 15;
    },
    ignore: false,
};

pub static ACROBATE: Skill = Skill {
    id: SkillId::ACROBATE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.speed_global *= 0.85;
    },
    ignore: false,
};

pub static HERITAGE_FAROE: Skill = Skill {
    id: SkillId::HERITAGE_FAROE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 12;
        f.armor += 1;
    },
    ignore: false,
};

pub static GEANT: Skill = Skill {
    id: SkillId::GEANT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 5;
        f.speed_global *= 1.2;
        // hp bonus handled in node
    },
    ignore: false,
};

pub static GARDE_FORESTIER: Skill = Skill {
    id: SkillId::GARDE_FORESTIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 3.0;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.defense[ElementIndex::Wood as usize] += 3.0;
            }
        }
    },
    ignore: false,
};

pub static COLOSSE: Skill = Skill {
    id: SkillId::COLOSSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 15;
        f.speed_global *= 1.5;
        // hp bonus handled in node
    },
    ignore: false,
};

// --- WOOD VANILLA Active Skills ---
pub static VIGNES: Skill = Skill {
    id: SkillId::VIGNES,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WOOD VANILLA Event Skills ---
pub static RENFORTS_KORGON: Skill = Skill {
    id: SkillId::RENFORTS_KORGON,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static ETAT_PRIMAL: Skill = Skill {
    id: SkillId::ETAT_PRIMAL,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static PRINTEMPS_PRECOCE: Skill = Skill {
    id: SkillId::PRINTEMPS_PRECOCE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static RESISTANCE_A_LA_MAGIE: Skill = Skill {
    id: SkillId::RESISTANCE_A_LA_MAGIE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static ESPRIT_GORILLOZ: Skill = Skill {
    id: SkillId::ESPRIT_GORILLOZ,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WOOD VANILLA Special Skills ---
pub static SYMPATIQUE: Skill = Skill {
    id: SkillId::SYMPATIQUE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| trace!("Sympathique is useless in fights"),
    ignore: true,
};

pub static COCON: Skill = Skill {
    id: SkillId::COCON,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| trace!("Cocon is useless in fights"),
    ignore: true,
};

pub static CHARISME: Skill = Skill {
    id: SkillId::CHARISME,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| trace!("Charisme is useless in fights"),
    ignore: true,
};

// --- WOOD VANILLA Collect SKills ---
pub static FOUILLE: Skill = Skill {
    id: SkillId::FOUILLE,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

pub static DETECTIVE: Skill = Skill {
    id: SkillId::DETECTIVE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static PLANIFICATEUR: Skill = Skill {
    id: SkillId::PLANIFICATEUR,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static EXPERT_EN_FOUILLE: Skill = Skill {
    id: SkillId::EXPERT_EN_FOUILLE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static ARCHEOLOGUE: Skill = Skill {
    id: SkillId::ARCHEOLOGUE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WOOD VANILLA Universal Skills ---
pub static LEADER: Skill = Skill {
    id: SkillId::LEADER,
    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Universal skill, ignored for fights by default")
    },
    ignore: true,
};

pub static INGENIEUR: Skill = Skill {
    id: SkillId::INGENIEUR,

    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Universal skill, ignored for fights by default")
    },
    ignore: true,
};

// --- WOOD ETHER Skills ---

// --- WOOD ETHER Passive Skills ---
pub static OXYGENATION_MUSCULAIRE: Skill = Skill {
    id: SkillId::OXYGENATION_MUSCULAIRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| f.max_energy = (f.max_energy as f32 * 1.2) as u32,
    ignore: false,
};

pub static VERT: Skill = Skill {
    id: SkillId::VERT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
    },
    ignore: false,
};

pub static ACIDE_LACTIQUE: Skill = Skill {
    id: SkillId::ACIDE_LACTIQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| f.max_energy = (f.max_energy as f32 * 0.85) as u32,
    ignore: false,
};

pub static FORCE_CONTROL: Skill = Skill {
    id: SkillId::FORCE_CONTROL,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        if f.minimum_assault_damage < 10 {
            f.minimum_assault_damage = 10;
        }
    },
    ignore: false,
};

pub static PEAU_DE_FER: Skill = Skill {
    id: SkillId::PEAU_DE_FER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

pub static CHAMPOLLION: Skill = Skill {
    id: SkillId::CHAMPOLLION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| debug!("This skill is useless in fights"),
    ignore: true,
};

pub static COURANT_DE_VIE: Skill = Skill {
    id: SkillId::COURANT_DE_VIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Water as usize] += 20.0;
        f.assault_elemental_bonus[ElementIndex::Wood as usize] += 20;
    },
    ignore: false,
};

pub static RIVIERE_DE_VIE: Skill = Skill {
    id: SkillId::RIVIERE_DE_VIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.time -= (20.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
    },
    ignore: false,
};

pub static PEAU_DACIER: Skill = Skill {
    id: SkillId::PEAU_DACIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

// --- WOOD ETHER Active Skills ---
pub static LANCER_DE_ROCHE: Skill = Skill {
    id: SkillId::LANCER_DE_ROCHE,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static MUR_DE_BOUE: Skill = Skill {
    id: SkillId::MUR_DE_BOUE,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static AMAZONIE: Skill = Skill {
    id: SkillId::AMAZONIE,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static RECEPTACLE_AQUEUX: Skill = Skill {
    id: SkillId::RECEPTACLE_AQUEUX,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WOOD ETHER Event Skills ---
pub static BOUCLIER_DINOZ: Skill = Skill {
    id: SkillId::BOUCLIER_DINOZ,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static COURBATURES: Skill = Skill {
    id: SkillId::COURBATURES,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static BERSERK: Skill = Skill {
    id: SkillId::BERSERK,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static SHARIGNAN: Skill = Skill {
    id: SkillId::SHARIGNAN,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WOOD ETHER Special Skills ---
pub static SOURCE_DE_VIE: Skill = Skill {
    id: SkillId::SOURCE_DE_VIE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static VIDE_ENERGETIQUE: Skill = Skill {
    id: SkillId::VIDE_ENERGETIQUE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

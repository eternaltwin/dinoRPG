/// Implementations of all water skills from Vanilla and Ether skill trees
use log::{error, trace};

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- WATER Skills ---
// --- WATER VANILLA Skills ---

// --- WATER VANILLA Passive Skills ---
pub static PERCEPTION: Skill = Skill {
    id: SkillId::PERCEPTION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 4;
        f.can_touch_intangible = true;
    },
    ignore: false,
};

pub static MUTATION: Skill = Skill {
    id: SkillId::MUTATION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

pub static KARATE_SOUS_MARIN: Skill = Skill {
    id: SkillId::KARATE_SOUS_MARIN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 10;
        f.skill_elemental_bonus[ElementIndex::Water as usize] += 10;
    },
    ignore: false,
};

pub static ENTRAINEMENT_SOUS_MARIN: Skill = Skill {
    id: SkillId::ENTRAINEMENT_SOUS_MARIN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

pub static SUMO: Skill = Skill {
    id: SkillId::SUMO,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

pub static ZERO_ABSOLU: Skill = Skill {
    id: SkillId::ZERO_ABSOLU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 25.0;
    },
    ignore: false,
};

pub static ENTRAINEMENT_SOUS_MARIN_AVANCE: Skill = Skill {
    id: SkillId::ENTRAINEMENT_SOUS_MARIN_AVANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

pub static MAITRE_NAGEUR: Skill = Skill {
    id: SkillId::MAITRE_NAGEUR,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // element bonus handled in node
    },
    ignore: false,
};

// --- WATER Passive Skills for Quetzus ---
pub static ECAILLES_LUMINESCENTES: Skill = Skill {
    id: SkillId::ECAILLES_LUMINESCENTES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.armor += 2;
    },
    ignore: false,
};

pub static PEAU_DE_SERPENT: Skill = Skill {
    id: SkillId::PEAU_DE_SERPENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
        f.speed_per_element[ElementIndex::Water as usize] *= 0.85;
    },
    ignore: false,
};

// --- WATER VANILLA Active Skills ---
pub static CANON_A_EAU: Skill = Skill {
    id: SkillId::CANON_A_EAU,
    energy: 5,

    skill_type: SkillType::ACTIVE,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static GEL: Skill = Skill {
    id: SkillId::GEL,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static COUP_SOURNOIS: Skill = Skill {
    id: SkillId::COUP_SOURNOIS,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static COUP_FATAL: Skill = Skill {
    id: SkillId::COUP_FATAL,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static PETRIFICATION: Skill = Skill {
    id: SkillId::PETRIFICATION,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static RAYON_KAAR_SHER: Skill = Skill {
    id: SkillId::RAYON_KAAR_SHER,

    skill_type: SkillType::ACTIVE,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WATER VANILLA Event Skills ---
pub static DOUCHE_ECOSSAISE: Skill = Skill {
    id: SkillId::DOUCHE_ECOSSAISE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static MARECAGE: Skill = Skill {
    id: SkillId::MARECAGE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static CLONE_AQUEUX: Skill = Skill {
    id: SkillId::CLONE_AQUEUX,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WATER VANILLA Special Skills ---
pub static POCHE_VENTRALE: Skill = Skill {
    id: SkillId::POCHE_VENTRALE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // extra item space handled in node
    },
    ignore: true,
};

pub static SANS_PITIE: Skill = Skill {
    id: SkillId::SANS_PITIE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static GRIFFES_EMPOISONNEES: Skill = Skill {
    id: SkillId::GRIFFES_EMPOISONNEES,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static ACUPUNCTURE: Skill = Skill {
    id: SkillId::ACUPUNCTURE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static SAPEUR: Skill = Skill {
    id: SkillId::SAPEUR,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static SANG_ACIDE: Skill = Skill {
    id: SkillId::SANG_ACIDE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WATER VANILLA Collect Skills ---
pub static APPRENTI_PECHEUR: Skill = Skill {
    id: SkillId::APPRENTI_PECHEUR,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

pub static PECHEUR_CONFIRME: Skill = Skill {
    id: SkillId::PECHEUR_CONFIRME,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

pub static MAITRE_PECHEUR: Skill = Skill {
    id: SkillId::MAITRE_PECHEUR,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

// --- WATER VANILLA Universal Skills ---
pub static MAGASINIER: Skill = Skill {
    id: SkillId::MAGASINIER,

    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        trace!("Universal skill, ignored for fights by default")
    },
    ignore: true,
};

pub static CUISINIER: Skill = Skill {
    id: SkillId::CUISINIER,
    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Universal skill cuisinier not yet implemented");
    },
    ignore: true,
};

// --- WATER ETHER Skills ---

// --- WATER ETHER Passive Skills ---
pub static RADIATIONS_GAMMA: Skill = Skill {
    id: SkillId::RADIATIONS_GAMMA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 5;
        f.time += (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        // hp bonus handled in node
    },
    ignore: false,
};

pub static BLEU: Skill = Skill {
    id: SkillId::BLEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
    },
    ignore: false,
};

pub static MUE_ACQUEUSE: Skill = Skill {
    id: SkillId::MUE_ACQUEUSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.defense[ElementIndex::Lightning as usize] += 20.0;
    },
    ignore: false,
};

pub static CARAPACE_BLINDEE: Skill = Skill {
    id: SkillId::CARAPACE_BLINDEE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.armor += 10;
        f.speed_global *= 1.2;
    },
    ignore: false,
};

pub static TOURBILLON_MAGIQUE: Skill = Skill {
    id: SkillId::TOURBILLON_MAGIQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 20;
    },
    ignore: false,
};

pub static VITALITE_MARINE: Skill = Skill {
    id: SkillId::VITALITE_MARINE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // hp bonus handled in node
    },
    ignore: false,
};

// --- WATER ETHER Active Skills ---
pub static ABYSSE: Skill = Skill {
    id: SkillId::ABYSSE,
    energy: 35,

    skill_type: SkillType::ACTIVE,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static HYPERVENTILATION: Skill = Skill {
    id: SkillId::HYPERVENTILATION,
    energy: 55,

    skill_type: SkillType::ACTIVE,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static RECEPTACLE_TESLA: Skill = Skill {
    id: SkillId::RECEPTACLE_TESLA,
    energy: 45,

    skill_type: SkillType::ACTIVE,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- WATER ETHER Event Skills ---
pub static DIETE_CHROMATIQUE: Skill = Skill {
    id: SkillId::DIETE_CHROMATIQUE,
    energy: 45,

    skill_type: SkillType::EVENT,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static THERAPIE_DE_GROUPE: Skill = Skill {
    id: SkillId::THERAPIE_DE_GROUPE,
    energy: 55,
    skill_type: SkillType::EVENT,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static CLEPTOMANE: Skill = Skill {
    id: SkillId::CLEPTOMANE,
    skill_type: SkillType::EVENT,
    energy: 45,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
    },
    ignore: false,
};

// --- WATER ETHER Special Skills ---
pub static EAU_DIVINE: Skill = Skill {
    id: SkillId::EAU_DIVINE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

pub static EFFLUVE_APHRODISIAQUE: Skill = Skill {
    id: SkillId::EFFLUVE_APHRODISIAQUE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

pub static NEMO: Skill = Skill {
    id: SkillId::NEMO,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

pub static BANNI_DES_DIEUX: Skill = Skill {
    id: SkillId::BANNI_DES_DIEUX,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

/// Implementations of all lightning skills from Vanilla and Ether skill trees
use log::{error, trace};

use crate::fight::manager::{Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- LIGHTNING Skills ---
// --- LIGHTNING VANILLA Skills ---

// --- LIGHTNING VANILLA Passive Skills ---
pub static CELERITE: Skill = Skill {
    id: SkillId::CELERITE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_global *= 0.85;
    },
    ignore: false,
};

pub static ATTAQUE_ECLAIR: Skill = Skill {
    id: SkillId::ATTAQUE_ECLAIR,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_per_element[ElementIndex::Lightning as usize] *= 0.60;
    },
    ignore: false,
};

pub static COUP_DOUBLE: Skill = Skill {
    id: SkillId::COUP_DOUBLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.multi_assault_chance *= 1.2;
    },
    ignore: false,
};

pub static VOIE_DE_KAOS: Skill = Skill {
    id: SkillId::VOIE_DE_KAOS,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 6;
        f.assault_elemental_bonus[ElementIndex::Lightning as usize] += 6;
    },
    ignore: false,
};

pub static VOIE_DE_GAIA: Skill = Skill {
    id: SkillId::VOIE_DE_GAIA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 3.0;
        f.defense[ElementIndex::Lightning as usize] += 3.0;
    },
    ignore: false,
};

pub static ADRENALINE: Skill = Skill {
    id: SkillId::ADRENALINE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_per_element[ElementIndex::Lightning as usize] *= 0.5;
    },
    ignore: false,
};

pub static EMBUCHE: Skill = Skill {
    id: SkillId::EMBUCHE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.time -= (7.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
    },
    ignore: false,
};

pub static CROCS_DIAMANT: Skill = Skill {
    id: SkillId::CROCS_DIAMANT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 2;
    },
    ignore: false,
};

pub static ARCHANGE_CORROSIF: Skill = Skill {
    id: SkillId::ARCHANGE_CORROSIF,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
    },
    ignore: false,
};

pub static ARCHANGE_GENESIF: Skill = Skill {
    id: SkillId::ARCHANGE_GENESIF,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
    },
    ignore: false,
};

// --- LIGHTNING VANILLA Active Skills ---
pub static FOUDRE: Skill = Skill {
    id: SkillId::FOUDRE,
    energy: 25,

    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static DANSE_FOUDROYANTE: Skill = Skill {
    id: SkillId::DANSE_FOUDROYANTE,
    energy: 35,

    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static AUBE_FEUILLUE: Skill = Skill {
    id: SkillId::AUBE_FEUILLUE,
    energy: 65,

    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static CREPUSCULE_FLAMBOYANT: Skill = Skill {
    id: SkillId::CREPUSCULE_FLAMBOYANT,
    energy: 40,

    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- LIGHTNING VANILLA Event Skills ---
pub static FOCUS: Skill = Skill {
    id: SkillId::FOCUS,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static PUREE_SALVATRICE: Skill = Skill {
    id: SkillId::PUREE_SALVATRICE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static AURA_HERMETIQUE: Skill = Skill {
    id: SkillId::AURA_HERMETIQUE,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static BENEDICTION: Skill = Skill {
    id: SkillId::BENEDICTION,

    skill_type: SkillType::EVENT,
    energy: 0, // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented")
    },
    ignore: false,
};

// --- LIGHTNING VANILLA Special Skills ---
pub static INTELLIGENCE: Skill = Skill {
    id: SkillId::INTELLIGENCE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

pub static CONCENTRATION: Skill = Skill {
    id: SkillId::CONCENTRATION,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static REGENERESCENCE: Skill = Skill {
    id: SkillId::REGENERESCENCE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};
pub static PREMIERS_SOINS: Skill = Skill {
    id: SkillId::PREMIERS_SOINS,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static PLAN_DE_CARRIERE: Skill = Skill {
    id: SkillId::PLAN_DE_CARRIERE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

pub static MEDECINE: Skill = Skill {
    id: SkillId::MEDECINE,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static BRANCARDIER: Skill = Skill {
    id: SkillId::BRANCARDIER,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented")
    },
    ignore: false,
};

pub static REINCARNATION: Skill = Skill {
    id: SkillId::REINCARNATION,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // useless in fights
    },
    ignore: true,
};

// --- LIGHTNING VANILLA COLLECT Skills ---
pub static PARATONNERRE: Skill = Skill {
    id: SkillId::PARATONNERRE,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

pub static FISSION_ELEMENTAIRE: Skill = Skill {
    id: SkillId::FISSION_ELEMENTAIRE,

    skill_type: SkillType::COLLECT,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default")
    },
    ignore: true,
};

// --- LIGHTNING VANILLA UNIVERSAL Skills ---
pub static MARCHAND: Skill = Skill {
    id: SkillId::MARCHAND,

    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Universal skill, ignored for fights by default")
    },
    ignore: true,
};

pub static PRETRE: Skill = Skill {
    id: SkillId::PRETRE,

    skill_type: SkillType::UNIVERSAL,
    energy: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Universal skill, ignored for fights by default")
    },
    ignore: true,
};

// --- LIGHTNING ETHER Skills ---
// --- LIGHTNING ETHER Passive Skills ---
pub static SOUTIEN_MORAL: Skill = Skill {
    id: SkillId::SOUTIEN_MORAL,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.1) as u32;
    },
    ignore: false,
};

pub static STIMULATION_CARDIAQUE: Skill = Skill {
    id: SkillId::STIMULATION_CARDIAQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.recovery_multiplier *= 1.2;
    },
    ignore: false,
};

pub static JAUNE: Skill = Skill {
    id: SkillId::JAUNE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
    },
    ignore: false,
};

pub static BATTERIE_SUPPLEMENTAIRE: Skill = Skill {
    id: SkillId::STIMULATION_CARDIAQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        // hp bonus handled in node
        f.time += (15.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
    },
    ignore: false,
};

// pub static EINSTEIN => EINSTEIN, useless

pub static BARRIERE_ELECTRIFIEE: Skill = Skill {
    id: SkillId::BARRIERE_ELECTRIFIEE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.defense[ElementIndex::Air as usize] += 20.0;
    },
    ignore: false,
};

pub static ORACLE: Skill = Skill {
    id: SkillId::ORACLE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        // todo
    },
    ignore: false,
};

pub static FORCE_DE_ZEUS: Skill = Skill {
    id: SkillId::FORCE_DE_ZEUS,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Lightning as usize] += 20;
    },
    ignore: false,
};

pub static REMANENCE_HERTZIENNE: Skill = Skill {
    id: SkillId::REMANENCE_HERTZIENNE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    effect: |f: &mut Fighter, _: &mut Manager| {
        f.assault_dodge_chance *= 1.2;
    },
    ignore: false,
};

// --- LIGHTNING ETHER Active Skills ---
// pub static RECEPTACLE_AERIEN => RECEPTACLE_AERIEN,
// pub static FEU_DE_ST_ELME => FEU_DE_ST_ELME,

// --- LIGHTNING ETHER Event Skills ---
// pub static MORSURE_DU_SOLEIL => MORSURE_DU_SOLEIL,
// pub static CRAMPE_CHRONIQUE => CRAMPE_CHRONIQUE,

// --- LIGHTNING ETHER Special Skills ---

/// Implementations of all fire skills from Vanilla and Ether skill trees
use log::{error, trace};

use crate::fight::manager::{AttackResult, Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- FIRE Skills ---

// --- FIRE VANILLA Skills ---

// --- FIRE VANILLA Passive Skills ---
pub static GRIFFES_ENFLAMMEES: Skill = Skill {
    id: SkillId::GRIFFES_ENFLAMMEES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 7;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static FORCE: Skill = Skill {
    id: SkillId::FORCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 1;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static CHARGE: Skill = Skill {
    id: SkillId::CHARGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.next_assault_bonus += 5;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static SANG_CHAUD: Skill = Skill {
    id: SkillId::SANG_CHAUD,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.time -= (4.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static FURIE: Skill = Skill {
    id: SkillId::FURIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 3;
        for d in f.defense.iter_mut() {
            *d -= 2.0;
        }
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static ARTS_MARTIAUX: Skill = Skill {
    id: SkillId::ARTS_MARTIAUX,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 2;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static VIGILANCE: Skill = Skill {
    id: SkillId::VIGILANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 5.0;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static COEUR_ARDENT: Skill = Skill {
    id: SkillId::COEUR_ARDENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 12;
        // hp bonus handled in node
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static WAIKIKIDO: Skill = Skill {
    id: SkillId::WAIKIKIDO,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.counter_attack_chance *= 1.1;
        // hp bonus handled in node
        f.time += (5.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static AURA_INCANDESCENTE: Skill = Skill {
    id: SkillId::AURA_INCANDESCENTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static VENGEANCE: Skill = Skill {
    id: SkillId::VENGEANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.counter_attack_chance *= 1.05;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static BELIER: Skill = Skill {
    id: SkillId::BELIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.next_assault_bonus += 20;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static CHEF_DE_GUERRE: Skill = Skill {
    id: SkillId::CHEF_DE_GUERRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 2;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.all_assaults_bonus += 2;
            }
        }
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE VANILLA Passive Skills for Quetzus ---
pub static PROPULSION_DIVINE: Skill = Skill {
    id: SkillId::PROPULSION_DIVINE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_per_element[ElementIndex::Fire as usize] *= 0.7;
        // elem change done in node
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE VANILLA Active Skills ---
pub static SOUFFLE_ARDENT: Skill = Skill {
    id: SkillId::SOUFFLE_ARDENT,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static COULEE_DE_LAVE: Skill = Skill {
    id: SkillId::COULEE_DE_LAVE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static SIESTE: Skill = Skill {
    id: SkillId::SIESTE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static KAMIKAZE: Skill = Skill {
    id: SkillId::COULEE_DE_LAVE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static BOULE_DE_FEU: Skill = Skill {
    id: SkillId::COULEE_DE_LAVE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static COMBUSTION: Skill = Skill {
    id: SkillId::COMBUSTION,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static PAUME_CHALUMEAU: Skill = Skill {
    id: SkillId::PAUME_CHALUMEAU,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static METEORES: Skill = Skill {
    id: SkillId::METEORES,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// =--- FIRE VANILLA Event Skills ---
pub static COLERE: Skill = Skill {
    id: SkillId::COLERE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE VANILLA Special Skills ---
pub static TORCHE: Skill = Skill {
    id: SkillId::TORCHE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static SELF_CONTROL: Skill = Skill {
    id: SkillId::SELF_CONTROL,

    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static BRAVE: Skill = Skill {
    id: SkillId::BRAVE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        // hp bonus handled in node
        f.speed_global *= 0.85;
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE VANILLA Special Skills for Quetzus ---
pub static GRIFFES_INFERNALES: Skill = Skill {
    id: SkillId::GRIFFES_INFERNALES,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE VANILLA Collect Skills ---
pub static CHASSEUR_DE_GOUPIGNON: Skill = Skill {
    id: SkillId::CHASSEUR_DE_GOUPIGNON,
    skill_type: SkillType::COLLECT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default");
        AttackResult::TodoSkill
    },
    ignore: true,
};

pub static CHASSEUR_DE_GEANT: Skill = Skill {
    id: SkillId::CHASSEUR_DE_GEANT,

    skill_type: SkillType::COLLECT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default");
        AttackResult::TodoSkill
    },
    ignore: true,
};

pub static CHASSEUR_DE_DRAGON: Skill = Skill {
    id: SkillId::CHASSEUR_DE_DRAGON,

    skill_type: SkillType::COLLECT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Collect skill, ignored for fights by default");
        AttackResult::TodoSkill
    },
    ignore: true,
};

// --- FIRE ETHER Skills ---

// --- FIRE ETHER Passive Skills ---
pub static PROTEINES_DINOZIENNES: Skill = Skill {
    id: SkillId::PROTEINES_DINOZIENNES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.3) as u32;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static ROUGE: Skill = Skill {
    id: SkillId::ROUGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static CARAPACE_DE_MAGMA: Skill = Skill {
    id: SkillId::CARAPACE_DE_MAGMA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 5;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static FIEVRE_BRULANTE: Skill = Skill {
    id: SkillId::FIEVRE_BRULANTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.multi_assault_chance *= 1.3;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static BENEDICTION_DARTEMIS: Skill = Skill {
    id: SkillId::BENEDICTION_DARTEMIS,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        trace!("Benediction d'Artemis is useless in fights");
        AttackResult::TodoSkill
    },
    ignore: true,
};

pub static JOKER: Skill = Skill {
    id: SkillId::JOKER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static ARMURE_DE_FEU: Skill = Skill {
    id: SkillId::ARMURE_DE_FEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 20.0;
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static POING_DE_FEU: Skill = Skill {
    id: SkillId::POING_DE_FEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 20;
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE ETHER Active Skills ---

/// Note: in MT code it is an Event skill but Amazonie, St Elme, Abyss & Ouranos are all active
pub static PAYS_DE_CENDRE: Skill = Skill {
    id: SkillId::PAYS_DE_CENDRE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static CRI_DE_GUERRE: Skill = Skill {
    id: SkillId::CRI_DE_GUERRE,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static EXTENUATION: Skill = Skill {
    id: SkillId::EXTENUATION,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

pub static RECEPTACLE_ROCHEUX: Skill = Skill {
    id: SkillId::RECEPTACLE_ROCHEUX,

    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO // todo
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        AttackResult::TodoSkill
    },
    ignore: false,
};

// --- FIRE ETHER Event Skills ---

pub static PLUMES_DE_PHOENIX: Skill = Skill {
    id: SkillId::PLUMES_DE_PHOENIX,
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

pub static ACCLAMATION_FRATERNELLE: Skill = Skill {
    id: SkillId::ACCLAMATION_FRATERNELLE,

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

// --- FIRE ETHER Special Skills ---
// None

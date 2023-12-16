/// Implementations of all fire skills from Vanilla and Ether skill trees
use log::error;

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
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 7;
        vec![AttackResult::PassiveSkill(SkillId::GRIFFES_ENFLAMMEES)]
    },
    ignore: false,
};

pub static FORCE: Skill = Skill {
    id: SkillId::FORCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 1;
        vec![AttackResult::PassiveSkill(SkillId::FORCE)]
    },
    ignore: false,
};

pub static CHARGE: Skill = Skill {
    id: SkillId::CHARGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.next_assault_bonus += 5;
        vec![AttackResult::PassiveSkill(SkillId::CHARGE)]
    },
    ignore: false,
};

pub static SANG_CHAUD: Skill = Skill {
    id: SkillId::SANG_CHAUD,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.time -= (4.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        vec![AttackResult::PassiveSkill(SkillId::SANG_CHAUD)]
    },
    ignore: false,
};

pub static FURIE: Skill = Skill {
    id: SkillId::FURIE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 3;
        for d in f.defense.iter_mut() {
            *d -= 2.0;
        }
        vec![AttackResult::PassiveSkill(SkillId::FURIE)]
    },
    ignore: false,
};

pub static ARTS_MARTIAUX: Skill = Skill {
    id: SkillId::ARTS_MARTIAUX,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 2;
        vec![AttackResult::PassiveSkill(SkillId::ARTS_MARTIAUX)]
    },
    ignore: false,
};

pub static VIGILANCE: Skill = Skill {
    id: SkillId::VIGILANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 5.0;
        vec![AttackResult::PassiveSkill(SkillId::VIGILANCE)]
    },
    ignore: false,
};

pub static COEUR_ARDENT: Skill = Skill {
    id: SkillId::COEUR_ARDENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 12;
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::COEUR_ARDENT)]
    },
    ignore: false,
};

pub static WAIKIKIDO: Skill = Skill {
    id: SkillId::WAIKIKIDO,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.counter_attack_chance *= 1.1;
        // hp bonus handled in node
        f.time += (5.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        vec![AttackResult::PassiveSkill(SkillId::WAIKIKIDO)]
    },
    ignore: false,
};

pub static AURA_INCANDESCENTE: Skill = Skill {
    id: SkillId::AURA_INCANDESCENTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::AURA_INCANDESCENTE)]
    },
    ignore: false,
};

pub static VENGEANCE: Skill = Skill {
    id: SkillId::VENGEANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.counter_attack_chance *= 1.05;
        vec![AttackResult::PassiveSkill(SkillId::VENGEANCE)]
    },
    ignore: false,
};

pub static BELIER: Skill = Skill {
    id: SkillId::BELIER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.next_assault_bonus += 20;
        vec![AttackResult::PassiveSkill(SkillId::BELIER)]
    },
    ignore: false,
};

pub static CHEF_DE_GUERRE: Skill = Skill {
    id: SkillId::CHEF_DE_GUERRE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, m: &mut Manager| {
        f.all_assaults_bonus += 2;
        for (_, att) in m.fighters_all.iter_mut() {
            if f.side == att.side {
                att.all_assaults_bonus += 2;
            }
        }
        vec![AttackResult::PassiveSkill(SkillId::CHEF_DE_GUERRE)]
    },
    ignore: false,
};

// --- FIRE VANILLA Passive Skills for Quetzus ---
pub static PROPULSION_DIVINE: Skill = Skill {
    id: SkillId::PROPULSION_DIVINE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.speed_per_element[ElementIndex::Fire as usize] *= 0.7;
        // elem change done in node
        vec![AttackResult::PassiveSkill(SkillId::PROPULSION_DIVINE)]
    },
    ignore: false,
};

// --- FIRE VANILLA Active Skills ---
pub static SOUFFLE_ARDENT: Skill = Skill {
    id: SkillId::SOUFFLE_ARDENT,
    skill_type: SkillType::ACTIVE,
    energy: 20,
    priority: 1,
    probability: 10,
    effect: |f: &mut Fighter, m: &mut Manager| {
        m.attack_team(f, f.compute_attack(ElementIndex::Fire, 5))
    },
    ignore: false,
};

pub static COULEE_DE_LAVE: Skill = Skill {
    id: SkillId::COULEE_DE_LAVE,
    skill_type: SkillType::ACTIVE,
    energy: 25,
    priority: 8,
    probability: 5,
    effect: |f: &mut Fighter, m: &mut Manager| {
        m.attack_single_target(f, f.compute_attack(ElementIndex::Fire, 12))
    },
    ignore: false,
};

pub static SIESTE: Skill = Skill {
    id: SkillId::SIESTE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SIESTE)]
    },
    ignore: false,
};

pub static KAMIKAZE: Skill = Skill {
    id: SkillId::KAMIKAZE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::KAMIKAZE)]
    },
    ignore: false,
};

pub static BOULE_DE_FEU: Skill = Skill {
    id: SkillId::BOULE_DE_FEU,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BOULE_DE_FEU)]
    },
    ignore: false,
};

pub static COMBUSTION: Skill = Skill {
    id: SkillId::COMBUSTION,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::COMBUSTION)]
    },
    ignore: false,
};

pub static PAUME_CHALUMEAU: Skill = Skill {
    id: SkillId::PAUME_CHALUMEAU,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::PAUME_CHALUMEAU)]
    },
    ignore: false,
};

pub static METEORES: Skill = Skill {
    id: SkillId::METEORES,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::METEORES)]
    },
    ignore: false,
};

// --- FIRE VANILLA Event Skills ---
pub static COLERE: Skill = Skill {
    id: SkillId::COLERE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::COLERE)]
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
        vec![AttackResult::TodoSkill(SkillId::TORCHE)]
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
        vec![AttackResult::TodoSkill(SkillId::SELF_CONTROL)]
    },
    ignore: false,
};

pub static BRAVE: Skill = Skill {
    id: SkillId::BRAVE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        // hp bonus handled in node
        f.speed_global *= 0.85;
        vec![AttackResult::TodoSkill(SkillId::BRAVE)]
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
        vec![AttackResult::TodoSkill(SkillId::GRIFFES_INFERNALES)]
    },
    ignore: false,
};

// --- FIRE ETHER Skills ---

// --- FIRE ETHER Passive Skills ---
pub static PROTEINES_DINOZIENNES: Skill = Skill {
    id: SkillId::PROTEINES_DINOZIENNES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.max_energy = (f.max_energy as f32 * 1.3) as u32;
        vec![AttackResult::PassiveSkill(SkillId::PROTEINES_DINOZIENNES)]
    },
    ignore: false,
};

pub static ROUGE: Skill = Skill {
    id: SkillId::ROUGE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::PassiveSkill(SkillId::ROUGE)]
    },
    ignore: false,
};

pub static CARAPACE_DE_MAGMA: Skill = Skill {
    id: SkillId::CARAPACE_DE_MAGMA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 5;
        vec![AttackResult::PassiveSkill(SkillId::CARAPACE_DE_MAGMA)]
    },
    ignore: false,
};

pub static FIEVRE_BRULANTE: Skill = Skill {
    id: SkillId::FIEVRE_BRULANTE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.multi_assault_chance *= 1.3;
        vec![AttackResult::PassiveSkill(SkillId::FIEVRE_BRULANTE)]
    },
    ignore: false,
};

pub static JOKER: Skill = Skill {
    id: SkillId::JOKER,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::PassiveSkill(SkillId::JOKER)]
    },
    ignore: false,
};

pub static ARMURE_DE_FEU: Skill = Skill {
    id: SkillId::ARMURE_DE_FEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Wood as usize] += 20.0;
        vec![AttackResult::PassiveSkill(SkillId::ARMURE_DE_FEU)]
    },
    ignore: false,
};

pub static POING_DE_FEU: Skill = Skill {
    id: SkillId::POING_DE_FEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Fire as usize] += 20;
        vec![AttackResult::PassiveSkill(SkillId::POING_DE_FEU)]
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
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::PAYS_DE_CENDRE)]
    },
    ignore: false,
};

pub static CRI_DE_GUERRE: Skill = Skill {
    id: SkillId::CRI_DE_GUERRE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::CRI_DE_GUERRE)]
    },
    ignore: false,
};

pub static EXTENUATION: Skill = Skill {
    id: SkillId::EXTENUATION,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::EXTENUATION)]
    },
    ignore: false,
};

pub static RECEPTACLE_ROCHEUX: Skill = Skill {
    id: SkillId::RECEPTACLE_ROCHEUX,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RECEPTACLE_ROCHEUX)]
    },
    ignore: false,
};

// --- FIRE ETHER Event Skills ---

pub static PLUMES_DE_PHOENIX: Skill = Skill {
    id: SkillId::PLUMES_DE_PHOENIX,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::PLUMES_DE_PHOENIX)]
    },
    ignore: false,
};

pub static ACCLAMATION_FRATERNELLE: Skill = Skill {
    id: SkillId::ACCLAMATION_FRATERNELLE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ACCLAMATION_FRATERNELLE)]
    },
    ignore: false,
};

// --- FIRE ETHER Special Skills ---
// None

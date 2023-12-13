/// Implementations of all water skills from Vanilla and Ether skill trees
use log::{error, trace};

use crate::fight::fighter::{FighterId, FighterType};
use crate::fight::manager::{AttackResult, Manager, TIMECOEF};
use crate::fight::{elements::ElementIndex, fighter::Fighter};

use super::{Skill, SkillId, SkillType};

// --- WATER Skills ---
// --- WATER VANILLA Skills ---

// --- WATER VANILLA Passive Skills ---
pub static PERCEPTION: Skill = Skill {
    id: SkillId::PERCEPTION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 4;
        f.perception = true;
        f.can_touch_intangible = true;
        vec![AttackResult::PassiveSkill(SkillId::PERCEPTION)]
    },
    ignore: false,
};

pub static MUTATION: Skill = Skill {
    id: SkillId::MUTATION,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::MUTATION)]
    },
    ignore: false,
};

pub static KARATE_SOUS_MARIN: Skill = Skill {
    id: SkillId::KARATE_SOUS_MARIN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 10;
        f.skill_elemental_bonus[ElementIndex::Water as usize] += 10;
        vec![AttackResult::PassiveSkill(SkillId::KARATE_SOUS_MARIN)]
    },
    ignore: false,
};

pub static ENTRAINEMENT_SOUS_MARIN: Skill = Skill {
    id: SkillId::ENTRAINEMENT_SOUS_MARIN,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::ENTRAINEMENT_SOUS_MARIN)]
    },
    ignore: false,
};

pub static SUMO: Skill = Skill {
    id: SkillId::SUMO,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::SUMO)]
    },
    ignore: false,
};

pub static ZERO_ABSOLU: Skill = Skill {
    id: SkillId::ZERO_ABSOLU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Fire as usize] += 25.0;
        vec![AttackResult::PassiveSkill(SkillId::ZERO_ABSOLU)]
    },
    ignore: false,
};

pub static ENTRAINEMENT_SOUS_MARIN_AVANCE: Skill = Skill {
    id: SkillId::ENTRAINEMENT_SOUS_MARIN_AVANCE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(
            SkillId::ENTRAINEMENT_SOUS_MARIN_AVANCE,
        )]
    },
    ignore: false,
};

pub static MAITRE_NAGEUR: Skill = Skill {
    id: SkillId::MAITRE_NAGEUR,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // element bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::MAITRE_NAGEUR)]
    },
    ignore: false,
};

// --- WATER Passive Skills for Quetzus ---
pub static ECAILLES_LUMINESCENTES: Skill = Skill {
    id: SkillId::ECAILLES_LUMINESCENTES,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.armor += 2;
        vec![AttackResult::PassiveSkill(SkillId::ECAILLES_LUMINESCENTES)]
    },
    ignore: false,
};

pub static PEAU_DE_SERPENT: Skill = Skill {
    id: SkillId::PEAU_DE_SERPENT,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_dodge_chance *= 1.1;
        f.speed_per_element[ElementIndex::Water as usize] *= 0.85;
        vec![AttackResult::PassiveSkill(SkillId::PEAU_DE_SERPENT)]
    },
    ignore: false,
};

// --- WATER VANILLA Active Skills ---
pub static CANON_A_EAU: Skill = Skill {
    id: SkillId::CANON_A_EAU,
    skill_type: SkillType::ACTIVE,
    energy: 5,
    priority: 1,
    probability: 25,
    effect: |f: &mut Fighter, m: &mut Manager| {
        m.attack_single_target(f, f.compute_attack(ElementIndex::Water, 6))
    },
    ignore: false,
};

pub static GEL: Skill = Skill {
    id: SkillId::GEL,
    skill_type: SkillType::ACTIVE,
    energy: 20,
    priority: 1,
    probability: 10,
    effect: |f: &mut Fighter, m: &mut Manager| {
        let result = m.attack_single_target(f, f.compute_attack(ElementIndex::Water, 5));
        if let Some(attack_result) = result.first() {
            // Apply the slow effect only if the attack was not dodged
            // TODO: check this match should actually be more precise (like only AttackResult::Hit and others apply the effect)
            // i.e whitelist instead of blacklist approach
            match *attack_result {
                AttackResult::SuperDodge(_) => (),
                _ => (), // TODO apply slow status
            }
        } else {
            error!("[Skill GEL]: No target found after processing skill");
        }
        result
    },
    ignore: false,
};

pub static COUP_SOURNOIS: Skill = Skill {
    id: SkillId::COUP_SOURNOIS,
    skill_type: SkillType::ACTIVE,
    energy: 20,
    priority: 3,
    probability: 7,
    effect: |f: &mut Fighter, m: &mut Manager| {
        let mut results: Vec<AttackResult> = vec![];
        let assault_result = m.attack_with_assault(f);
        results.push(assault_result.clone());
        if let AttackResult::Hit(target_id, damage) = assault_result {
            if damage > 0 {
                let mut target = m.fighters_all[&target_id].clone();
                // The effect only works on non-boss fighters and is canceled by perception
                let effect_damage = if target.ftype == FighterType::Boss || target.perception {
                    0
                } else {
                    (target.life as f32 / 2.0) as u32
                };
                results.push(AttackResult::Hit(target_id, effect_damage));
            }
        }
        results
    },
    ignore: false,
};

pub static COUP_FATAL: Skill = Skill {
    id: SkillId::COUP_FATAL,
    skill_type: SkillType::ACTIVE,
    energy: 20,
    priority: 4,
    probability: 2,
    effect: |f: &mut Fighter, m: &mut Manager| {
        let mut results: Vec<AttackResult> = vec![];
        let assault_result = m.attack_with_assault(f);
        results.push(assault_result.clone());
        if let AttackResult::Hit(target_id, damage) = assault_result {
            if damage > 0 {
                let mut target = m.fighters_all[&target_id].clone();
                // The effect only works on non-boss fighters and is canceled by perception
                let effect_damage = if target.ftype == FighterType::Boss || target.perception {
                    0
                } else {
                    target.life
                };
                results.push(AttackResult::Hit(target_id, effect_damage));
            }
        }
        results
    },
    ignore: false,
};

pub static PETRIFICATION: Skill = Skill {
    id: SkillId::PETRIFICATION,
    skill_type: SkillType::ACTIVE,
    energy: 20,
    priority: 1,
    probability: 10,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::PETRIFICATION)]
    },
    ignore: false,
};

pub static RAYON_KAAR_SHER: Skill = Skill {
    id: SkillId::RAYON_KAAR_SHER,

    skill_type: SkillType::ACTIVE,
    energy: 40,
    priority: 1,
    probability: 20,
    effect: |f: &mut Fighter, m: &mut Manager| {
        // TODO breaks mud wall
        m.attack_team(f, f.compute_attack(ElementIndex::Water, 7))
    },
    ignore: false,
};

// --- WATER VANILLA Event Skills ---
pub static DOUCHE_ECOSSAISE: Skill = Skill {
    id: SkillId::DOUCHE_ECOSSAISE,
    skill_type: SkillType::EVENT,
    energy: 20,
    priority: 1,
    probability: 40,
    effect: |f: &mut Fighter, m: &mut Manager| {
        m.attack_team(f, f.compute_attack(ElementIndex::Water, 2))
    },
    ignore: false,
};

pub static MARECAGE: Skill = Skill {
    id: SkillId::MARECAGE,
    skill_type: SkillType::EVENT,
    energy: 20,
    priority: 6,
    probability: 15,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::MARECAGE)]
    },
    ignore: false,
};

pub static CLONE_AQUEUX: Skill = Skill {
    id: SkillId::CLONE_AQUEUX,
    skill_type: SkillType::EVENT,
    energy: 35,
    priority: 8,
    probability: 15,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::CLONE_AQUEUX)]
    },
    ignore: false,
};

// --- WATER VANILLA Special Skills ---
pub static POCHE_VENTRALE: Skill = Skill {
    id: SkillId::POCHE_VENTRALE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // extra item space handled in node;
        vec![AttackResult::PassiveSkill(SkillId::POCHE_VENTRALE)]
    },
    ignore: true,
};

pub static SANS_PITIE: Skill = Skill {
    id: SkillId::SANS_PITIE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SANS_PITIE)]
    },
    ignore: false,
};

pub static GRIFFES_EMPOISONNEES: Skill = Skill {
    id: SkillId::GRIFFES_EMPOISONNEES,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::GRIFFES_EMPOISONNEES)]
    },
    ignore: false,
};

pub static ACUPUNCTURE: Skill = Skill {
    id: SkillId::ACUPUNCTURE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ACUPUNCTURE)]
    },
    ignore: false,
};

pub static SAPEUR: Skill = Skill {
    id: SkillId::SAPEUR,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SAPEUR)]
    },
    ignore: false,
};

pub static SANG_ACIDE: Skill = Skill {
    id: SkillId::SANG_ACIDE,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::SANG_ACIDE)]
    },
    ignore: false,
};

// --- WATER ETHER Skills ---

// --- WATER ETHER Passive Skills ---
pub static RADIATIONS_GAMMA: Skill = Skill {
    id: SkillId::RADIATIONS_GAMMA,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.all_assaults_bonus += 5;
        f.time += (10.0 * TIMECOEF as f32 * f.initiative_global_multiplier) as i32;
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::RADIATIONS_GAMMA)]
    },
    ignore: false,
};

pub static BLEU: Skill = Skill {
    id: SkillId::BLEU,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::PassiveSkill(SkillId::BLEU)]
    },
    ignore: false,
};

pub static MUE_ACQUEUSE: Skill = Skill {
    id: SkillId::MUE_ACQUEUSE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.defense[ElementIndex::Lightning as usize] += 20.0;
        vec![AttackResult::PassiveSkill(SkillId::MUE_ACQUEUSE)]
    },
    ignore: false,
};

pub static CARAPACE_BLINDEE: Skill = Skill {
    id: SkillId::CARAPACE_BLINDEE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.armor += 10;
        f.speed_global *= 1.2;
        vec![AttackResult::PassiveSkill(SkillId::CARAPACE_BLINDEE)]
    },
    ignore: false,
};

pub static TOURBILLON_MAGIQUE: Skill = Skill {
    id: SkillId::TOURBILLON_MAGIQUE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |f: &mut Fighter, _m: &mut Manager| {
        f.assault_elemental_bonus[ElementIndex::Water as usize] += 20;
        vec![AttackResult::PassiveSkill(SkillId::TOURBILLON_MAGIQUE)]
    },
    ignore: false,
};

pub static VITALITE_MARINE: Skill = Skill {
    id: SkillId::VITALITE_MARINE,
    skill_type: SkillType::PASSIVE,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // hp bonus handled in node
        vec![AttackResult::PassiveSkill(SkillId::VITALITE_MARINE)]
    },
    ignore: false,
};

// --- WATER ETHER Active Skills ---
pub static ABYSSE: Skill = Skill {
    id: SkillId::ABYSSE,
    skill_type: SkillType::ACTIVE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::ABYSSE)]
    },
    ignore: false,
};

pub static HYPERVENTILATION: Skill = Skill {
    id: SkillId::HYPERVENTILATION,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::HYPERVENTILATION)]
    },
    ignore: false,
};

pub static RECEPTACLE_TESLA: Skill = Skill {
    id: SkillId::RECEPTACLE_TESLA,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    skill_type: SkillType::ACTIVE,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default active skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::RECEPTACLE_TESLA)]
    },
    ignore: false,
};

// --- WATER ETHER Event Skills ---
pub static DIETE_CHROMATIQUE: Skill = Skill {
    id: SkillId::DIETE_CHROMATIQUE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    skill_type: SkillType::EVENT,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::DIETE_CHROMATIQUE)]
    },
    ignore: false,
};

pub static THERAPIE_DE_GROUPE: Skill = Skill {
    id: SkillId::THERAPIE_DE_GROUPE,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    skill_type: SkillType::EVENT,
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default event skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::THERAPIE_DE_GROUPE)]
    },
    ignore: false,
};

pub static CLEPTOMANE: Skill = Skill {
    id: SkillId::CLEPTOMANE,
    skill_type: SkillType::EVENT,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        vec![AttackResult::TodoSkill(SkillId::CLEPTOMANE)]
    },
    ignore: false,
};

// --- WATER ETHER Special Skills ---
pub static BANNI_DES_DIEUX: Skill = Skill {
    id: SkillId::BANNI_DES_DIEUX,
    skill_type: SkillType::SPECIAL,
    energy: 0,
    priority: 0,    // TODO
    probability: 0, // TODO
    effect: |_f: &mut Fighter, _m: &mut Manager| {
        // todo
        error!("Default special skill implementation! Not yet implemented");
        vec![AttackResult::TodoSkill(SkillId::BANNI_DES_DIEUX)]
    },
    ignore: false,
};

use std::{collections::HashMap, fmt::Display};

use serde::{Deserialize, Serialize};

use super::{
    elements::ElementIndex,
    fighter::{FighterId, FighterShort},
    manager::{AttackResult, TeamSide},
    skills::SkillId,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EffectType {
    Buff,
    Damage,
    Heal,
    Remove,
    Resurrect,
    Summon,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EventType {
    Assault,
    Death,
    End,
    Item,
    Join,
    Skill,
    Status,
    Summon,
}

/// Model that contains the details of a fighter doing an assault
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssaultEvent {
    event_type: EventType,
    attacker_id: FighterId,
    attacker_name: String,
    target_id: FighterId,
    target_name: String,
    element: ElementIndex,
    damage: u32,
}

impl AssaultEvent {
    pub fn new(
        attacker_id: FighterId,
        attacker_name: String,
        target_id: FighterId,
        target_name: String,
        element: ElementIndex,
        damage: u32,
    ) -> Self {
        Self {
            event_type: EventType::Assault,
            attacker_id,
            attacker_name,
            target_id,
            target_name,
            element,
            damage,
        }
    }
}

/// Model that contains the details of the death of one or multiple fighters
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeathEvent {
    event_type: EventType,
    fighter_id: FighterId,
    fighter_name: String,
}

impl DeathEvent {
    pub fn new(fighter_id: FighterId, fighter_name: String) -> Self {
        Self {
            event_type: EventType::Death,
            fighter_id,
            fighter_name,
        }
    }
}

/// Model that contains the details of the end of a fight
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EndOfFightEvent {
    event_type: EventType,
    team: TeamSide,
}

impl EndOfFightEvent {
    pub fn new(team: TeamSide) -> Self {
        Self {
            event_type: EventType::End,
            team,
        }
    }
}

/// Model that contains the details of a fighter using an item
/// TODO
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ItemEvent {}

/// Model that contains the details of a fighter joining the fight
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JoinEvent {
    event_type: EventType,
    fighter_id: FighterId,
    fighter_name: String,
    team: TeamSide,
}

impl JoinEvent {
    pub fn new(fighter_id: FighterId, fighter_name: String, team: TeamSide) -> Self {
        Self {
            event_type: EventType::Join,
            fighter_id,
            fighter_name,
            team,
        }
    }
}

/// Model that contains the details of a fighter using a skill
/// TODO
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillEvent {
    attacker_id: FighterId,
    attacker_name: String,
    skill: SkillId,
    effect: EffectType,
    results: Vec<AttackResult>,
}

impl SkillEvent {
    pub fn new(
        attacker_id: FighterId,
        attacker_name: String,
        skill: SkillId,
        effect: EffectType,
        results: Vec<AttackResult>,
    ) -> Self {
        Self {
            attacker_id,
            attacker_name,
            skill,
            effect,
            results,
        }
    }
}

/// Model that contains the details of a status update for a fighter
/// TODO
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatusEvent {}

/// Model that contains the details of the summon of one or multiple fighters
/// TODO
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SummonEvent {}

/// Wrapper around any kind of event
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FightEvent {
    Assault(AssaultEvent),
    Death(DeathEvent),
    End(EndOfFightEvent),
    Item(ItemEvent),
    Join(JoinEvent),
    Skill(SkillEvent),
    Status(StatusEvent),
    Summon(SummonEvent),
}

/// Model to store the record the fighters and events of a fight
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FightHistory {
    /// List of fighters that appear in the fight: original fighters and summons
    fighters: HashMap<FighterId, FighterShort>,
    /// List of events of the fighter
    events: Vec<FightEvent>,
}

impl Default for FightHistory {
    fn default() -> Self {
        Self::new()
    }
}

impl FightHistory {
    pub fn new() -> Self {
        Self {
            fighters: HashMap::new(),
            events: vec![],
        }
    }

    /// Add to the history the arrival of a new fighter
    pub fn log_new_fighter(&mut self, f: FighterShort) {
        self.events.push(FightEvent::Join(JoinEvent::new(
            f.id,
            f.name.clone(),
            f.side,
        )));
        self.fighters.insert(f.id, f);
    }

    /// Add to the history the details of an assault performed during the fight
    pub fn log_assault(
        &mut self,
        attacker_id: u32,
        attacker_name: String,
        target_id: u32,
        target_name: String,
        element_type: ElementIndex,
        damage: u32,
    ) {
        self.events.push(FightEvent::Assault(AssaultEvent::new(
            attacker_id,
            attacker_name,
            target_id,
            target_name,
            element_type,
            damage,
        )));
    }

    /// Add to the history the details of a skill performed during the fight
    pub fn log_skill(
        &mut self,
        attacker_id: u32,
        attacker_name: String,
        skill_id: SkillId,
        effect_type: EffectType,
        results: Vec<AttackResult>,
    ) {
        self.events.push(FightEvent::Skill(SkillEvent::new(
            attacker_id,
            attacker_name,
            skill_id,
            effect_type,
            results,
        )));
    }

    /// Add to the history the details of the death of a fighter
    pub fn log_death(&mut self, fighter_id: FighterId, fighter_name: String) {
        self.events
            .push(FightEvent::Death(DeathEvent::new(fighter_id, fighter_name)))
    }

    /// Add to the history the details of the end of the fight
    pub fn log_end(&mut self, winning_side: TeamSide) {
        self.events
            .push(FightEvent::End(EndOfFightEvent::new(winning_side)));
    }
}

impl Display for FightHistory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Fight history:")?;
        for e in self.events.clone() {
            match e {
                FightEvent::Assault(assault) => writeln!(
                    f,
                    "{} launches a {} assault on {} and deals {} damage",
                    assault.attacker_name, assault.element, assault.target_name, assault.damage
                )?,
                FightEvent::Death(death) => writeln!(f, "{} is dead!", death.fighter_name)?,
                FightEvent::End(end) => writeln!(f, "{} win!", end.team)?,
                FightEvent::Item(_item) => todo!(),
                FightEvent::Join(join) => writeln!(
                    f,
                    "{} joins the fight on the {}'s team",
                    join.fighter_name, join.team
                )?,
                FightEvent::Skill(skill) => {
                    writeln!(
                        f,
                        "{} uses skill {:?} and results in:",
                        skill.attacker_name, skill.skill
                    )?;
                    for result in skill.results {
                        writeln!(f, "{}", result);
                    }
                }
                FightEvent::Status(_status) => todo!(),
                FightEvent::Summon(_summon) => todo!(),
            }
        }
        Ok(())
    }
}

use std::{collections::HashMap, fmt::Display};

use serde::{Deserialize, Serialize};

use super::{elements::ElementIndex, fighter::FighterShort, manager::TeamSide, skills::SkillId};

type FighterId = u32;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EffectType {
    Buff,
    Damage,
    Heal,
    Remove,
    Resurrect,
    Summon,
}

/// Model that contains the details of a fighter doing an assault
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssaultEvent {
    attacker_id: FighterId,
    target_id: FighterId,
    element_type: ElementIndex,
    damage: u32,
}

/// Model that contains the details of the death of one or multiple fighters
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeathEvent(FighterId);

/// Model that contains the details of the end of a fight
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EndOfFightEvent(TeamSide);

/// Model that contains the details of a fighter using an item
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ItemEvent {}

/// Model that contains the details of a fighter joining the fight
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JoinEvent {
    fighter_id: FighterId,
    team: TeamSide,
}

/// Model that contains the details of a fighter using a skill
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillEvent {
    attacker: FighterId,
    skill: SkillId,
    effect: EffectType,
    targets_results: Vec<(FighterId, u32)>,
}

/// Model that contains the details of a status update for a fighter
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatusEvent {}

/// Model that contains the details of the summon of one or multiple fighters
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
        self.events.push(FightEvent::Join(JoinEvent {
            fighter_id: f.id,
            team: f.side,
        }));
        self.fighters.insert(f.id, f);
    }

    /// Add to the history the details of an assault performed during the fight
    pub fn log_assault(
        &mut self,
        attacker_id: u32,
        target_id: u32,
        element_type: ElementIndex,
        damage: u32,
    ) {
        self.events.push(FightEvent::Assault(AssaultEvent {
            attacker_id,
            target_id,
            element_type,
            damage,
        }));
    }

    /// Add to the history the details of the death of a fighter
    pub fn log_death(&mut self, fighter_id: FighterId) {
        self.events.push(FightEvent::Death(DeathEvent(fighter_id)))
    }

    /// Add to the history the details of the end of the fight
    pub fn log_end(&mut self, winning_side: TeamSide) {
        self.events
            .push(FightEvent::End(EndOfFightEvent(winning_side)));
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
                    self.fighters[&assault.attacker_id].name,
                    self.fighters[&assault.target_id].name,
                    assault.element_type,
                    assault.damage
                )?,
                FightEvent::Death(DeathEvent(fighter_id)) => {
                    writeln!(f, "{} is dead!", self.fighters[&fighter_id].name)?
                }
                FightEvent::End(EndOfFightEvent(team)) => writeln!(f, "{} win!", team)?,
                FightEvent::Item(item) => todo!(),
                FightEvent::Join(join) => writeln!(
                    f,
                    "{} joins the fight on the {}'s team",
                    self.fighters[&join.fighter_id].name, join.team
                )?,
                FightEvent::Skill(skill) => todo!(),
                FightEvent::Status(status) => todo!(),
                FightEvent::Summon(summon) => todo!(),
            }
        }
        Ok(())
    }
}

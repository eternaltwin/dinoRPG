//=====================================================================================================================
// FILE:        fight/manager.rs
// PURPOSE:     Structure to handle and manage the processing of a fight
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

extern crate log;
use log::error;
use log::{debug, info, trace}; // add trace, warn and error as needed
use rand::prelude::*;
use rand::Rng;
use rand_chacha::ChaCha8Rng;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fmt::Display;

use crate::fight::{
    elements::ElementIndex,
    fighter::{Fighter, FighterConfiguration, FighterResult},
};

use super::fighter::FighterShort;
use super::history::EffectType;
use super::history::FightHistory;
use super::skills::Skill;
use super::skills::SkillId;

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const MAX_TURNS: u32 = 1000;
pub const TIMEBASE: i32 = 10; //base time, used to ensure compatibility
pub const TIMECOEF: i32 = 10;

const ATTACK_SCORE_BASE: u32 = 2;
const DEFENSE_SCORE_BASE: u32 = 0;
const ATTACK_GLOBAL_BONUS: f32 = 3.0;
const ATTACK_GLOBAL_FACTOR: f32 = 0.9;
const ASSAULT_POWER_BASE: u32 = 5;

// Constants from MT's code but currently not used
// const PROBA_MULTIPLIER: u32 = 1;
// const INFINITE: u32 = TIMECOEF * 1000 * 1000;
// const CYCLE: u32 = TIMECOEF * 6;

type FighterId = u32;

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum AttackResult {
    Hit(u32),
    Dodge,
    SuperDodge,
    FlewAway,
    Intangible,
    IgnoredSkill,
    UselessSkill,
    PassiveSkill,
    InvalidTarget,
    UnknownSkill,
    TodoSkill,
}

/// Enum to define the sides on the fight
#[derive(Deserialize, Serialize, Debug, Clone, Copy, PartialEq)]
pub enum TeamSide {
    /// Equivalent to true
    Attackers,
    /// Equivalent to false
    Defenders,
}

impl Display for TeamSide {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TeamSide::Attackers => write!(f, "attackers"),
            TeamSide::Defenders => write!(f, "defenders"),
        }
    }
}

impl From<bool> for TeamSide {
    fn from(value: bool) -> Self {
        if value {
            TeamSide::Attackers
        } else {
            TeamSide::Defenders
        }
    }
}

impl From<TeamSide> for bool {
    fn from(value: TeamSide) -> Self {
        match value {
            TeamSide::Attackers => true,
            TeamSide::Defenders => false,
        }
    }
}

/// PURPOSE: Structure to define the result of a fight.
/// PARAMs:  - winner (bool): defines the winner of the fight, true: the attackers won, false: the defenders won
///          - attackers (Vec<FighterResults>): contains the list of the original attackers with id, hp lost and items
///            used
///          - defenders (Vec<FighterResults>): contains the list of the original defenders with id, hp lost and items
///            used
/// NOTE:   This structure needs to be exactly the same as FightProcessResult in core/src/models/fight/FightResult.mts
#[derive(Serialize, Debug, Clone)]
pub struct FightResult {
    // true: attackers won, false: defenders won
    winner: bool,
    seed: u64,
    attackers: Vec<FighterResult>,
    defenders: Vec<FighterResult>,
    history: FightHistory,
}

impl Default for FightResult {
    fn default() -> Self {
        Self {
            winner: TeamSide::Attackers.into(),
            seed: 0,
            attackers: vec![],
            defenders: vec![],
            history: FightHistory::new(),
        }
    }
}

impl FightResult {
    /// Add a new fighter to the list of fighters that participate in the fight
    pub fn log_new_fighter(&mut self, short_fighter: FighterShort) {
        self.history.log_new_fighter(short_fighter);
    }

    /// Add to the history the details of an assault
    pub fn log_assault(
        &mut self,
        attacker: &Fighter,
        target: &Fighter,
        element_type: ElementIndex,
        damage: u32,
    ) {
        self.history.log_assault(
            attacker.id,
            attacker.name.clone(),
            target.id,
            target.name.clone(),
            element_type,
            damage,
        );
    }

    /// Add to the history the details of a skill
    pub fn log_skill(
        &mut self,
        attacker: &Fighter,
        skill_id: SkillId,
        effect: EffectType,
        results: Vec<(Option<FighterId>, AttackResult)>,
    ) {
        self.history.log_skill(
            attacker.id,
            attacker.name.clone(),
            skill_id,
            effect,
            results,
        );
    }

    /// Add to the history the team that won
    pub fn log_end_of_fight(&mut self, winnner: TeamSide) {
        self.history.log_end(winnner);
    }

    /// Add to the history the death of a fighter
    pub fn log_death(&mut self, fighter: &Fighter) {
        self.history.log_death(fighter.id, fighter.name.clone());
    }

    /// Get a clone of the history
    pub fn history(&self) -> FightHistory {
        self.history.clone()
    }
}

/// This structure needs to be exactly the same as FightConfiguration in
///         ed-be/src/models/fight/FightConfiguration.ts
#[derive(Deserialize, Debug, Default)]
#[allow(dead_code)]
pub struct ManagerConfiguration {
    /// Seed of the fight
    seed: Option<u64>,

    /// Flag to control if fighters use/regenerate energy
    is_energy_enabled: bool,
    /// Flag to control if fighters can use equipped objects
    can_use_equipment: bool,
    /// Flag to control if fighters can use permanent equipped objects only
    can_use_permanent_equipment_only: bool,
    /// Flag to control if the fighters can capture others
    can_use_capture: bool,
    /// Flag to control if the equipped objects can be deleted
    can_delete_objects: bool,
    /// Flag to control if the "balance" object can be used
    is_balance_enabled: bool,

    /// List of attackers configuration
    attackers: Vec<FighterConfiguration>,
    /// List of defenders configuration
    defenders: Vec<FighterConfiguration>,
}

/// Model of the manager of the fight: it owns all the entities and processes the whole fight
#[derive(Debug)]
#[allow(dead_code)]
pub struct Manager {
    // Seed and random generator
    seed: u64,
    pub random_generator: ChaCha8Rng,

    // ID Generator
    next_id: u32,

    // Flags
    configuration: ManagerConfiguration,

    // Result
    fight_result: FightResult,

    // Fighter lists
    // IDEA: separate in teams in order to identify team wide effects
    fighters_dead: HashSet<FighterId>,
    fighters_temp_dead: HashSet<FighterId>,
    fighters_escaped: HashSet<FighterId>,
    fighters_alive_attackers: HashSet<FighterId>,
    fighters_alive_defenders: HashSet<FighterId>,
    pub fighters_all: HashMap<FighterId, Fighter>,
    fighters_all_alive_order: Vec<FighterId>,
}

impl Default for Manager {
    fn default() -> Self {
        Self::new()
    }
}

impl Manager {
    // Documented local functions

    /// PURPOSE: Prints the composition of each team
    fn announce_teams(&mut self) {
        let mut temp_fight_result = self.fight_result.clone();
        for (_, f) in self.fighters_all.iter() {
            temp_fight_result.log_new_fighter(f.clone().into());
        }
        self.fight_result = temp_fight_result;
    }

    /// Prepare the teams before starting the fight (passive skills, magic  items and consumable items)
    fn prepare_teams(&mut self) {
        info!("{:?}", self.fighters_all);

        // Get a copy of the keys to extract and place back the fighter and avoid double borrow of Manager
        let keys: Vec<u32> = self.fighters_all.clone().into_keys().collect();

        for i in keys {
            // Pop the fighter out
            let mut f = self.fighters_all.remove(&i).unwrap();

            // TODO apply permanent objects here

            // Prepare skills: apply passive skills, load active skills, events, etc.
            f.prepare_skills(self);

            // TODO apply temporary objects here

            // Increase time by a random amount
            f.time += self.random_generator.gen_range(0..=TIMEBASE) * TIMECOEF;

            // Set energy to the max of the fighter
            f.energy = f.max_energy;

            // Finalize the fighter's skills order
            f.finalize_skills();

            // Place back the fighter
            self.fighters_all.insert(i, f);
        }
        info!("{:?}", self.fighters_all);
    }

    /// PURPOSE: Sort the fighters_all_alive_order vector with the FighterId with the smallest time first, and last has the
    ///          biggest time
    fn sort_all_fighters_by_time_smallest_first(&mut self) {
        // Make a list of all the alive fighters
        let mut new_order: Vec<FighterId> = self.fighters_all_alive_order.clone();

        // Sort that list by time
        new_order.sort_by(|a, b| self.fighters_all[a].time.cmp(&self.fighters_all[b].time));

        // Keeping this as reference to make sure the above sorting works
        // for _i in 0..=_new_order.len() - 2 {
        //     for _j in 0..=_new_order.len() - _i - 2 {
        //         if (self.fighters_all[&_new_order[_j+1]].time < self.fighters_all[&_new_order[_j]].time) {
        //             _new_order.swap(_j, _j+1);
        //         }
        //     }
        // }

        self.fighters_all_alive_order = new_order;
    }

    /// PURPOSE: Pick the target from the opposing side
    /// PARAMS:  - fighter_side (pool): side of the attacker picking a target
    /// RETURN:  Fighter id of the target picked
    fn pick_target(&mut self, fighter_side: TeamSide) -> Fighter {
        // Attackers attack defenders
        let target_id: FighterId = if fighter_side == TeamSide::Attackers {
            let defenders_number = self.fighters_alive_defenders.len();
            let random_number = self.random_generator.gen_range(0..defenders_number);
            *self
                .fighters_alive_defenders
                .iter()
                .nth(random_number)
                .unwrap()
        }
        // Defenders attack attackers
        else {
            let attackers_number = self.fighters_alive_attackers.len();
            let random_number = self.random_generator.gen_range(0..attackers_number);
            *self
                .fighters_alive_attackers
                .iter()
                .nth(random_number)
                .unwrap()
        };

        self.fighters_all[&target_id].clone()
    }

    /// PURPOSE: Returns true if the fight is finished (all attackers dead or all defenders dead) and save the result
    /// PARAMS:  None
    /// RETURN:  Which side is the winner  - true: attackers won, false: defenders won
    fn is_fight_finished(&mut self) -> bool {
        let mut result: bool = true;
        let mut all_defenders_dead: bool = true;
        let mut all_attackers_dead: bool = true;
        for (_, f) in self.fighters_all.iter() {
            if f.life > 0 {
                // That means an attacker is still alive
                if f.side == TeamSide::Attackers {
                    all_attackers_dead = false;
                }
                // That means a defender is still alive
                else {
                    all_defenders_dead = false;
                }
                // Break early if both side still have a fighter alive
                // todo may be ignore summons here
                if !all_attackers_dead && !all_defenders_dead {
                    result = false;
                    break;
                }
            }
        }

        // All defenders are dead, meaning the attackers won.
        if all_defenders_dead {
            self.fight_result.log_end_of_fight(TeamSide::Attackers);
            self.fight_result.winner = TeamSide::Attackers.into();
        }
        // Else, meaning the attackers lost.
        else if all_attackers_dead {
            self.fight_result.log_end_of_fight(TeamSide::Defenders);
            self.fight_result.winner = TeamSide::Defenders.into();
        }
        // TODO check that there may be another case (not all died, so a tie?)

        result
    }

    /// PURPOSE: Calculate the attack to a target
    ///          For an assault, the attack score is:
    ///          BASE_ATTACK + 5 * attacker current element value + attacker assault bonus + attacker next assault bonus
    ///          then * attacker assault multiplier * attacker next assault multiplier
    ///          The defense score is:
    ///          BASE_DEFENSE + target defense value * (5 * attacker current element value) + target armor
    /// PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
    ///          - target (&mut Fighter): mutable pointer of the target
    ///          - attack_power: array of the power effect of each element engaged in the attack
    ///            (0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
    ///          - is_assault: specifies if the attack if an assault, if not it is a skill. This changes the bonuses involved in the calculation.
    /// RETURN:  The number of hp lost by the target
    pub fn attack_target(
        &mut self,
        attacker: &mut Fighter,
        target: &mut Fighter,
        attack_power: [u32; 6],
        is_assault: bool,
    ) -> AttackResult {
        let mut attack_score: u32 = ATTACK_SCORE_BASE;
        let mut defense_score: u32 = DEFENSE_SCORE_BASE;
        let mut sum_power: u32 = 0;

        for i in 0..=5 {
            let temp_power = attack_power[i];
            attack_score += temp_power;
            sum_power += temp_power;

            if temp_power > 0 {
                // Add the element defense from the target to the defense score for the corresponding elements of the attack
                defense_score += target.defense[i].ceil() as u32 * temp_power;
                // Add the corresponding element bonus to the attack
                if is_assault {
                    debug!(
                        "[Manager:attack_target] Assault element ({:}) bonus: {:}",
                        i, attacker.assault_elemental_bonus[i]
                    );
                    attack_score += attacker.assault_elemental_bonus[i];
                } else {
                    debug!(
                        "[Manager:attack_target] Skill element ({:}) bonus: {:}",
                        i, attacker.skill_elemental_bonus[i]
                    );
                    attack_score += attacker.skill_elemental_bonus[i];
                }
            }
        }

        // Apply global bonuses and multipliers to assaults
        if is_assault {
            debug!("[Manager:attack_target] Assault bonuses: all {:}, next {:}, all multiplier {:}, next multiplier {:}",
                attacker.all_assaults_bonus, attacker.next_assault_bonus, attacker.all_assault_multiplier, attacker.next_assault_multiplier);
            attack_score += attacker.all_assaults_bonus + attacker.next_assault_bonus;
            attack_score = (attack_score as f32
                * attacker.all_assault_multiplier
                * attacker.next_assault_multiplier)
                .round() as u32;
            // Reset the next assault bonus and multiplier
            attacker.next_assault_bonus = 0;
            attacker.next_assault_multiplier = 1.0;
        }

        // if multi-elements attack, defends with average, not sum
        // TODO improve this comment
        // TODO check for multi element attack defense
        if sum_power > 0 {
            defense_score /= sum_power;
        }

        // TODO check if attacker ignores armor
        defense_score += target.armor;
        debug!(
            "[Manager:attack_target] Defense breakdown: armor: {:}, defenses {:?}",
            target.armor, target.defense
        );
        debug!("[Manager:attack_target] Defense score: {:}", defense_score);

        // Generate float between 0 and 1
        let random = self.random_generator.gen_range(0.0..=1.0);
        // Up to one third bonus
        let attack_random_bonus = random * attack_score as f32 / ATTACK_GLOBAL_BONUS;

        // Final attack score
        debug!("[Manager:attack_target] Attack breakdown: power{:?}, attack score {:}, random bonus {:}, global factor {:}",
            attack_power, attack_score, attack_random_bonus, ATTACK_GLOBAL_FACTOR);
        attack_score =
            ((attack_random_bonus + attack_score as f32) * ATTACK_GLOBAL_FACTOR).round() as u32;
        debug!("[Manager:attack_target] Attack score: {:}", attack_score);

        // Get first attack score
        let mut damage_score = attack_score as i32 - defense_score as i32;
        debug!(
            "[Manager:attack_target] Intermediate damage score: {:} - {:} = {:}",
            attack_score, defense_score, damage_score
        );

        // Apply attacker minimum damage
        if damage_score < attacker.minimum_damage as i32 {
            damage_score = attacker.minimum_damage as i32;
        }
        if damage_score < attacker.minimum_assault_damage as i32 {
            damage_score = attacker.minimum_assault_damage as i32;
        }
        debug!(
            "[Manager:attack_target] Applied minimum damage ({:} , {:}): damage score {:}",
            attacker.minimum_damage, attacker.minimum_assault_damage, damage_score
        );

        // TODO much more to check here (dodge, etc)
        let hp_lost = damage_score as u32;

        if target.life < hp_lost {
            target.life = 0;
        } else {
            target.life -= hp_lost;
        }
        debug!(
            "[Manager:attack_single_with_skill] {:} loses {:} life points, only {:} left",
            target.id, hp_lost, target.life
        );

        // If the target is dead, add it to the dead list, remove it from the list of alive fighters and remove it from its team.
        if target.life == 0 {
            self.fight_result.log_death(&target);
            self.fighters_dead.insert(target.id);
            self.fighters_all_alive_order.retain(|id| *id != target.id);
            if target.original_side == TeamSide::Attackers {
                self.fighters_alive_attackers.remove(&target.id);
            } else {
                self.fighters_alive_defenders.remove(&target.id);
            }
        }

        // Save the new state of the target
        // SAFETY: it should be safe to unwrap because target is valid
        *self.fighters_all.get_mut(&target.id).unwrap() = target.clone();

        AttackResult::Hit(hp_lost)
    }

    /// Method to inflict a fixed amount of damage to a target
    pub fn attack_target_with_fixed_damage(
        &mut self,
        target: &mut Fighter,
        damage: u32,
    ) -> AttackResult {
        if target.life < damage {
            target.life = 0;
        } else {
            target.life -= damage;
        }
        debug!(
            "[Manager:attack_single_with_skill] {:} loses {:} life points, only {:} left",
            target.id, damage, target.life
        );

        // If the target is dead, add it to the dead list, remove it from the list of alive fighters and remove it from its team.
        if target.life == 0 {
            self.fight_result.log_death(&target);
            self.fighters_dead.insert(target.id);
            self.fighters_all_alive_order.retain(|id| *id != target.id);
            if target.original_side == TeamSide::Attackers {
                self.fighters_alive_attackers.remove(&target.id);
            } else {
                self.fighters_alive_defenders.remove(&target.id);
            }
        }

        // Save the new state of the target
        // SAFETY: it should be safe to unwrap because target is valid
        *self.fighters_all.get_mut(&target.id).unwrap() = target.clone();

        AttackResult::Hit(damage)
    }

    /// Method to process an attack with a given attack power on a single target
    pub fn attack_single_target(
        &mut self,
        attacker: &mut Fighter,
        attack_power: [u32; 6],
    ) -> Vec<(Option<FighterId>, AttackResult)> {
        let mut target = self.pick_target(attacker.side);
        debug!(
            "[Manager:attack_single_with_skill] Target is {:}",
            target.id
        );

        let attack_result = self.attack_target(attacker, &mut target, attack_power, false);
        debug!(
            "[Manager:attack_single_with_skill] {:} used skill of power {:?} on {:} and did {:?}",
            attacker.name, attack_power, target.name, attack_result
        );
        vec![(Some(target.id), attack_result)]
    }

    // Method to process an attack with a given attack power to a whole team
    pub fn attack_team(
        &mut self,
        attacker: &mut Fighter,
        attack_power: [u32; 6],
    ) -> Vec<(Option<FighterId>, AttackResult)> {
        let mut results: Vec<(Option<FighterId>, AttackResult)> = vec![];

        // Get the IDs of all the opposing fighters
        let targets = if attacker.side == TeamSide::Attackers {
            self.fighters_alive_defenders
        } else {
            self.fighters_alive_attackers
        };

        // For each target, process the attack and append the result to the vector of results
        for t in targets {
            let temp_result = if let Some(target) = self.fighters_all.get_mut(&t) {
                self.attack_target(attacker, target, attack_power, false)
            } else {
                error!(
                    "[Manager:attack_single_with_skill] Target (ID: {}) is invalid",
                    t
                );
                AttackResult::InvalidTarget
            };
            results.push((Some(t), temp_result));
        }

        results
    }

    /// PURPOSE: Handle an assault
    /// PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
    ///          - target (&mut Fighter): mutable pointer of the target
    pub fn attack_with_assault(
        &mut self,
        attacker: &mut Fighter,
    ) -> (Option<FighterId>, AttackResult) {
        // TODO check if the dinoz can attack flying or intangible

        let mut target = self.pick_target(attacker.side);
        debug!("[Manager:attack_with_assault] Target is {:}", target.id);

        let current_element_index: ElementIndex = attacker.get_current_element_index(false);
        let assault_power: [u32; 6] =
            attacker.compute_attack(current_element_index, ASSAULT_POWER_BASE);
        debug!(
            "[Manager:attack_with_assault] Assault power is {:?}",
            assault_power
        );

        let assault_result = self.attack_target(attacker, &mut target, assault_power, true);

        if let AttackResult::Hit(hp_lost) = assault_result {
            debug!(
                "[Manager:attack_with_assault] {:} loses {:} life points, only {:} left",
                target.id, hp_lost, target.life
            );
            self.fight_result
                .log_assault(attacker, &target, current_element_index, hp_lost);
        } else {
            debug!(
                "[Manager:attack_with_assault] assault failed {:?}",
                assault_result
            );
        }
        (Some(target.id), assault_result)
    }

    fn process_active_skill(
        &mut self,
        attacker: &mut Fighter,
        skill: Skill,
    ) -> Vec<(Option<FighterId>, AttackResult)> {
        info!("Processing skill {:?}", skill);
        let result = skill.process_skill(attacker, self);
        self.fight_result
            .log_skill(attacker, skill.id(), EffectType::Damage, result);
        result
    }

    /// Handle a fighter's turn
    fn process_turn(&mut self, fighter: &mut Fighter) {
        debug!("[Manager:process_turn] It's {:}'s turn", fighter.id);

        // TODO check if the fighter uses an event skill

        // if let Some(event) = f.get_event() {
        //     process_event(f, event);
        // }

        // TODO check if the fighter uses an active skill if not it uses an assaults
        let skill = self.pick_random_active_skill(fighter);

        // if assault or targetted skill:
        if let Some(skill) = skill {
            self.process_active_skill(fighter, skill);
        } else {
            self.attack_with_assault(fighter);
        }
    }

    /// Process the end of the fight: calculate the hp_lost for each original participants and add that to the result
    fn process_end_of_fight(&mut self) {
        let old_config_attackers = self.configuration.attackers.clone();
        let old_config_defenders = self.configuration.defenders.clone();
        let all_fighters = self.fighters_all.clone();

        // TODO they could be created at the init step instead of now
        for (_, fighter) in all_fighters.iter() {
            debug!("Fighter id: {:}", fighter.dinoz_id);
            for attacker in old_config_attackers.iter() {
                if fighter.dinoz_id == attacker.dinoz_id {
                    debug!("{:} is an attacker", fighter.dinoz_id);
                    let mut hp_lost: u32 = 0;
                    if attacker.start_life > fighter.life {
                        hp_lost = attacker.start_life - fighter.life
                    }
                    self.fight_result.attackers.push(FighterResult::new(
                        fighter.dinoz_id,
                        hp_lost,
                        Vec::new(),
                    ));
                }
            }
            for defender in old_config_defenders.iter() {
                if fighter.dinoz_id == defender.dinoz_id {
                    debug!("{:} is a defender", fighter.dinoz_id);
                    let mut hp_lost: u32 = 0;
                    if defender.start_life > fighter.life {
                        hp_lost = defender.start_life - fighter.life
                    }
                    self.fight_result.defenders.push(FighterResult::new(
                        fighter.dinoz_id,
                        hp_lost,
                        Vec::new(),
                    ));
                }
            }
        }
    }

    /// Pick a random active for the given fighter from its pool of active skills
    ///
    /// This method is in the manager because it uses the random generator
    fn pick_random_active_skill(&mut self, f: &Fighter) -> Option<Skill> {
        for s in &f.active_skills {
            // If the fighter does not have enough energy for the skill, it is passed
            if s.energy() > f.energy {
                continue;
            }
            // Pick the first skill from the probability
            if self.random_generator.gen_range(0..=100) < s.probability() {
                return Some(*s);
            }
        }
        None
    }

    /// Pick a random active for the given fighter from its pool of event skills
    ///
    /// This method is in the manager because it uses the random generator
    fn pick_random_event_skill(&mut self, f: &Fighter) -> Option<Skill> {
        for s in &f.event_skills {
            // If the fighter does not have enough energy for the skill, it is passed
            if s.energy() > f.energy {
                continue;
            }
            // Pick the first skill from the probability
            if self.random_generator.gen_range(0..=100) < s.probability() {
                return Some(*s);
            }
        }
        None
    }

    // Un-used & non-documented local functions

    // Documented exported functions

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Create a new Manager with default values. Prefer using "from_config" instead
    // PARAMS:  None
    // RETURN:  The newly created manager
    //---------------------------------------------------------------------------------------------------------------------
    pub fn new() -> Self {
        // Initiliaze the random generator and save the seed
        let temp_seed: u64 = thread_rng().next_u64();
        let temp_rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(temp_seed);
        let temp_result = FightResult {
            seed: temp_seed,
            ..FightResult::default()
        };
        Self {
            // ID Generator
            next_id: 0,

            // Seed and random generator
            seed: temp_seed,
            random_generator: temp_rng,

            // Configuration
            configuration: ManagerConfiguration::default(),

            // Result
            fight_result: temp_result,

            // Fighter lists
            fighters_dead: HashSet::new(),
            fighters_temp_dead: HashSet::new(),
            fighters_escaped: HashSet::new(),
            fighters_alive_attackers: HashSet::new(),
            fighters_alive_defenders: HashSet::new(),
            fighters_all: HashMap::new(),
            fighters_all_alive_order: Vec::new(),
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Create a new Manager from a configuration
    // PARAMS:  - config: Initial configuration of the manager
    // RETURN:  The newly created manager
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_configuration(config: ManagerConfiguration) -> Self {
        let mut all: HashMap<FighterId, Fighter> = HashMap::new();
        let mut all_order: Vec<FighterId> = Vec::new();
        let mut attackers: HashSet<FighterId> = HashSet::new();
        let mut defenders: HashSet<FighterId> = HashSet::new();
        let mut id: u32 = 0;

        for a in config.attackers.iter() {
            let f: Fighter = Fighter::from_config(a, id, TeamSide::Attackers);
            info!("New attacker {:?}", f);
            attackers.insert(f.id);
            all.insert(f.id, f.clone());
            all_order.push(f.id);
            id += 1;
        }
        for d in config.defenders.iter() {
            let f: Fighter = Fighter::from_config(d, id, TeamSide::Defenders);
            info!("New defender {:?}", f);
            defenders.insert(f.id);
            all.insert(f.id, f.clone());
            all_order.push(f.id);
            id += 1;
        }

        // Initialize the random generator and save the seed

        let mut temp_result = FightResult::default();
        let temp_seed = if config.seed.is_some() {
            config.seed.unwrap()
        } else {
            thread_rng().next_u64()
        };
        let temp_rng: ChaCha8Rng = ChaCha8Rng::seed_from_u64(temp_seed);
        temp_result.seed = temp_seed;

        Self {
            // ID Generator
            next_id: id,

            // Seed and random generator
            seed: temp_seed,
            random_generator: temp_rng,

            //Flags
            configuration: config,

            // Result
            fight_result: temp_result,

            // Fighter lists
            fighters_dead: HashSet::new(),
            fighters_temp_dead: HashSet::new(),
            fighters_escaped: HashSet::new(),
            fighters_alive_attackers: attackers,
            fighters_alive_defenders: defenders,
            fighters_all: all,
            fighters_all_alive_order: all_order,
        }
    }

    // pub fn get_team_by_side(self, side: bool) -> HashSet<FighterId> {
    //     if (side) {
    //         return self.fighters_alive_attackers;
    //     }
    //     else {
    //         return self.fighters_alive_defenders;
    //     }
    // }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Process the fight
    // PARAMS:  None
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    pub fn execute_fight(&mut self) {
        // let mut current_time: u32 = 0;

        self.announce_teams();

        info!("--- Prepare fight ---");

        self.prepare_teams();

        // Sort fighters by time
        self.sort_all_fighters_by_time_smallest_first();
        // Get smallest time (which can be negative) then remove it from all fighters to make sure on a 0-based time
        // Example: a fighter has an initiative boost to start first, that's a base time of -5.
        // By removing 5 from every fighter, the one with the initiative boost will be at 0 and the others at 5
        let _t0 = self.fighters_all[&self.fighters_all_alive_order[0]].time;
        for f in self.fighters_all.values_mut() {
            f.time -= _t0;
        }

        info!("--- Preparation done ---");

        // Process only if there are both attackers and defenders
        if !self.fighters_alive_attackers.is_empty() && !self.fighters_alive_defenders.is_empty() {
            info!("--- Fight start ---");

            // To protect dev of infinite loops
            for i in 0..=MAX_TURNS {
                debug!("-- BEGINNING OF TURN {:} --", i);

                // Pick first alive fighter
                self.sort_all_fighters_by_time_smallest_first();
                // SAFETY: it should be safe to unwrap here because there are at least 2 fighters (one attacker, one defender) still in play
                let mut current_fighter: Fighter =
                    self.fighters_all[self.fighters_all_alive_order.first().unwrap()].clone();

                // Process its turn
                self.process_turn(&mut current_fighter);

                // Increase time
                // TODO not final
                let mut _dt: u32 = (TIMEBASE as f32
                    * TIMECOEF as f32
                    * current_fighter.speed_global
                    * current_fighter.speed_per_element
                        [current_fighter.get_current_element_index(false) as usize])
                    .floor() as u32;
                current_fighter.time += _dt as i32;
                trace!(
                    "Fighter {:} new time is {:}",
                    current_fighter.id,
                    current_fighter.time
                );

                // Increment the element of the fighter
                current_fighter.increment_current_element_index();

                // Update the fighter that just did its turn
                // SAFETY: it is safe to unwrap here because there are at least 2 fighters (one attacker, one defender) still in play
                *self
                    .fighters_all
                    .get_mut(self.fighters_all_alive_order.first().unwrap())
                    .unwrap() = current_fighter;

                debug!("-- END OF TURN {:} --", i);

                if self.is_fight_finished() {
                    break;
                }
            }

            info!("--- Fight end ---");
        }

        info!("--- Collecting fight information ---");
        self.process_end_of_fight();
        info!("--- Fight information collected ---");

        let json = serde_json::to_string(&self.fight_result).unwrap();

        debug!("Result:\n{}", json);
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Get the result of the fight
    // PARAMS:  None
    // RETURN:  The result of the fight
    //---------------------------------------------------------------------------------------------------------------------
    pub fn get_fight_result(&self) -> FightResult {
        self.fight_result.clone()
    }

    // Un-used & non-documented exported functions
}

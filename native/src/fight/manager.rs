//=====================================================================================================================
// FILE:        fight/manager.rs
// PURPOSE:     Structure to handle and manage the processing of a fight
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

extern crate log;
use log::{debug, info}; // add trace, warn and error as needed
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

type FighterId = usize;

/// Enum to define the sides on the fight
#[derive(Serialize, Debug, Clone, Copy, PartialEq)]
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

impl TeamSide {
    pub fn to_boolean(&self) -> bool {
        match self {
            TeamSide::Attackers => true,
            TeamSide::Defenders => false,
        }
    }
}
//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Structure to define the result of a fight.
// PARAMs:  - winner (bool): defines the winner of the fight, true: the attackers won, false: the defenders won
//          - attackers (Vec<FighterResults>): contains the list of the original attackers with id, hp lost and items
//            used
//          - defenders (Vec<FighterResults>): contains the list of the original defenders with id, hp lost and items
//            used
// NOTEs:   This structure needs to be exactly the same as FightProcessResult in ed-be/src/models/fight/FightResult.ts
//---------------------------------------------------------------------------------------------------------------------
#[derive(Serialize, Debug, Clone)]
pub struct FightResult {
    // true: attackers won, false: defenders won
    winner: bool,
    seed: u64,
    attackers: Vec<FighterResult>,
    defenders: Vec<FighterResult>,
    history: String,
}

impl Default for FightResult {
    fn default() -> Self {
        Self {
            winner: TeamSide::Attackers.to_boolean(),
            seed: 0,
            attackers: vec![],
            defenders: vec![],
            history: String::new(),
        }
    }
}

impl FightResult {
    /// Appends a string to the history
    pub fn append_to_history(&mut self, action: &str) {
        self.history.push_str(format!("- {}\n", action).as_str());
    }

    pub fn history(&self) -> String {
        self.history.clone()
    }
}

/// This structure needs to be exactly the same as FightConfiguration in
///         ed-be/src/models/fight/FightConfiguration.ts
#[derive(Deserialize, Debug, Default)]
#[allow(dead_code)]
pub struct ManagerConfiguration {
    // Seed (optional)
    seed: Option<u64>,

    // Flags
    is_energy_enabled: bool,
    can_use_equipment: bool,
    can_use_permanent_equipment_only: bool,
    can_use_capture: bool,
    can_delete_objects: bool,
    is_balance_enabled: bool,

    // Fighters
    attackers: Vec<FighterConfiguration>,
    defenders: Vec<FighterConfiguration>,
}

// This structure defines the manager of the fight: it owns all the entities and processes the whole fight
#[derive(Debug)]
#[allow(dead_code)]
pub struct Manager {
    // Seed and random generator
    seed: u64,
    pub random_generator: ChaCha8Rng,

    // ID Generator
    next_id: usize,

    // Flags
    configuration: ManagerConfiguration,

    // Result
    fight_result: FightResult,

    // Fighter lists
    // IDEA: separate in teams in order to identify team wide effects
    fighters_dead: HashSet<FighterId>,
    fighters_temp_dead: HashSet<FighterId>,
    fighters_escaped: HashSet<FighterId>,
    fighters_attackers: HashSet<FighterId>,
    fighters_defenders: HashSet<FighterId>,
    pub fighters_all: HashMap<FighterId, Fighter>,
    fighters_all_order: Vec<FighterId>,
}

impl Default for Manager {
    fn default() -> Self {
        Self::new()
    }
}

impl Manager {
    // Documented local functions

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Prints the composition of each team
    // PARAMS:  None
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    fn announce_teams(&mut self) {
        let mut temp_fight_result = self.fight_result.clone();
        for (_, f) in self.fighters_all.iter() {
            let msg = format!("{} joins the fight on the {}'s team", f.name, f.side);
            debug!("{}", msg);
            temp_fight_result.append_to_history(msg.as_str());
        }
        self.fight_result = temp_fight_result;
    }

    /// Prepare the teams before starting the fight (passive skills, magic  items and consumable items)
    fn prepare_teams(&mut self) {
        info!("{:?}", self.fighters_all);

        // Get a copy of the keys to extract and place back the fighter and avoid double borrow of Manager
        let keys: Vec<usize> = self.fighters_all.clone().into_keys().collect();

        for i in keys {
            // Pop the fighter out
            let mut f = self.fighters_all.remove(&i).unwrap();

            // TODO apply permanent objects here

            // Apply passive skills
            f.process_passive_skills(self);

            // TODO apply temporary objects here

            // Increase time by a random amount
            f.time += self.random_generator.gen_range(0..=TIMEBASE) * TIMECOEF;

            // Place back the fighter
            self.fighters_all.insert(i, f);
        }
        info!("{:?}", self.fighters_all);
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Sort the fighters_all_order vector with the FighterId with the smallest time first, and last has the
    //          biggest time
    // PARAMS:  None
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    fn sort_all_fighters_by_time_smallest_first(&mut self) {
        let mut _new_order: Vec<FighterId> = self.fighters_all_order.clone();

        _new_order.sort_by(|a, b| self.fighters_all[a].time.cmp(&self.fighters_all[b].time));

        // Keeping this as reference to make sure the above sorting works
        // for _i in 0..=_new_order.len() - 2 {
        //     for _j in 0..=_new_order.len() - _i - 2 {
        //         if (self.fighters_all[&_new_order[_j+1]].time < self.fighters_all[&_new_order[_j]].time) {
        //             _new_order.swap(_j, _j+1);
        //         }
        //     }
        // }

        self.fighters_all_order = _new_order;
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Pick the target from the opposing side
    // PARAMS:  - fighter_side (pool): side of the attacker picking a target
    // RETURN:  Fighter id of the target picked
    //---------------------------------------------------------------------------------------------------------------------
    fn pick_target(&mut self, fighter_side: TeamSide) -> FighterId {
        // Attackers attack defenders
        let target_id: FighterId = if fighter_side == TeamSide::Attackers {
            let defenders_number = self.fighters_defenders.len();
            let random_number = self.random_generator.gen_range(0..defenders_number);
            *self.fighters_defenders.iter().nth(random_number).unwrap()
        }
        // Defenders attack attackers
        else {
            let attackers_number = self.fighters_attackers.len();
            let random_number = self.random_generator.gen_range(0..attackers_number);
            *self.fighters_attackers.iter().nth(random_number).unwrap()
        };

        target_id
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Returns true if the fight is finished (all attackers dead or all defenders dead) and save the result
    // PARAMS:  None
    // RETURN:  Which side is the winner  - true: attackers won, false: defenders won
    //---------------------------------------------------------------------------------------------------------------------
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
            self.fight_result.winner = TeamSide::Attackers.to_boolean();
            self.fight_result.append_to_history("Attackers win!");
        }
        // Else, meaning the attackers lost.
        else if all_attackers_dead {
            self.fight_result.winner = TeamSide::Defenders.to_boolean();

            self.fight_result.append_to_history("Defenders win!");
        }
        // TODO check that there may be another case (not all died, so a tie?)

        result
    }

    //---------------------------------------------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Calculate the attack to a target
    //          For an assault, the attack score is:
    //          BASE_ATTACK + 5 * attacker current element value + attacker assault bonus + attacker next assault bonus
    //          then * attacker assault multiplier * attacker next assault multiplier
    //          The defense score is:
    //          BASE_DEFENSE + target defense value * (5 * attacker current element value) + target armor
    // PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
    //          - target (&mut Fighter): mutable pointer of the target
    //          - attack_power: array of the power effect of each element engaged in the attack
    //            (0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
    //          - is_assault: specifies if the attack if an assault, if not it is a skill. This changes the bonuses involved in the calculation.
    // RETURN:  The number of hp lost by the target
    //---------------------------------------------------------------------------------------------------------------------
    fn attack_target(
        &mut self,
        attacker: &mut Fighter,
        target: &mut Fighter,
        attack_power: [u32; 6],
        is_assault: bool,
    ) -> u32 {
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
            defense_score = defense_score / sum_power;
        }

        // TODO check if attacker ignores armor
        defense_score += target.armor;
        debug!(
            "[Manager:attack_target] Defense breakdown: armor: {:}, defenses {:?}",
            target.armor, target.defense
        );
        debug!("[Manager:attack_target] Defense score: {:}", defense_score);

        // Generate float between 0 and 1
        let random: f32 = self.random_generator.gen_range(0.0..=1.0);
        // Up to one third bonus
        let attack_random_bonus = random * attack_score as f32 / ATTACK_GLOBAL_BONUS;

        // Final attack score
        debug!("[Manager:attack_target] Attack breakdown: power{:?}, attack score {:}, random bonus {:}, global factor {:}",
            attack_power, attack_score, attack_random_bonus, ATTACK_GLOBAL_FACTOR);
        attack_score =
            ((attack_random_bonus + attack_score as f32) * ATTACK_GLOBAL_FACTOR).round() as u32;
        debug!("[Manager:attack_target] Attack score: {:}", attack_score);

        // Get first attack score
        let mut damage_score: i32 = attack_score as i32 - defense_score as i32;
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
        let hp_lost: u32 = damage_score as u32;

        hp_lost
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Handle an assault
    // PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
    //          - target (&mut Fighter): mutable pointer of the target
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    fn process_assault(&mut self, attacker: &mut Fighter, target: &mut Fighter) {
        debug!(
            "[Manager:process_assault] {:} launches an assault on {:}",
            attacker.id, target.id
        );

        let current_element_index: ElementIndex = attacker.get_current_element_index(false);
        let assault_power: [u32; 6] =
            attacker.compute_attack(current_element_index, ASSAULT_POWER_BASE);
        debug!(
            "[Manager:process_assault] Assault power is {:?}",
            assault_power
        );

        let hp_lost: u32 = self.attack_target(attacker, target, assault_power, true);
        if target.life < hp_lost {
            target.life = 0;
        } else {
            target.life -= hp_lost;
        }
        debug!(
            "[Manager:process_assault] {:} loses {:} life points, only {:} left",
            target.id, hp_lost, target.life
        );
        self.fight_result.append_to_history(
            format!(
                "{} launches a {} assault on {} and deals {} damage",
                attacker.name, current_element_index, target.name, hp_lost
            )
            .as_str(),
        );
        if target.life == 0 {
            self.fight_result
                .append_to_history(format!("{} is dead!", target.name).as_str());
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Handle a fighter's turn
    // PARAMS:  A mutable pointer of the fighter whose turn it is
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    fn process_turn(&mut self, fighter: &mut Fighter) {
        debug!("[Manager:process_turn] It's {:}'s turn", fighter.id);

        let _target_id: FighterId = self.pick_target(fighter.side);
        debug!("[Manager:process_turn] Its target is {:}", _target_id);

        let mut _target_new: Fighter = self.fighters_all[&_target_id].clone();
        self.process_assault(fighter, &mut _target_new);

        // Save the new state of the target
        *self.fighters_all.get_mut(&_target_id).unwrap() = _target_new;
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Process the end of the fight: calculate the hp_lost for each original participants and add that to the
    //          result
    // PARAMS:  None
    // RETURN:  None
    //---------------------------------------------------------------------------------------------------------------------
    fn process_end_of_fight(&mut self) {
        let old_config_attackers = self.configuration.attackers.clone();
        let old_config_defenders = self.configuration.defenders.clone();
        let all_fighters = self.fighters_all.clone();

        // TODO they could be created at the init step instead of now
        for (_, fighter) in all_fighters.iter() {
            debug!("Fighter id: {:}", fighter.dinoz_id);
            for _attacker in old_config_attackers.iter() {
                if fighter.dinoz_id == _attacker.dinoz_id {
                    debug!("{:} is an attacker", fighter.dinoz_id);
                    let mut hp_lost: u32 = 0;
                    if _attacker.start_life > fighter.life {
                        hp_lost = _attacker.start_life - fighter.life
                    }
                    self.fight_result.attackers.push(FighterResult::new(
                        fighter.dinoz_id,
                        hp_lost,
                        Vec::new(),
                    ));
                }
            }
            for _defender in old_config_defenders.iter() {
                if fighter.dinoz_id == _defender.dinoz_id {
                    debug!("{:} is a defender", fighter.dinoz_id);
                    let mut hp_lost: u32 = 0;
                    if _defender.start_life > fighter.life {
                        hp_lost = _defender.start_life - fighter.life
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
            fighters_attackers: HashSet::new(),
            fighters_defenders: HashSet::new(),
            fighters_all: HashMap::new(),
            fighters_all_order: Vec::new(),
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Create a new Manager from a configuration
    // PARAMS:  - config: Initial configuration of the manager
    // RETURN:  The newly created manager
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_configuration(config: ManagerConfiguration) -> Self {
        let mut _all: HashMap<FighterId, Fighter> = HashMap::new();
        let mut _all_order: Vec<FighterId> = Vec::new();
        let mut _attackers: HashSet<FighterId> = HashSet::new();
        let mut _defenders: HashSet<FighterId> = HashSet::new();
        let mut _id: usize = 0;

        for _a in config.attackers.iter() {
            let f: Fighter = Fighter::from_config(_a, _id, TeamSide::Attackers);
            info!("New attacker {:?}", f);
            _attackers.insert(f.id);
            _all.insert(f.id, f.clone());
            _all_order.push(f.id);
            _id += 1;
        }
        for _d in config.defenders.iter() {
            let f: Fighter = Fighter::from_config(_d, _id, TeamSide::Defenders);
            info!("New defender {:?}", f);
            _defenders.insert(f.id);
            _all.insert(f.id, f.clone());
            _all_order.push(f.id);
            _id += 1;
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
            next_id: 0,

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
            fighters_attackers: _attackers,
            fighters_defenders: _defenders,
            fighters_all: _all,
            fighters_all_order: _all_order,
        }
    }

    // pub fn get_team_by_side(self, side: bool) -> HashSet<FighterId> {
    //     if (side) {
    //         return self.fighters_attackers;
    //     }
    //     else {
    //         return self.fighters_defenders;
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
        let _t0 = self.fighters_all[&self.fighters_all_order[0]].time;
        for f in self.fighters_all.values_mut() {
            f.time -= _t0;
        }

        info!("--- Preparation done ---");

        // Process only if there are both attackers and defenders
        if !self.fighters_attackers.is_empty() && !self.fighters_defenders.is_empty() {
            info!("--- Fight start ---");

            // To protect dev of infinite loops
            for i in 0..=MAX_TURNS {
                debug!("-- BEGINNING OF TURN {:} --", i);

                // debug!("- Time = {:}", _current_time);
                // Pick first fighter
                self.sort_all_fighters_by_time_smallest_first();
                let mut _fighter_new: Fighter =
                    self.fighters_all[&self.fighters_all_order[0]].clone();

                // Process its turn
                self.process_turn(&mut _fighter_new);

                // Increase time
                // TODO not final
                let mut _dt: u32 = (TIMEBASE as f32
                    * TIMECOEF as f32
                    * _fighter_new.speed_global
                    * _fighter_new.speed_per_element
                        [_fighter_new.get_current_element_index(false) as usize])
                    .floor() as u32;
                _fighter_new.time += _dt as i32;
                info!(
                    "Fighter {:} new time is {:}",
                    _fighter_new.id, _fighter_new.time
                );

                // Increment the element of the fighter
                _fighter_new.increment_current_element_index();

                // Update the fighter that just did its turn
                *self
                    .fighters_all
                    .get_mut(&self.fighters_all_order.first().unwrap())
                    .unwrap() = _fighter_new;

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

        info!("Result:\n{}", json);
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

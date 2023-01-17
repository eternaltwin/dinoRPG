//=====================================================================================================================
// FILE:
// PURPOSE:
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

use std::collections::{HashSet, HashMap};
use serde::{Serialize, Deserialize};
use rand::Rng;
extern crate log;
use log::{debug, info}; // add trace, warn and error as needed

use crate::fight::fighter::{Fighter, FighterConfiguration, FighterResult};

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const MAX_TURNS: u32 = 1000;
const TIMEBASE: u32 = 10; //base time, used to ensure compatibility
const TIMECOEF: u32 = 10;

// Constants from MT's code but currently not used
// const PROBA_MULTIPLIER: u32 = 1;
// const INFINITE: u32 = TIMECOEF * 1000 * 1000;
// const CYCLE: u32 = TIMECOEF * 6;
// const ATTACK_SCORE_BASE: u32 = 2;
// const DEFENSE_SCORE_BASE: u32 = 0;
// const GORE: f32 = 0.9;

type FighterId = usize;

//=====================================================================================================================
//                                             LOCAL TYPES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL VARIABLES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================

//=====================================================================================================================
//                                             EXPORTED TYPES
//=====================================================================================================================

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Structure to define the result of a fight.
// PARAMs:  - winner (bool): defines the winner of the fight, true: the attackers won, false: the defenders won
//          - attackers (Vec<FighterResults>): contains the list of the original attackers with id, hp lost and items
//            used
//          - defenders (Vec<FighterResults>): contains the list of the original defenders with id, hp lost and items
//            used
// NOTEs:   This structure needs to be exactly the same as FightProcessResult in ed-be/src/models/fight/FightResult.ts
//---------------------------------------------------------------------------------------------------------------------
#[derive(Serialize, Debug, Default, Clone)]
pub struct FightResult {
    // true: attackers won, false: defenders won
    winner: bool,
    attackers: Vec<FighterResult>,
    defenders: Vec<FighterResult>,
}

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: 
// NOTEs:   This structure needs to be exactly the same as FightConfiguration in
//          ed-be/src/models/fight/FightConfiguration.ts
//---------------------------------------------------------------------------------------------------------------------
#[derive(Deserialize, Debug, Default)]
#[allow(dead_code)]
pub struct ManagerConfiguration {
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

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: This structure defines the manager of the fight
// NOTEs:   
//---------------------------------------------------------------------------------------------------------------------
#[derive(Debug, Default)]
#[allow(dead_code)]
pub struct Manager {
    // ID Generator
    next_id: usize,

    // Flags
    configuration: ManagerConfiguration,

    // Result
    fight_result: FightResult,

    // Fighter lists
    fighters_dead: HashSet<FighterId>,
    fighters_temp_dead: HashSet<FighterId>,
    fighters_escaped: HashSet<FighterId>,
    fighters_attackers: HashSet<FighterId>,
    fighters_defenders: HashSet<FighterId>,
    fighters_all: HashMap<FighterId, Fighter>,
    fighters_all_order: Vec<FighterId>,
}


//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================
impl Manager {
// Documented local functions

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Prints the composition of each team
// PARAMS:  None
// RETURN:  None
//---------------------------------------------------------------------------------------------------------------------
    fn announce_teams(&self) {
        debug!("Attackers are:");
        // todo need name back
        for _a in &self.fighters_attackers {
            // debug!("- {:}",self.fighters_all[&_a].id);
            debug!("- {:}", _a);
        }
        debug!("Defenders are:");
        for _d in &self.fighters_defenders {
            // debug!("- {:}",self.fighters_all[&_d].name);
            debug!("- {:}", _d);
        }
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
    fn pick_target(&self, fighter_side: bool) -> FighterId {
        let mut rng = rand::thread_rng();

        // Attackers attack defenders
        let target_id: FighterId = if fighter_side {
            let defenders_number = self.fighters_defenders.len();
            let random_number = rng.gen_range(0..=defenders_number-1);
            *self.fighters_defenders.iter().nth(random_number).unwrap()
        }
        // Defenders attack attackers
        else {
            let attackers_number = self.fighters_attackers.len();
            let random_number = rng.gen_range(0..=attackers_number-1);
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
                if f.side {
                    all_attackers_dead = false;
                }
                // That means a defender is still alive
                else {
                    all_defenders_dead = false;
                }
            }
        }

        // If there are still fighters alive on both sides
        if !all_defenders_dead && !all_attackers_dead {
            result = false;
        }
        // All defenders are dead, meaning the attackers won.
        else if all_defenders_dead {
            self.fight_result.winner = true;
        }
        // Else, meaning the attackers lost.
        else {
            self.fight_result.winner = false;
        }
        // TODO check that there may be another case (not all died, so a tie?)

        result
    }


//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Calculate the hp lost by the target from an attacker's assault
//          For an assault, the attack score is:
//          BASE_ATTACK + 5 * attacker current element value + attacker assault bonus + attacker next assault bonus
//          then * attacker assault multiplier * attacker next assault multiplier
//          The defense score is:
//          BASE_DEFENSE + target defense value * (5 * attacker current element value) + target armor
// PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
//          - target (&mut Fighter): mutable pointer of the target
// RETURN:  The number of hp lost by the target
//---------------------------------------------------------------------------------------------------------------------
    fn compute_hp_lost_from_assault(&self, attacker: &mut Fighter, _target: &mut Fighter) -> u32 {
        // TODO rename _target to target once used
        // let mut attack_score: u32 = ATTACK_SCORE_BASE;
        // let mut defense_score: u32 = DEFENSE_SCORE_BASE;
        let att_cur_element_index: usize = attacker.get_current_element_index(true);

        attacker.elements[att_cur_element_index]
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Handle an assault
// PARAMS:  - attacker (&mut Fighter): mutable pointer of the attacker
//          - target (&mut Fighter): mutable pointer of the target
// RETURN:  None
//---------------------------------------------------------------------------------------------------------------------
    fn process_assault(&self, attacker: &mut Fighter, target: &mut Fighter) {
        debug!("{:} launches an assault on {:}", attacker.id, target.id);
        let hp_lost: u32 = self.compute_hp_lost_from_assault(attacker, target);
        if target.life < hp_lost {
            target.life = 0;
        }
        else {
            target.life -= hp_lost;
        }
        debug!("{:} loses {:} life points, only {:} left", target.id, hp_lost, target.life);
        if target.life == 0 {
            debug!("{:} died!", target.id);
        }
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Handle a fighter's turn
// PARAMS:  A mutable pointer of the fighter whose turn it is
// RETURN:  None
//---------------------------------------------------------------------------------------------------------------------
    fn process_turn(&mut self, fighter: &mut Fighter) {
        debug!("It's {:}'s turn", fighter.id);
        let _target_id: FighterId = self.pick_target(fighter.side);
        debug!("Its target is {:}", _target_id);
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
                    self.fight_result.attackers.push(FighterResult::new(fighter.dinoz_id, hp_lost, Vec::new()));
                }
            }
            for _defender in old_config_defenders.iter() {
                if fighter.dinoz_id == _defender.dinoz_id {
                    debug!("{:} is a defender", fighter.dinoz_id);
                    let mut hp_lost: u32 = 0;
                    if _defender.start_life > fighter.life {
                        hp_lost = _defender.start_life - fighter.life
                    }
                    self.fight_result.defenders.push(FighterResult::new(fighter.dinoz_id, hp_lost, Vec::new()));
                }
            }
        }        
    }

// Un-used & non-documented local functions

}

//=====================================================================================================================
//                                             EXPORTED FUNCTIONS
//=====================================================================================================================

impl Manager {
// Documented exported functions

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Create a new Manager with default values. Prefer using "from_config" instead
// PARAMS:  None
// RETURN:  The newly created manager
//---------------------------------------------------------------------------------------------------------------------
    pub fn new() -> Self {
        Self {
            // ID Generator
            next_id: 0,

            // Configuration
            configuration: ManagerConfiguration::default(),

            // Result
            fight_result: FightResult::default(),

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
            let _f: Fighter = Fighter::from_config(_a, _id, true);
            _attackers.insert(_f.id);
            _all.insert(_f.id, _f.clone());
            _all_order.push(_f.id);
            _id += 1;
        }
        for _d in config.defenders.iter() {
            let _f: Fighter = Fighter::from_config(_d, _id, false);
            _defenders.insert(_f.id);
            _all.insert(_f.id, _f.clone());
            _all_order.push(_f.id);
            _id += 1;
        }

        Self {
            // ID Generator
            next_id: 0,

            //Flags
            configuration: config,

            // Result
            fight_result: FightResult::default(),

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

        // Sort fighters by time
        self.sort_all_fighters_by_time_smallest_first();
        // Get smallest time and remove it from all the other fighters
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
                let mut _fighter_new: Fighter = self.fighters_all[&self.fighters_all_order[0]].clone();

                // Process its turn
                self.process_turn(&mut _fighter_new);

                // Increase time
                let mut _dt: u32 = (TIMEBASE as f32 * TIMECOEF as f32 * _fighter_new.time_multiplier * _fighter_new.time_elements_multipliers[0]).floor() as u32;
                _fighter_new.time += _dt;
                // debug!("{:}'s new time is {:}", _fighter_new.id, _fighter_new.time);

                // Update the fighter that just did its turn
                *self.fighters_all.get_mut(&self.fighters_all_order[0]).unwrap() = _fighter_new;

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
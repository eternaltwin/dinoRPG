//! Models and methods to handle a fighter

use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::cmp;

use super::elements::{ElementIndex, OrderedElements};
use super::manager::{Manager, TeamSide};
use super::skills::{Skill, SkillOrUnknown, SkillType};

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const DEFAULT_MAX_ENERGY: u32 = 100;
const MAXIMUM_MAX_ENERGY: u32 = 200;
const MINIMUM_MAX_ENERGY: u32 = 0;

// Helper to determine how one element contributes to the defense for all the elements (except Void)
// It's a sliding window depending on where you are in the element order.
// E.g.: Calculating for Fire will be [Fire, Wood, Water, Lightning, Air]
// E.g.: Calculating for Air will be [Air, Fire, Wood, Water, Lightning]
// First index corresponds to the element considered: it gives as much defense as its value
// The next 2 are the elements that contribute the least to the element defense
// The last 2 are the elements that contribute the most to the element defense
// Fire contributes 1:1 to fire defense, wood & water contribute 2:1 and lightning & air contribute 1:1.5
// Then rotate: wood contributes 1:1 to wood, water & lightning contribute 2:1 and air & fire contribute 1:1.5
// Etc.
const DEFENSE_CALCULATOR: [f32; 5] = [1.0, 0.5, 0.5, 1.5, 1.5];

//=====================================================================================================================
//                                             LOCAL TYPES
//=====================================================================================================================

// Enums from MT's code but currently not used
// What is it?
// enum CancelEvent {
//     Exception,
// }

// Enum to define the duration of a status (?)
// enum StatusTime {
//     DShort,
//     DMedium,
//     DLong,
//     DInfinite,
// }

// ?
// enum EventNotify {
//     NSkill,
//     NObject,
// }

// ?
// enum Restriction {
//     RObject,
//     RMagicObject,
//     REffects,
// }

// Struct to store all the info of an attack
// struct AttackInfo {
//     from: Fighter,
//     target: Fighter,
//     lost: i32,
//     dmg: [i32; 5],
//     assault: bool,
//     esquive: bool,
//     invoc: bool,
// }

// Struct to store all the info of a status
// struct StatusInfo {
// todo status: Status,
//     tine: i32,
//     rem: i32,
//     cycle: bool,
// todo cancel: Void -> Void,
// }

// Struct to store the info of an Event
// What is T
// What is N
// struct Event<T,N> {
//     priority: i32,
//     proba: i32,
//     notify: N,
//     fx: T,
//     energy: i32,
// }

type ItemId = u32;
type StatusId = u32;

pub type FighterId = u32;

/// This structure needs to be exactly the same as FighterFiche in core/src/models/fight/FightConfiguration.mts
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FighterConfiguration {
    /// ID of the dinoz on the node side if it's a dinoz
    pub dinoz_id: u32,
    /// Name of the fighter
    pub name: String,
    /// Type of fighter (dinoz or monster)
    pub ftype: FighterType,
    /// Display code of the fighter
    pub display: String,
    /// Health of the fighter at the start of the fight, it cannot go above it during a fight
    pub start_life: u32,
    /// The base elements of the fighter (in the order 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
    base_elements: [i32; 5],
    /// The items equipped by the fighter
    items: Vec<ItemId>,
    /// The activated skills of the fighter
    skills: Vec<SkillOrUnknown>,
    /// The status of the fighter
    status: Vec<StatusId>,
    /// Attack bonus for the fighter
    attack_bonus: u32,
    /// Defense bonus for the fighter
    defense_bonus: u32,
}

/// This structure needs to be exactly the same as FighterResultFiche in core/src/models/fight/FighterFiche.mts
#[derive(Serialize, Debug, Default, Clone)]
pub struct FighterResult {
    /// ID of the dinoz in the DB
    dinoz_id: u32,
    /// The health lost by the fighter in the fight in comparison to its starting life
    hp_lost: u32,
    /// The items used by the dinoz during the fight
    items_used: Vec<ItemId>,
}

impl FighterResult {
    pub fn new(dinoz_id: u32, hp_lost: u32, items_used: Vec<ItemId>) -> Self {
        Self {
            dinoz_id,
            hp_lost,
            items_used,
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub enum FighterType {
    Boss,
    Dinoz,
    Monster,
}

#[derive(Debug, Clone)]
/// Struct to define a Fighter (dino, monster or anything)
pub struct Fighter {
    /// Fighter ID: to handle fights
    pub id: FighterId,
    /// Name of the fighter
    pub name: String,
    /// Type of fighter (boss, dinoz or monster)
    pub ftype: FighterType,
    /// Display code of the fighter
    pub display: String,
    /// Dinoz ID: to coordinate with the Node backend if it is a dinoz
    pub dinoz_id: u32,
    /// Side of the fighter
    pub side: TeamSide,
    /// Original side of the fighter (in case it temporarily changes side)
    pub original_side: TeamSide,
    /// Array of elements of the fighter ordered from highest to lowest
    pub ordered_elements: OrderedElements,
    /// The element of the fighter is locked
    is_locked_element: bool,

    /// The current time of the fighter
    pub time: i32,
    /// The current life of the fighter
    pub life: u32,

    /// The start life of the fighter, it cannot go above its start life during a fight
    start_life: u32,

    /// List of items carried by the fighter
    items: Vec<ItemId>,
    /// List of skills of the fighter
    skills: Vec<Skill>,
    /// List of status of the fighter
    status: Vec<StatusId>,

    /// Armor of the fighter: flat increase to the defense score when computing damage
    pub armor: u32,
    /// Defense of the fighter per element: see compute_defenses for how it is calculated
    /// Contains the defense of the fighter for the elements in the following order:
    /// 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    pub defense: [f32; 6],

    /// Bonus to the assault attack score per element
    pub assault_elemental_bonus: [u32; 6],
    /// Bonus to all assaults attack score
    pub all_assaults_bonus: u32,
    /// Multiplier to all assaults attack score
    pub all_assault_multiplier: f32,
    /// Bonus to the next assault attack score
    pub next_assault_bonus: u32,
    /// Multiplier for the next assault attack score
    pub next_assault_multiplier: f32,

    /// Bonus to the skill attack score per element
    pub skill_elemental_bonus: [u32; 6],

    /// Global time multiplier, i.e speed
    pub speed_global: f32,
    /// Global time multiplier, i.e speed for each element
    pub speed_per_element: [f32; 6],

    /// Global minimum damage for an attack
    pub minimum_damage: u32,
    /// Minimum damage for an assault, it can supersede minimum_assault_damage
    pub minimum_assault_damage: u32,

    /// Global initiative multiplier: affects any time positive or negative effects (this is impacted by the temporal damper notably)
    pub initiative_global_multiplier: f32,

    /// % chance to counter attack an assault: 1.0 means 0% chance
    pub counter_attack_chance: f32,

    /// Maximum energy of the fighter
    pub max_energy: u32,
    /// Current energy of the fighter
    pub energy: u32,
    /// Capacity of the fighter to regenerate energy, default is 1.0
    pub recovery_multiplier: f32,

    /// % chance to do another assault after one: 1.0 means 0% chance
    pub multi_assault_chance: f32,

    /// % chance to dodge an assault: 1.0 means 0%
    pub assault_dodge_chance: f32,

    /// The fighter can touch and damage intangible fighters
    pub can_touch_intangible: bool,
    /// The fighter can touch and damage (with assault) flying fighters
    pub can_touch_flying: bool,
    /// The fighter ignores the armor of its target
    pub cancel_armor: bool,

    /// List of active skills of the fighter that can be triggered instead of an assault
    pub active_skills: Vec<Skill>,
    /// List of event skills of the fighter that can be triggered at the beginning of the turn
    pub event_skills: Vec<Skill>,
    /// List of effects triggered when the fighter is hit
    pub defense_effects: Vec<Skill>,
    /// WIP: List of effects triggered after the fighter attacked
    pub after_attack_effects: Vec<Skill>,
    /// WIP: List of effects triggered after the fighter defended
    pub after_defense_effects: Vec<Skill>,
    /// WIP: List of effects triggered after the fight finished
    pub after_fight_effects: Vec<Skill>,
    /// WIP: List of effects triggered when a status is applied
    pub on_status_effects: Vec<Skill>,
    /// WIP: List of effects triggered when a fighter dies
    pub on_kill_effects: Vec<Skill>,
    /// WIP: List of effects triggered when the fighter lost the fight
    pub on_defeat_effects: Vec<Skill>,
    /// WIP: List of effects triggered before a new turn starts
    pub before_turn_effects: Vec<Skill>,
    /// WIP: List of effects triggered when the fighter is targeted
    pub on_target_effects: Vec<Skill>,

    // Skill based effects
    /// Flag to specify if the fighter has perception
    pub perception: bool,
    /// Flag to specify if the fighter has rock
    pub rock: bool,
    //
    // Un-used & non-documented fields
    // default_max_energy: u32,
    // Number of attacks a Fighter chains (or just chained/is ongoing?)
    // combo: u32,
    // Infos
    //dino: undefined, // TODO Dino
    //monster: undefined, // TODO Monster

    // delete_objects: bool, // true

    // function set_timeMultiplier ?

    // object_chance_multiplier: f32,

    // perception: bool,
    // can_escape: bool,
    // mark_as_rock: bool,
    // costume_flag: bool,
    // fly_after_attack: bool,
    // super_dodge_chance: f32, // to dodge assault and events

    // clone_default_life: u32,
    //next_attack: undefined, // TODO
    //next_event: undefined, // TODO
    //restrictions: undefined, // TODO Array of restriction
    // cant_reduce_max_energy: bool,

    //  Events
    //after_attack: undefined, // TODO List Attack Infos
    //after_defense: undefined, // TODO List Attack Infos
    //after_fight: undefined, // TODO

    //target_filters: undefined, // TODO

    //on_status: undefined, // TODO
    //on_kill: undefined, // TODO
    //on_lost: undefined, // TODO
    //before_turn: undefined, // TODO

    // events: undefined, // TODO
    // events_filters: undefined, // TODO

    // attacks: undefined, // TODO
    // attacks_filters: undefined, // TODO

    // defenses: undefined, // TODO
    // on_targeted: undefined, // TODO

    // Variables
    // cur_target: Fighter,
    // no_return: bool,
    // status: undefined, // TODO
    // balanced: bool,
    // castle_attacks: u32,
    // dino_ref: undefined, // TODO
    // hypnotized: bool,
    // under_fuca: bool,
    // invocations: u32,
    // has_used_fujin: bool,

    // has_whistle: bool
}

//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================

impl Fighter {}

// Un-used & non-documented local functions

impl Fighter {
    // Documented exported functions

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Create a new Fighter from a configuration
    // PARAMS:  - config (FighterConfiguration): Initial configuration of the fighter
    //          - fighter_id (u32): The fighter id assigned to this fighter
    //          - fighter_side (bool): The side of the fighter - true: attacker, false: defender
    // RETURN:  The newly created Fighter entity
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_config(
        config: &FighterConfiguration,
        fighter_id: u32,
        fighter_side: TeamSide,
    ) -> Self {
        let mut temp_defense = Self::compute_defenses(config.base_elements);
        let mut temp_elements = OrderedElements::from_elements_array_no_void(config.base_elements);
        // Monsters can get attack bonus that goes to their void elements and a defense bonus
        if config.ftype == FighterType::Monster {
            if config.attack_bonus > 0 {
                temp_elements[ElementIndex::Void] += config.attack_bonus as i32;
            }
            if config.defense_bonus > 0 {
                for d in temp_defense.iter_mut() {
                    *d += config.defense_bonus as f32;
                }
            }
            // Monsters don't attack with their elements that are 0
            // Todo would be more concise to be able to use an iterator
            if temp_elements[ElementIndex::Air] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Air);
            }
            if temp_elements[ElementIndex::Fire] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Fire);
            }
            if temp_elements[ElementIndex::Lightning] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Lightning);
            }
            if temp_elements[ElementIndex::Water] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Water);
            }
            if temp_elements[ElementIndex::Wood] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Wood);
            }
            if temp_elements[ElementIndex::Void] == 0 {
                temp_elements.add_skipped_element(ElementIndex::Void);
            }
            // If no elements left, keep the void one
            if temp_elements.skipped_indexes.len() == 6 {
                temp_elements
                    .skipped_indexes
                    .retain(|e| *e != ElementIndex::Void);
            }
        }
        // Other fighters don't use the void element
        else {
            temp_elements.add_skipped_element(ElementIndex::Void);
        }

        Self {
            // Used & documented fields
            id: fighter_id,
            name: config.name.clone(),
            ftype: config.ftype,
            display: config.display.clone(),
            dinoz_id: config.dinoz_id,
            side: fighter_side,
            original_side: fighter_side,
            start_life: config.start_life,
            life: config.start_life,
            time: 0,
            ordered_elements: temp_elements,
            is_locked_element: false,
            items: config.items.clone(),
            skills: Skill::from_config(config.skills.clone()),
            status: config.status.clone(),

            // WIP
            armor: 0,
            defense: temp_defense,
            speed_global: 1.0,
            speed_per_element: [1.0; 6],
            assault_elemental_bonus: [0; 6],
            all_assaults_bonus: 0,
            all_assault_multiplier: 1.0,
            next_assault_bonus: 0,
            next_assault_multiplier: 1.0,
            skill_elemental_bonus: [0; 6],
            minimum_damage: 1,
            minimum_assault_damage: 1,
            initiative_global_multiplier: 1.0,
            counter_attack_chance: 1.0, // 0 % chance
            max_energy: DEFAULT_MAX_ENERGY,
            energy: DEFAULT_MAX_ENERGY,
            recovery_multiplier: 1.0,
            multi_assault_chance: 1.0,
            assault_dodge_chance: 1.0,
            can_touch_intangible: false,
            can_touch_flying: false,
            cancel_armor: false,
            active_skills: vec![],
            event_skills: vec![],
            after_defense_effects: vec![],
            after_attack_effects: vec![],
            after_fight_effects: vec![],
            on_status_effects: vec![],
            defense_effects: vec![],
            on_kill_effects: vec![],
            on_defeat_effects: vec![],
            before_turn_effects: vec![],
            on_target_effects: vec![],

            perception: false,
            rock: false,
            //
            // Un-used & non-documented fields
            // combo: 0,
            // object_chance_multiplier: 1.0,

            // default_max_energy: DEFAULT_MAX_ENERGY,
            // can_fight_flying: false,
            // costume_flag: false,
            // delete_objects: true,
            // balanced: false,
            // fly_after_attack: false,
            // hypnotized: false,
            // mark_as_rock: false,
            // minimum_assault_damage: 1,
            // name: name,
            // no_return: false,
            // perception: false,

            // under_fuca: false,
            // invocations: 1,
            // has_used_fujin: false,
            // has_whistle: false,
            // minimum_damage: 1,
            // super_dodge_chance: 1.0,

            // TODO
            // restrictions: undefined,
            // events: undefined,
            // events_filters: undefined,
            // attacks: undefined,
            // attacks_filters: undefined,
            // defenses: undefined,
            // target_filters: undefined,
            // on_targeted: undefined,
            // clone_default_life: 1,

            // TODO
            // after_attack: undefined,
            // after_defense: undefined,
            // after_fight: undefined,
            // status: undefined,
            // on_status: undefined,
            // on_kill: undefined,
            // onlost: undefined,
            // before_turn: undefined,
            // castle_attacks: 1,
            // cant_dodge_assault: false,
            // cant_reduce_max_energy: false,
            // can_escape: true,
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Create a new Fighter with default values. Prefer using "from_config" instead
    // PARAMS:  - fighter_id (u32): The fighter id assigned to this fighter
    //          - life (u32): The start life of the fighter. It cannot be exceeded during a fight
    //          - elements ([u32; 5]): The elements of the fighter
    //          - side (bool): The side of the fighter - true: attacker, false: defender
    // RETURN:  The newly created Fighter entity
    //---------------------------------------------------------------------------------------------------------------------
    // Create a new Fighter
    pub fn new(fighter_id: u32, life: u32, elements: [i32; 5], side: TeamSide) -> Self {
        Self {
            // Used & documented fields
            id: fighter_id,
            name: String::new(),
            ftype: FighterType::Dinoz,
            display: String::new(),
            dinoz_id: 0,
            side,
            original_side: side,
            start_life: life,
            life,
            ordered_elements: OrderedElements::from_elements_array_no_void(elements),
            is_locked_element: false,
            time: 0,
            items: Vec::new(),
            skills: Vec::new(),
            status: Vec::new(),

            // WIP
            armor: 0,
            defense: Self::compute_defenses(elements),
            speed_global: 1.0,
            speed_per_element: [1.0; 6],
            assault_elemental_bonus: [0; 6],
            all_assaults_bonus: 0,
            all_assault_multiplier: 1.0,
            next_assault_bonus: 0,
            next_assault_multiplier: 1.0,
            skill_elemental_bonus: [0; 6],
            minimum_damage: 1,
            minimum_assault_damage: 1,
            initiative_global_multiplier: 1.0,
            counter_attack_chance: 1.0,
            max_energy: DEFAULT_MAX_ENERGY,
            energy: DEFAULT_MAX_ENERGY,
            recovery_multiplier: 1.0,
            multi_assault_chance: 1.0,
            assault_dodge_chance: 1.0,
            can_touch_intangible: false,
            can_touch_flying: false,
            cancel_armor: false,
            active_skills: vec![],
            event_skills: vec![],
            after_defense_effects: vec![],
            after_attack_effects: vec![],
            after_fight_effects: vec![],
            on_status_effects: vec![],
            defense_effects: vec![],
            on_kill_effects: vec![],
            on_defeat_effects: vec![],
            before_turn_effects: vec![],
            on_target_effects: vec![],

            perception: false,
            rock: false,
            //
            // Un-used & non-documented fields
            // combo: 0,
            // object_chance_multiplier: 1.0,

            // default_max_energy: DEFAULT_MAX_ENERGY,
            // recovery_multiplier: 1.0,
            // can_fight_flying: false,
            // costume_flag: false,
            // delete_objects: true,
            // balanced: false,
            // fly_after_attack: false,
            // hypnotized: false,
            // mark_as_rock: false,
            // minimum_assault_damage: 1,
            // name: name,
            // no_return: false,
            // perception: false,

            // under_fuca: false,
            // invocations: 1,
            // has_used_fujin: false,
            // has_whistle: false,
            // minimum_damage: 1,
            // super_dodge_chance: 1.0,
            // TODO
            // restrictions: undefined,
            // events: undefined,
            // events_filters: undefined,
            // attacks: undefined,
            // attacks_filters: undefined,
            // defenses: undefined,
            // target_filters: undefined,
            // on_targeted: undefined,
            //
            //
            // clone_default_life: 1,
            // TODO
            // after_attack: undefined,
            // after_defense: undefined,
            // after_fight: undefined,
            // status: undefined,
            // on_status: undefined,
            // on_kill: undefined,
            // onlost: undefined,
            // before_turn: undefined,
            // castle_attacks: 1,
            // cancel_armor: false,
            // cant_dodge_assault: false,
            // cant_reduce_max_energy: false,
            // can_escape: true,
        }
    }

    /// Prepare the skills of the dinoz:
    /// - process passive skills
    /// - load the active skills
    /// - load the event skills
    /// - do something with the special skills
    /// - etc.
    pub fn prepare_skills(&mut self, manager: &mut Manager) {
        info!("--- Preparing fighter {:} skills ---", self.id);
        let skills = self.skills.clone();
        for s in skills {
            match s.skill_type() {
                SkillType::PASSIVE => {
                    debug!("Processing passive skill {:?}", s);
                    s.process_skill(self, manager);
                }
                SkillType::ACTIVE => {
                    debug!("Loading active skill {:?}", s);
                    self.active_skills.push(s);
                }
                SkillType::EVENT => {
                    debug!("Loading event skill {:?}", s);
                    self.event_skills.push(s);
                }
                _ => (), // TODO
            }
        }
        info!("--- Preparing fighter {:} skills done---", self.id);
    }

    /// Finalize the preparation phase of the fighter by sorting the active and event skills in decreasing priority order
    /// i.e highest priority skills are first in the vector
    pub fn finalize_skills(&mut self) {
        self.active_skills
            .sort_by_key(|a| std::cmp::Reverse(a.priority()));
        debug!(
            "Fighter {} (id {}): active skills {:?}",
            self.id, self.name, self.active_skills
        );
        self.event_skills
            .sort_by_key(|a| std::cmp::Reverse(a.priority()));
        debug!(
            "Fighter {} (id {}): event skills {:?}",
            self.id, self.name, self.event_skills
        );
    }

    /// Get the index of the current element of the fighter
    /// Take as parameter a boolean to tells if the index should be moved to the Fighter's next element after getting the element
    /// Return the [index](`ElementIndex`) of the current element of the fighter
    pub fn get_current_element_index(&mut self, do_increment: bool) -> ElementIndex {
        let index: ElementIndex = self.ordered_elements.get_current_element_index();
        debug!(
            "[Fighter {:}:get_current_element_index] Current element index is {:?}",
            self.id, index
        );
        if do_increment && !self.is_locked_element {
            let _ = &self.ordered_elements.increment_current_index();
            debug!("[Fighter {:}:get_current_element_index] Do increment: next element index is {:?} (is locked: {:})", self.id, self.ordered_elements.get_current_element_index(), self.is_locked_element);
        }
        index
    }

    /// PURPOSE: Increment the index of the current element of the fighter
    /// PARAMS:  None
    /// RETURN:  ElementIndex - The index of the current element of the fighter
    pub fn increment_current_element_index(&mut self) -> ElementIndex {
        debug!(
            "[Fighter {:}:get_current_element_index] Current element index is {:?}",
            self.id,
            self.ordered_elements.get_current_element_index()
        );
        if !self.is_locked_element {
            self.ordered_elements.increment_current_index();
            debug!("[Fighter {:}:get_current_element_index] Do increment: next element is {:?} (is locked: {:})", self.id, self.ordered_elements.get_current_element_index(), self.is_locked_element);
        }
        self.ordered_elements.get_current_element_index()
    }

    /// PURPOSE: Calculate defenses of the fighter based on the elements
    /// PARAMS:  - elements: ([u32; 5]) - expects the list of elements of the fighter in the following order
    ///            0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    /// RETURN:  [f32;6] - An array that corresponds to the defense of the fighter with elements in the following order:
    ///          0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    // TODO consider skills & statuses?
    // TODO can defense be negative?
    pub fn compute_defenses(elements: [i32; 5]) -> [f32; 6] {
        let mut defense: [f32; 6] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        for i in 0..=4 {
            let mut k: f32 = 0.0;
            for j in 0..=4 {
                k += elements[(i + j) % 5] as f32 * DEFENSE_CALCULATOR[j];
            }
            defense[i] = k;
            defense[ElementIndex::Void as usize] += elements[i] as f32;
        }
        defense
    }

    ///---------------------------------------------------------------------------------------------------------------------
    /// PURPOSE: Calculate the power value of an attack given its element type and power base
    ///          The power value equals to: power_base * element
    ///          For example, the power base of an assault is 5, so the result is 5 * element
    /// PARAMS:  - element_type: u32 (0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
    ///          - power_base: u32 - Base value of the attack. For example, 5 for an assault.
    /// RETURN:  The power value of the attack at its proper element index in a [u32;6]
    ///---------------------------------------------------------------------------------------------------------------------
    pub fn compute_attack(&self, element_type: ElementIndex, power_base: u32) -> [u32; 6] {
        let mut attack: [u32; 6] = [0, 0, 0, 0, 0, 0];

        // Make sure the element value is positive or zero
        let element: u32 = cmp::max(self.ordered_elements.elements[element_type], 0) as u32;

        attack[element_type as usize] = power_base * element;
        attack
    }

    ///---------------------------------------------------------------------------------------------------------------------
    /// PURPOSE: Calculate the power value of a multi element attack given the element types type and power bases for each
    ///          The element types of attack are inferred from the power bases (a power base of 0 means this element does not take part in the attack)
    /// PARAMS:  - element_type: u32 (0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
    ///          - power_base: [u32; 6]
    /// RETURN:  The power value of the attack at its proper element index in a [u32;6]
    ///---------------------------------------------------------------------------------------------------------------------
    pub fn compute_multi_element_attack(&self, power_base: [i32; 6]) -> [i32; 6] {
        let mut attack: [i32; 6] = power_base;
        let elements = self.ordered_elements.elements.to_array();
        for i in 0..=5 {
            attack[i] *= elements[i];
        }
        attack
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Get the major element (i.e highest) index of the Fighter.
    //          For example, if the elements are [4, 3, 8, 1, 2], the result is 2 as in the index of 8.
    // PARAMS:  None
    // RETURN:  The index of the major element of the fighter
    //---------------------------------------------------------------------------------------------------------------------
    pub fn get_major_element_index(self) -> ElementIndex {
        self.ordered_elements.elements.get_max_element_index()
        // let mut best: u32 = self.elements[0];
        // let mut best_id: u32 = 0;
        // for n in 1..=self.elements.len() {
        //     if self.elements[n] > best {
        //         best = self.elements[n];
        //         best_id = n as u32;
        //     }
        // }
        // best_id
    }

    // /// Add an active skill to the list of active skills of the fighter
    // pub fn add_active_skill(&mut self, priority: u32, probability: u32, skill: Skill) {
    //     self.active_skills
    //         .push(ActiveSkill::new(priority, probability, skill));
    // }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Set the maximum energy of the Fighter and returns the value set
    // PARAMS:  - value (i32): The new maximum energy of the fighter
    // RETURN:  The newly set maximum energy of the fighter
    //---------------------------------------------------------------------------------------------------------------------
    // pub fn set_max_energy(mut self, value: i32) -> u32 {
    //     if value > MAXIMUM_MAX_ENERGY as i32 {
    //         self.max_energy = MAXIMUM_MAX_ENERGY;
    //     }
    //     else if value < MINIMUM_MAX_ENERGY as i32 {
    //         self.max_energy = 1;
    //     }
    //     else {
    //         self.max_energy = value as u32;
    //     }

    //     if self.max_energy < DEFAULT_MAX_ENERGY && self.cant_reduce_max_energy {
    //         self.max_energy = DEFAULT_MAX_ENERGY;
    //     }
    //     self.max_energy
    // }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Set the energy of the Fighter and returns the value set. It cannot go above the maximum energy of the
    //          Fighter.
    // PARAMS:  - value (i32): The new energy of the fighter
    // RETURN:  The newly set energy of the fighter
    //---------------------------------------------------------------------------------------------------------------------
    // pub fn set_energy(mut self, value: i32) -> u32 {
    //     if value > self.max_energy as i32 {
    //         self.energy = self.max_energy;
    //     }
    //     else if value < 0 {
    //         self.energy = 0;
    //     }
    //     else {
    //         self.energy = value as u32;
    //     }
    //     self.energy
    // }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Make a clone from the Fighter and give it a given Fighter id (fid)
    // PARAMS:  - fid (usize): The fighter id to give the clone
    //          - start_life (u32): The life of the clone
    // RETURN:  A "clone" in game (not Rust clone) of the Fighter
    //---------------------------------------------------------------------------------------------------------------------
    // todo
    // pub fn create_clone(self, fid: usize, start_life: u32) -> Fighter {
    //     let mut c: Fighter = Self::new(fid, start_life, self.elements, self.original_side);
    //     c.all_assaults_bonus = self.all_assaults_bonus;
    //     c.armor = self.armor;
    //     c.assaults_bonus = self.assaults_bonus;
    //     c.can_fight_flying = self.can_fight_flying;
    //     c.can_fight_intangible = self.can_fight_intangible;
    //     c.cancel_armor = self.cancel_armor;
    //     c.counter_attack_chance = self.counter_attack_chance;
    //     c.defense = self.defense;
    //     c.super_dodge_chance = self.super_dodge_chance;
    //     c.mark_as_rock = self.mark_as_rock;
    //     c.minimum_damage = self.minimum_damage;
    //     c.minimum_assault_damage = self.minimum_assault_damage;
    //     // todo c.monster = self.monster;
    //     c.multi_attack_chance = self.multi_attack_chance;
    //     c.object_chance_multiplier = self.object_chance_multiplier;
    //     c.perception = self.perception;
    //     c.power_bonus = self.power_bonus;
    //     c.side = self.side;
    //     c.speed_global = self.speed_global;
    //     c.speed_per_element = self.speed_per_element;
    //     c.start_life = self.start_life;
    //     c.time = self.time;
    //     c.balanced = self.balanced;
    //     if (self.dino != null) {
    //         c.dino_ref = self.dino;
    //     }
    //     if (self.dino_ref != null) {
    //         c.dino_ref = self.dino_ref;
    //     }
    //     c
    // }

    // Un-used & non-documented exported functions
}

/// A reduced model to represent a fighter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FighterShort {
    /// Fighter ID: to handle fights
    pub id: u32,
    /// Name of the fighter
    pub name: String,
    /// Type of fighter (dinoz or monster)
    pub ftype: FighterType,
    /// Display code of the fighter
    pub display: String,
    /// Dinoz ID: to coordinate with the Node backend if it is a dinoz
    pub dinoz_id: u32,
    /// Original side of the fighter
    pub side: TeamSide,
}

impl From<Fighter> for FighterShort {
    fn from(f: Fighter) -> Self {
        Self {
            id: f.id,
            name: f.name.clone(),
            ftype: f.ftype,
            display: f.display.clone(),
            dinoz_id: f.dinoz_id,
            side: f.original_side,
        }
    }
}

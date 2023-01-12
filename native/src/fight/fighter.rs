//=====================================================================================================================
// FILE:      fighter.rs
// PURPOSE:   Structure and function to handle a fighter
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

use serde::{Serialize, Deserialize};

use crate::fight::elements::ElementsIndexes;

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const DEFAULT_MAX_ENERGY: u32 = 100;
const DEFENSES: [f32; 5] = [1.0, 0.5, 0.5, 1.5, 1.5];
const MAXIMUM_MAX_ENERGY: u32 = 200;
const MINIMUM_MAX_ENERGY: u32 = 0;

//=====================================================================================================================
//                                             LOCAL TYPES
//=====================================================================================================================

// Enums from MT's code but currently not used
// What is it?
// enum CancelEvent {
//     Exception,
// }

// // Enum to define the duration of a status (?)
// enum StatusTime {
//     DShort,
//     DMedium,
//     DLong,
//     DInfinite,
// }

// // ?
// enum EventNotify {
//     NSkill,
//     NObject,
// }

// // ?
// enum Restriction {
//     RObject,
//     RMagicObject,
//     REffects,
// }

// // Struct to store all the info of an attack
// struct AttackInfo {
//     from: Fighter,
//     target: Fighter,
//     lost: i32,
//     dmg: [i32; 5],
//     assault: bool,
//     esquive: bool,
//     invoc: bool,
// }

// // Struct to store all the info of a status
// struct StatusInfo {
//     // todo status: Status,
//     tine: i32,
//     rem: i32,
//     cycle: bool,
//     // todo cancel: Void -> Void,
// }

// // Struct to store the info of an Event
// // What is T
// // What is N
// struct Event<T,N> {
//     priority: i32,
//     proba: i32,
//     notify: N,
//     fx: T,
//     energy: i32,
// }

type ItemId = u32;
type SkillId = u32;
type StatusId = u32;


//=====================================================================================================================
//                                             EXPORTED TYPES
//=====================================================================================================================

// This structure needs to be exactly the same as FighterFiche in ed-be/src/models/fight/FighterFiche.ts
#[derive(Deserialize, Debug, Default, Clone)]
pub struct FighterConfiguration {
    // ID of the dinoz in the DB
    pub dinoz_id: u32,
    // Health of the dinoz at the start of the fight, it cannot go above it during a fight
    pub start_life: u32,
    // The base elements of the dinoz
    base_elements: [u32; 5],
    // The items equipped by the dinoz
    items: Vec<ItemId>,
    // The activated skills of the dinoz
    skills: Vec<SkillId>,
    // The status of the dinoz
    status: Vec<StatusId>
}


// This structure needs to be exactly the same as FighterResultFiche in ed-be/src/models/fight/FighterFiche.ts
#[derive(Serialize, Debug, Default, Clone)]
pub struct FighterResult {
    // ID of the dinoz in the DB
    dinoz_id: u32,
    // The health lost by the dinoz in the fight in comparison to its starting life
    hp_lost: u32,
    // The items used by the dinoz during the fight
    items_used: Vec<ItemId>
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

#[derive(Debug, Clone)]
#[allow(dead_code)]
// Struct to define a Fighter (dino or monster)
pub struct Fighter {
    // Used & Documented fields
    // Fighter ID: to handle fights
    pub id: usize,
    // Dinoz ID: to coordinate with the Node backend if it is a dinoz
    pub dinoz_id: u32,
    // Side of the fighter - true: attacker, false: defender
    pub side: bool,
    // Original side of the fighter (in case it temporarily changes side)
    original_side: bool,
    // Array of elements of the dinoz: Air, Fire, Lightning, Water, Wood
    pub elements: [u32; 5],
    // The order of elements of the dinoz: i.e contains the index of the elements it goes through
    elements_order: [usize; 5],
    // Index to determine the next element according to elements_order
    elements_order_index: usize,
    // The element of the fighter is locked
    is_locked_element: bool,
    // The current time of the fighter
    pub time: u32,
    // The current life of the fighter
    pub life: u32,
    // The start life of the fighter, it cannot go above its start life during a fight
    start_life: u32,
    // List of items carried by the fighter
    items: Vec<ItemId>,
    // List of skills of the fighter
    skills: Vec<SkillId>,
    // List of status of the fighter
    status: Vec<StatusId>,

    // WIP
    // Armor of the fighter: does ??
    armor: u32,
    // Defense of the fighter per element: see compute_defenses for how it is calculated
    // Contains the defense of the dinoz for the elements in the following order:
    // Air, Fire, Lightning, Water, Wood, Void
    defense: [f32; 6],

    // Un-used & non-documented fields
    default_max_energy: u32,
    // Number of attacks a Fighter chains (or just chained/is ongoing?)
    combo: u32,
    // Infos
    //dino: undefined, // TODO Dino
    //monster: undefined, // TODO Monster
    // pub name: String,

    max_energy: u32,
    energy: u32,
    delete_objects: bool, // true

    // Bonuses
    assaults_bonus: [u32; 5],
    power_bonus: [u32; 5],
    all_assaults_bonus: u32,
    next_assault_bonus: u32,
    next_assault_multiplier: f32,
    assault_multiplier: f32,

    // Special Bonuses
    multi_attack_chance: f32,
    counter_attack_chance: f32,
    dodge_chance: f32,
    minimum_damage: u32,

    minimum_assault_damage: u32,

    // Global time multiplier, i.e speed
    pub time_multiplier: f32,
    // function set_timeMultiplier ?

    // Global time multiplier, i.e speed for each element
    pub time_elements_multipliers: [f32; 5],
    object_chance_multiplier: f32,
    initiative_multiplier: f32,
    recovery_multiplier: f32,

    perception: bool,
    can_fight_intangible: bool,
    can_fight_flying: bool,
    can_escape: bool,
    cancel_armor: bool,
    mark_as_rock: bool,
    costume_flag: bool,
    fly_after_attack: bool,
    super_dodge_chance: f32, // to dodge assault and events

    clone_default_life: u32,
    //next_attack: undefined, // TODO
    //next_event: undefined, // TODO
    //restrictions: undefined, // TODO Array of restriction
    cant_dodge_assault: bool,
    cant_reduce_max_energy: bool,

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
    no_return: bool,
    // status: undefined, // TODO
    balanced: bool,
    castle_attacks: u32,
    // dino_ref: undefined, // TODO
    hypnotized: bool,
    under_fuca: bool,
    invocations: u32,
    has_used_fujin: bool,

    has_whistle: bool
}

//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================

impl Fighter {
// Documented local functions

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Create an array of indexes of the elements of the fighter ordered from biggest to smallest
// PARAMS:  - elements: [u32; 5] - expects the list of elements of the fighter in the following order:
//            Air, Fire, Lightning, Water, Wood
// RETURN:  List of the index of elements ordered from biggest element to smallest
// EXAMPLE:
//          elements: [0, 12, 5, 6, 2]
//          ordered_indexes: [1 (for 12), 3 (for 6), 2 (for 5), 4 (for 2), 0 (for 0)]
//---------------------------------------------------------------------------------------------------------------------
    fn compute_elements_order(elements: [u32; 5]) -> [usize; 5] {
        let mut ordered_elements = elements;
        ordered_elements.sort_by(|a,b| b.cmp(a));
        let mut ordered_indexes = [0; 5];
        // Cannot use iterator in the first loop because the array is modified in the loop
        for i in 0..=ordered_indexes.len()-1 {
            for (j, element) in elements.iter().enumerate() {
                if ordered_elements[i] == *element {
                    ordered_indexes[i] = j;
                }
            }
        }
        ordered_indexes
    }
}

// Un-used & non-documented local functions

//=====================================================================================================================
//                                             EXPORTED FUNCTIONS
//=====================================================================================================================

// impl Copy for Fighter { }

// impl Clone for Fighter {
//     fn clone(&self) -> Fighter {
//         *self
//     }
// }

impl Fighter {
// Documented exported functions

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Create a new Fighter from a configuration
// PARAMS:  - config (FighterConfiguration): Initial configuration of the fighter
//          - fighter_id (usize): The fighter id assigned to this fighter
//          - fighter_side (bool): The side of the fighter - true: attacker, false: defender
// RETURN:  The newly created Fighter entity
//---------------------------------------------------------------------------------------------------------------------
    pub fn from_config(config: &FighterConfiguration, fighter_id: usize, fighter_side: bool) -> Self {
        Self {
            // USed & documented fields
            id: fighter_id,
            dinoz_id: config.dinoz_id,
            side: fighter_side,
            original_side: fighter_side,
            start_life: config.start_life,
            life: config.start_life,
            time: 0,
            elements: config.base_elements,
            elements_order: Self::compute_elements_order(config.base_elements),
            elements_order_index: 0,
            items: config.items.clone(),
            skills: config.skills.clone(),
            status: config.status.clone(),

            // WIP
            armor: 0,
            defense: Self::compute_defenses(config.base_elements),

            // Un-used & non-documented fields
            time_multiplier: 1.0,
            combo: 0,
            object_chance_multiplier: 1.0,
            initiative_multiplier: 1.0,
            //
            default_max_energy: DEFAULT_MAX_ENERGY,
            max_energy: DEFAULT_MAX_ENERGY,
            energy: DEFAULT_MAX_ENERGY,
            recovery_multiplier: 1.0,
            can_fight_flying: false,
            can_fight_intangible: false,
            costume_flag: false,
            delete_objects: true,
            balanced: false,
            fly_after_attack: false,
            hypnotized: false,
            mark_as_rock: false,
            minimum_assault_damage: 1,
            // name: name,
            no_return: false,
            perception: false,
            //
            under_fuca: false,
            time_elements_multipliers: [1.0, 1.0, 1.0, 1.0, 1.0],
            assaults_bonus: [0, 0, 0, 0, 0],
            power_bonus: [0, 0, 0, 0, 0],
            all_assaults_bonus: 0,
            assault_multiplier: 1.0,
            next_assault_bonus: 0,
            next_assault_multiplier: 1.0,
            counter_attack_chance: 1.0,
            multi_attack_chance: 1.0,
            invocations: 1,
            has_used_fujin: false,
            has_whistle: false,
            dodge_chance: 1.0,
            minimum_damage: 1,
            super_dodge_chance: 1.0,
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
            clone_default_life: 1,
            // TODO
            // after_attack: undefined,
            // after_defense: undefined,
            // after_fight: undefined,
            // status: undefined,
            // on_status: undefined,
            // on_kill: undefined,
            // onlost: undefined,
            // before_turn: undefined,
            castle_attacks: 1,
            cancel_armor: false,
            is_locked_element: false,
            cant_dodge_assault: false,
            cant_reduce_max_energy: false,
            can_escape: true,
        }
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Create a new Fighter with default values. Prefer using "from_config" instead
// PARAMS:  - fighter_id (usize): The fighter id assigned to this fighter
//          - life (u32): The start life of the fighter. It cannot be exceeded during a fight
//          - elements ([u32; 5]): The elements of the fighter
//          - side (bool): The side of the fighter - true: attacker, false: defender
// RETURN:  The newly created Fighter entity
//---------------------------------------------------------------------------------------------------------------------
    // Create a new Fighter
    pub fn new(fighter_id: usize, life: u32, elements: [u32; 5], side: bool) -> Self {
        Self {
            // Used & documented fields
            id: fighter_id,
            dinoz_id: 0,
            side,
            original_side: side,
            start_life: life,
            life,
            elements,
            elements_order: Self::compute_elements_order(elements),
            elements_order_index: 0,
            time: 0,
            items: Vec::new(),
            skills: Vec::new(),
            status: Vec::new(),

            // WIP
            armor: 0,
            defense: Self::compute_defenses(elements),

            // Un-used & non-documented fields
            time_multiplier: 1.0,
            combo: 0,
            object_chance_multiplier: 1.0,
            initiative_multiplier: 1.0,
            //
            default_max_energy: DEFAULT_MAX_ENERGY, 
            max_energy: DEFAULT_MAX_ENERGY,
            energy: DEFAULT_MAX_ENERGY,
            recovery_multiplier: 1.0,
            can_fight_flying: false,
            can_fight_intangible: false,
            costume_flag: false,
            delete_objects: true,
            balanced: false,
            fly_after_attack: false,
            hypnotized: false,
            mark_as_rock: false,
            minimum_assault_damage: 1,
            // name: name,
            no_return: false,
            perception: false,
            //
            under_fuca: false,
            time_elements_multipliers: [1.0, 1.0, 1.0, 1.0, 1.0],
            assaults_bonus: [0, 0, 0, 0, 0],
            power_bonus: [0, 0, 0, 0, 0],
            all_assaults_bonus: 0,
            assault_multiplier: 1.0,
            next_assault_bonus: 0,
            next_assault_multiplier: 1.0,
            counter_attack_chance: 1.0,
            multi_attack_chance: 1.0,
            invocations: 1,
            has_used_fujin: false,
            has_whistle: false,
            dodge_chance: 1.0,
            minimum_damage: 1,
            super_dodge_chance: 1.0,
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
            clone_default_life: 1,
            // TODO
            // after_attack: undefined,
            // after_defense: undefined,
            // after_fight: undefined,
            // status: undefined,
            // on_status: undefined,
            // on_kill: undefined,
            // onlost: undefined,
            // before_turn: undefined,
            castle_attacks: 1,
            cancel_armor: false,
            is_locked_element: false,
            cant_dodge_assault: false,
            cant_reduce_max_energy: false,
            can_escape: true,

        }
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Get the index of the current element of the fighter
// PARAMS:  - do_increment (bool): Tells if the index should be moved to the Fighter's next element
// RETURN:  The index of the current element of the fighter
//---------------------------------------------------------------------------------------------------------------------
    pub fn get_current_element_index(&mut self, do_increment: bool) -> usize {
        let current_element_index: usize = self.elements_order[self.elements_order_index];
        if do_increment && !self.is_locked_element {
            self.elements_order_index = (self.elements_order_index + 1) % 5;
        }
        current_element_index
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Calculate defenses of the fighter based on the elements
// PARAMS:  - elements: ([u32; 5]) - expects the list of elements of the fighter in the following order
//            Air, Fire, Lightning, Water, Wood
// RETURN:  An array that corresponds to the defense of the fighter for elements in that following order:
//          Air, Fire, Lightning, Water, Wood, Void
//---------------------------------------------------------------------------------------------------------------------
// TODO consider skills & statuses
    pub fn compute_defenses(elements: [u32; 5]) -> [f32; 6] {
        let mut defense: [f32; 6] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        for i in 0..=4 {
            let mut k: f32 = 0.0;
            for j in 0..=4 {
                k += elements[(i+j)%5] as f32 * DEFENSES[j];
            }
            defense[i] = k;
            defense[ElementsIndexes::Void as usize] += elements[i] as f32;
        }
        defense
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Get the major element (i.e highest) index of the Fighter.
//          For example, if the elements are [4, 3, 8, 1, 2], the result is 2 as in the index of 8.
// PARAMS:  None
// RETURN:  The index of the major element of the fighter 
//---------------------------------------------------------------------------------------------------------------------
    pub fn get_major_element_index(self) -> u32 {
        let mut best: u32 = self.elements[0];
        let mut best_id: u32 = 0;
        for n in 1..=self.elements.len() {
            if self.elements[n] > best {
                best = self.elements[n];
                best_id = n as u32;
            }
        }
        best_id
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Set the maximum energy of the Fighter and returns the value set
// PARAMS:  - value (i32): The new maximum energy of the fighter
// RETURN:  The newly set maximum energy of the fighter
//---------------------------------------------------------------------------------------------------------------------
    pub fn set_max_energy(mut self, value: i32) -> u32 {
        if value > MAXIMUM_MAX_ENERGY as i32 {
            self.max_energy = MAXIMUM_MAX_ENERGY;
        }
        else if value < MINIMUM_MAX_ENERGY as i32 {
            self.max_energy = 1;
        }
        else {
            self.max_energy = value as u32;
        }

        if self.max_energy < DEFAULT_MAX_ENERGY && self.cant_reduce_max_energy {
            self.max_energy = DEFAULT_MAX_ENERGY;
        }
        self.max_energy
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Set the energy of the Fighter and returns the value set. It cannot go above the maximum energy of the
//          Fighter.
// PARAMS:  - value (i32): The new energy of the fighter
// RETURN:  The newly set energy of the fighter
//---------------------------------------------------------------------------------------------------------------------
    pub fn set_energy(mut self, value: i32) -> u32 {
        if value > self.max_energy as i32 {
            self.energy = self.max_energy;
        }
        else if value < 0 {
            self.energy = 0;
        }
        else {
            self.energy = value as u32;
        }
        self.energy
    }

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Make a clone from the Fighter and give it a given Fighter id (fid)
// PARAMS:  - fid (usize): The fighter id to give the clone
//          - start_life (u32): The life of the clone
// RETURN:  A "clone" in game (not Rust clone) of the Fighter
//---------------------------------------------------------------------------------------------------------------------
    pub fn create_clone(self, fid: usize, start_life: u32) -> Fighter {
        let mut c: Fighter = Self::new(fid, start_life, self.elements, self.original_side);
        c.all_assaults_bonus = self.all_assaults_bonus;
        c.armor = self.armor;
        c.assaults_bonus = self.assaults_bonus;
        c.can_fight_flying = self.can_fight_flying;
        c.can_fight_intangible = self.can_fight_intangible;
        c.cancel_armor = self.cancel_armor;
        c.counter_attack_chance = self.counter_attack_chance;
        c.defense = self.defense;
        c.super_dodge_chance = self.super_dodge_chance;
        c.mark_as_rock = self.mark_as_rock;
        c.minimum_damage = self.minimum_damage;
        c.minimum_assault_damage = self.minimum_assault_damage;
        // todo c.monster = self.monster;
        c.multi_attack_chance = self.multi_attack_chance;
        c.object_chance_multiplier = self.object_chance_multiplier;
        c.perception = self.perception;
        c.power_bonus = self.power_bonus;
        c.side = self.side;
        c.time_multiplier = self.time_multiplier;
        c.time_elements_multipliers = self.time_elements_multipliers;
        c.start_life = self.start_life;
        c.time = self.time;
        c.balanced = self.balanced;
        // todo
        // if (self.dino != null) {
        //     c.dino_ref = self.dino;
        // }
        // if (self.dino_ref != null) {
        //     c.dino_ref = self.dino_ref;
        // }
        c
    }

    // Un-used & non-documented exported functions

}
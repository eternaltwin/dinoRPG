//=====================================================================================================================
// FILE:      main.rs
// PURPOSE:   This file is for testing the rust code without going through the Node/JS stack. It may not be up to date.
//            To build the following command in the environment (you may have to be in the docker env with "make bash"):
//            cargo build --bin main
//            The output will then be in: "target/debug"
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

use log::{debug, info};
use std::env; // add trace, debug, warn, error as needed

use crate::fight::manager::{FightResult, Manager, ManagerConfiguration};

pub mod fight;

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const RUST_LOG: &str = "RUST_LOG";

//=====================================================================================================================
//                                             LOCAL TYPES
//=====================================================================================================================

//=====================================================================================================================
//                                             EXPORTED TYPES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL VARIABLES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Main of the program. Edit the "json_example" to give it parameters.
// PARAMS:  N/A
// RETURN:  None
//---------------------------------------------------------------------------------------------------------------------
fn main() {
    // Check if RUST_LOG has been set, if not, use a default value: error for release, debug for debug
    if env::var(RUST_LOG).is_err() {
        if cfg!(debug_assertions) {
            env::set_var(RUST_LOG, "DEBUG");
        } else {
            env::set_var(RUST_LOG, "ERROR");
        }
    }
    // Initialize logger for the rest of the execution
    env_logger::init();

    let json_example = r#"{
        "is_energy_enabled": true,
        "can_use_equipment": true,
        "can_use_permanent_equipment_only": false,
        "can_use_capture": true,
        "can_delete_objects": true,
        "is_balance_enabled": true,
        "attackers": [
            {
                "dinoz_id": 123,
                "ftype": "Dinoz",
                "display": "",
                "name": "FireBoy",
                "start_life": 100,
                "base_elements": [
                    4,
                    0,
                    0,
                    0,
                    0
                ],
                "items": [
                ],
                "skills": [
                    11204,
                    11408,
                    31101,
                    11201,
                    11303
                ],
                "status": [
                ],
                "attack_bonus": 0,
                "defense_bonus": 0
            },
            {
                "dinoz_id": 124,
                "ftype": "Dinoz",
                "display": "",
                "name": "bob",
                "start_life": 100,
                "base_elements": [
                    0,
                    2,
                    0,
                    0,
                    0
                ],
                "items": [
                ],
                "skills": [
                ],
                "status": [
                ],
                "attack_bonus": 0,
                "defense_bonus": 0
            }
        ],
        "defenders": [
            {
                "dinoz_id": 22,
                "ftype": "Dinoz",
                "display": "",
                "name": "kevin",
                "start_life": 100,
                "base_elements": [
                    0,
                    0,
                    1,
                    1,
                    0
                ],
                "items": [
                ],
                "skills": [
                    11203,
                    11204,
                    11208,
                    "hbkjn",
                    123567,
                    51506,
                    31101
                ],
                "status": [
                ],
                "attack_bonus": 0,
                "defense_bonus": 0
            },
            {
                "dinoz_id": 23,
                "ftype": "Monster",
                "display": "",
                "name": "mega water goupignon",
                "start_life": 50,
                "base_elements": [
                    0,
                    0,
                    3,
                    0,
                    0
                ],
                "items": [
                ],
                "skills": [
                    31101,
                    31202,
                    31201
                ],
                "status": [
                ],
                "attack_bonus": 0,
                "defense_bonus": 5
            }
        ]
    }"#;

    let mngr_opt: ManagerConfiguration =
        serde_json::from_str(json_example).expect("JSON not well formatted");
    info!("{:#?}", mngr_opt);

    let mut mngr: Manager = Manager::from_configuration(mngr_opt);
    debug!("{:#?}", mngr);
    mngr.execute_fight();
    // Get the result and print it
    let result: FightResult = mngr.get_fight_result();
    debug!("{:}", serde_json::to_string(&result).unwrap());
    info!("{}", result.history());
}

//=====================================================================================================================
//                                             EXPORTED FUNCTIONS
//=====================================================================================================================

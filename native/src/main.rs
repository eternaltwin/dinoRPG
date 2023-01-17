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

extern crate log;
use log::{info}; // add trace, debug, warn, error as needed
use std::env;

use crate::fight::manager::{Manager, ManagerConfiguration};

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
        }
        else {
            env::set_var(RUST_LOG, "ERROR");
        }
    }
    // Initiliaze logger for the rest of the execution
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
                "start_life": 98,
                "base_elements": [
                    1,
                    1,
                    1,
                    1,
                    1
                ],
                "items": [
                    1,
                    12,
                    48
                ],
                "skills": [
                    3,
                    34,
                    789
                ],
                "status": [
                    3,
                    5
                ]
            }
        ],
        "defenders": [
            {
                "dinoz_id": 22,
                "start_life": 128,
                "base_elements": [
                    1,
                    2,
                    3,
                    4,
                    5
                ],
                "items": [
                    3,
                    15,
                    33
                ],
                "skills": [
                    8,
                    9,
                    11
                ],
                "status": [
                ]
            },
            {
                "dinoz_id": 23,
                "start_life": 18,
                "base_elements": [
                    1,
                    2,
                    1,
                    1,
                    1
                ],
                "items": [
                ],
                "skills": [
                ],
                "status": [
                    2
                ]
            }
        ]
    }"#;

    let mngr_opt: ManagerConfiguration = serde_json::from_str(json_example).expect("JSON not well formatted");

    info!("{:#?}", mngr_opt);

    let mut mngr: Manager = Manager::from_configuration(mngr_opt);
    // mngr.add_new_fighter(100, [1, 1, 1, 1, 1], true);
    // mngr.add_new_fighter(100, [1, 1, 1, 1, 1], false);
    mngr.execute_fight();
}

//=====================================================================================================================
//                                             EXPORTED FUNCTIONS
//=====================================================================================================================

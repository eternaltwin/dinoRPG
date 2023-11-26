//=====================================================================================================================
// FILE:      lib.rs
// PURPOSE:   This file makes the link between the Node backend and the rust backend with Neon.
//            To build, use the following command in the environment (you may have to be in the docker env with "make bash"):
//            cargo build --release
//            Then rebuild the Node backend so that it takes into account the new lib
// COPYRIGHT:
//=====================================================================================================================

//=====================================================================================================================
//                                             IMPORTED ITEMS
//=====================================================================================================================

use log::{debug, info}; // add trace, warn and error as needed
use neon::prelude::*;
use rand::prelude::*;
use std::env;

pub mod fight;

use crate::fight::manager::{FightResult, Manager, ManagerConfiguration};

//=====================================================================================================================
//                                             LOCAL TYPES
//=====================================================================================================================

//=====================================================================================================================
//                                             EXPORTED TYPES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL CONSTANTS
//=====================================================================================================================

const RUST_LOG: &str = "RUST_LOG";

//=====================================================================================================================
//                                             LOCAL VARIABLES
//=====================================================================================================================

//=====================================================================================================================
//                                             LOCAL FUNCTIONS
//=====================================================================================================================

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: API to generate a random number
// PARAMS:  - cx (FunctionContext): Not actually used
// RETURN: Random number between 1 and 20
//---------------------------------------------------------------------------------------------------------------------
fn randomizer(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let mut rng = rand::thread_rng();
    Ok(cx.number(rng.gen_range(1..20)))
}

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: API for Node to process a fight
// PARAMS:  - cx (FunctionContext): The context that notable contains JsString: Configuration of the fight in JSON
//            format that matches the structure ManagerConfiguration
// RETURN:  JsString: Result of the fight in JSON format that matches the FightResult structure
//---------------------------------------------------------------------------------------------------------------------
fn fight_rust(mut cx: FunctionContext) -> JsResult<JsString> {
    info!("Calling fight_rust");
    // Parse the configuration
    let configuration_json = cx.argument::<JsString>(0)?;
    let manager_configuration: ManagerConfiguration =
        serde_json::from_str(&configuration_json.value(&mut cx)).expect("JSON not well formatted");
    debug!("{:#?}", manager_configuration);
    // Start the fight manager with the configuration
    let mut mngr: Manager = Manager::from_configuration(manager_configuration);
    // Execute the fight
    mngr.execute_fight();
    // Get the result and send it back to Node.
    let result: FightResult = mngr.get_fight_result();
    let result_handle: Handle<JsString> = cx.string(serde_json::to_string(&result).unwrap());
    Ok(result_handle)
}

//---------------------------------------------------------------------------------------------------------------------
// PURPOSE: Export the function to Neon so that they can be used by the Node backend
// PARAMS:  - cx (ModuleContext): mutable context
// RETURN:  NeonResult: Result according to Neon API
//---------------------------------------------------------------------------------------------------------------------
#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    // Check if RUST_LOG has been set; if not, then use a default value: error for release, debug for debug
    if env::var(RUST_LOG).is_err() {
        if cfg!(debug_assertions) {
            env::set_var(RUST_LOG, "DEBUG");
        } else {
            env::set_var(RUST_LOG, "ERROR");
        }
    }
    // Initiliaze logger here so that it is initialized only once for the rest of the execution
    env_logger::init();

    cx.export_function("randomizer", randomizer)?;
    cx.export_function("fight_rust", fight_rust)?;
    Ok(())
}

//=====================================================================================================================
//                                             EXPORTED FUNCTIONS
//=====================================================================================================================

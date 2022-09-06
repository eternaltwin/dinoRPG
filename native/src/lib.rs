use neon::prelude::*;
use rand::prelude::*;

fn randomizer(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let mut rng = rand::thread_rng();
    Ok(cx.number(rng.gen_range(1..20)))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("randomizer", randomizer)?;
    Ok(())
}

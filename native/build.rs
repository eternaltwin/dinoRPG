fn main() {
    neon_build::Setup::options()
        .output_dir("./")
        .output_file("index.node")
        .setup();
}

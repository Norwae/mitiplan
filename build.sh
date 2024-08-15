#!/bin/bash

cargo build --release --target=x86_64-unknown-linux-musl &&
zip -j target/timeline.zip bootstrap target/x86_64-unknown-linux-musl/release/timeline
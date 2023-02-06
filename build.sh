#!/bin/bash

# Install NodeJS and NPM
sudo apt update
sudo apt install nodejs npm

# Install Rust and Circom
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

cd ..

# Install deps for c++ code
sudo apt-get update
sudo apt-get install --yes build-essential libgmp-dev libsodium-dev nlohmann-json3-dev  nasm git

# Install repo 
npm install

# Compile circuit
circom hash.circom --r1cs --wasm --sym --c

# Compile c++ code
cd hash_cpp
make 

# Generate the witness
cd .. 
hash_cpp/hash input.json witness.wtns

#!/bin/bash
sudo apt-get update
sudo apt-get install --yes build-essential libgmp-dev libsodium-dev nlohmann-json3-dev  nasm git

npm install

circom hash.circom --r1cs --wasm --sym --c

cd hash_cpp
make 

cd.. 
hash_cpp/hash input.json witness.wtns

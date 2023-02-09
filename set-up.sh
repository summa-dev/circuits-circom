#!/bin/bash
echo "****INSTALL RUST****"
start=`date +%s`
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****INSTALL CIRCOM****"
start=`date +%s`
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****INSTALL NODEJS AND NPM****"
start=`date +%s`
sudo apt update
sudo apt install nodejs npm
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****INSTALL DEPS FOR C++ WITNESS GENERATION****"
start=`date +%s`
sudo apt-get update
sudo apt-get install --yes build-essential libgmp-dev libsodium-dev nlohmann-json3-dev nasm gitend=`date +%s`
echo "DONE ($((end-start))s)"

echo "****CLONE PYT REPO AND INSTALL DEPS****"
start=`date +%s`
git clone https://github.com/pan-y-tomate/pyt-circuits.git
cd pyt-circuits/
git checkout test-branch
npm install
echo "DONE ($((end-start))s)"
#!/bin/bash
PHASE1=powersOfTau28_hez_final_18.ptau
BUILD_DIR=./build
CIRCUIT_PATH=./circuits/pos-merkle-proof.circom
CIRCUIT_NAME=pos-merkle-proof

if [ -f "$PHASE1" ]; then
    echo "Found Phase 1 ptau file"
else
    echo "No Phase 1 ptau file found. downloading powersOfTau28_hez_final_18.ptau ..."
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_18.ptau
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo "****COMPILING CIRCUIT****"
start=`date +%s`
circom "$CIRCUIT_PATH" --r1cs --wasm --sym --wat --output "$BUILD_DIR"
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
start=`date +%s`
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm scripts/sample_input.json "$BUILD_DIR"/witness.wtns
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****EXPORTING WITNESS TO JSON ****"
start=`date +%s`
snarkjs wtns export json "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/witness.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****SET UP"
start=`date +%s`
snarkjs pks "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$PHASE1" "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****EXPORTING VKEY****"
start=`date +%s`
snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey "$BUILD_DIR"/vkey.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
start=`date +%s`
snarkjs plonk prove "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****VERIFYING PROOF FOR SAMPLE INPUT****"
start=`date +%s`
snarkjs plonk verify  "$BUILD_DIR"/vkey.json "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json
end=`date +%s`
echo "DONE ($((end-start))s)"
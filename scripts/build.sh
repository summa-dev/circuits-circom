#!/bin/bash
PHASE1=powersOfTau28_hez_final_$1.ptau
BUILD_DIR=./build
CIRCUIT_PATH=./scripts/input/$2.circom
CIRCUIT_NAME=$2

if [ -f "$PHASE1" ]; then
    echo "Found Phase 1 ptau file"
else
    echo "No Phase 1 ptau file found. downloading $PHASE1 ..."
    wget https://hermez.s3-eu-west-1.amazonaws.com/"$PHASE1"
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo "****COMPILING CIRCUIT****"
start=`date +%s`
circom "$CIRCUIT_PATH" --r1cs --c --sym --wat --output "$BUILD_DIR"
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****BUILD INPUT****"
start=`date +%s
node input.js
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****BUILD C++ WITNESS GENERATOR****"
start=`date +%s`
cd "$BUILD_DIR"/"$CIRCUIT_NAME"_cpp
make
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
start=`date +%s`
cd ..
cd ..
/"$BUILD_DIR"/"$CIRCUIT_NAME"_cpp/"$CIRCUIT_NAME" input.json "$BUILD_DIR"/"$CIRCUIT_NAME"_cpp/witness.wtns
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****EXPORTING WITNESS TO JSON ****"
start=`date +%s`
snarkjs wtns export json "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/witness.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATING ZKEY 0****"
start=`date +%s`
set -x
snarkjs groth16 setup "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$PHASE1" "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey -v
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****CONTRIBUTE TO THE PHASE 2 CEREMONY****"
start=`date +%s`
snarkjs zkey contribute "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey --name="1st Contributor Name"
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****PROVIDE A SECOND CONTRIBUTION****"
start=`date +%s`
set -x
snarkjs zkey contribute "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_2.zkey --name="Second contribution Name" -v
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATE FINAL ZKEY APPLYING A RANDOM BEACON****"
start=`date +%s`
set -x
snarkjs zkey beacon "$BUILD_DIR"/"$CIRCUIT_NAME"_2.zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****VERIFY FINAL ZKEY****"
start=`date +%s`
set -x
snarkjs zkey verify  "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$PHASE1" "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****EXPORTING VKEY****"
start=`date +%s`
snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey "$BUILD_DIR"/vkey.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
start=`date +%s`
snarkjs groth16 prove "$BUILD_DIR"/"$CIRCUIT_NAME"_final.zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json
end=`date +%s`
echo "DONE ($((end-start))s)"

echo "****VERIFYING PROOF FOR SAMPLE INPUT****"
start=`date +%s`
snarkjs groth16 verify "$BUILD_DIR"/vkey.json "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json
end=`date +%s`
echo "DONE ($((end-start))s)"
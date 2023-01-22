pragma circom 2.1.3;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Takes a user entry as input (username, balance) and outputs a hash of it (leafHash)
template ToLeafHash() {

    signal input username;
    signal input balance;

    signal output out;

    component poseidonHasher = PoseidonHasher(2);

    poseidonHasher.in[0] <== username;
    poseidonHasher.in[1] <== balance;

    out <== poseidonHasher.out;
}

template PoseidonHasher(nInputs) {

    signal input in[nInputs];
    signal output out;

    component hasher = Poseidon(nInputs);

    for (var i = 0; i < nInputs; i ++) {
        hasher.inputs[i] <== in[i];
    }

    out <== hasher.out;
}
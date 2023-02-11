pragma circom 2.0.9;

include "../node_modules/circomlib/circuits/poseidon.circom";

template HashLeftRight() {
    signal input left;
    signal input right;

    signal output hash;

    component hasher = PoseidonHasher(2);

    left ==> hasher.in[0];
    right ==> hasher.in[1];

    hash <== hasher.out;
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
pragma circom 2.1.3;

include "./node_modules/circomlib/circuits/poseidon.circom";

// From https://github.com/privacy-scaling-explorations/incrementalquintree/blob/master/circom/incrementalMerkleTree.circom
// Given a Merkle root and a list of leaves output the root
template MerkleTreeBuilder() {

    signal input leaves[1000];

    // Declare the hashers component;
    component hashers[500];

    // Instantiate all hashers components;
    var i;
    for (i=0; i < 500; i++) {
        hashers[i] = HashLeftRight();
        hashers[i].left <== leaves[i*2];
        hashers[i].right <== leaves[i*2+1];
    }
}

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

component main = MerkleTreeBuilder();

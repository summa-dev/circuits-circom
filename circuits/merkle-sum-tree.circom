pragma circom 2.1.3;

include "./hasher.circom";
include "./safe-cex.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

// Computes the next level of the merkle sum tree, namely poseidon hash and the next sum given the current hash and sum, the sibling hash and sum, and the path index
template NextMerkleSumTreeLevel() {

    signal input hash;
    signal input sum; 
    signal input siblingHash;
    signal input siblingSum;
    signal input pathIndex;

    signal output nextHash;
    signal output nextSum;

    component poseidonHasher = PoseidonHasher(4);
    component mux = MultiMux1(4);

    mux.c[0][0] <== hash;
    mux.c[1][0] <== sum;
    mux.c[2][0] <== siblingHash;
    mux.c[3][0] <== siblingSum;

    mux.c[0][1] <== siblingHash;
    mux.c[1][1] <== siblingSum;
    mux.c[2][1] <== hash;
    mux.c[3][1] <== sum;

    // according to the index of the path, mux selects which leaf is left and which is right to perform the hash
    // If the path index is 0, then the left leaf is the current hash and the right leaf is the sibling hash.
    mux.s <== pathIndex;

    // poseidon takes the inputs in the following order: [leftHash, leftSum, rightHash, rightSum]
    poseidonHasher.in[0] <== mux.out[0];
    poseidonHasher.in[1] <== mux.out[1];
    poseidonHasher.in[2] <== mux.out[2];
    poseidonHasher.in[3] <== mux.out[3];

    // instantiate the SafeSum component 
    component safeSum = SafeSum();

    safeSum.in[0] <== mux.out[1];
    safeSum.in[1] <== mux.out[3];

    // output the result of the poseidon hash and sum which is [leftSum + rightSum]
    nextHash <== poseidonHasher.out;
    nextSum <== safeSum.out;
}
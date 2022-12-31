// Fork from semaphore https://github.com/semaphore-protocol/semaphore/blob/main/packages/circuits/tree.circom 
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template MerkleTreeInclusionProof(nLevels) {
    signal input rootHash;
    signal input rootSum;
    signal input leafHash;
    signal input leafSum;
    signal input pathIndices[nLevels];
    signal input siblingsHashes[nLevels];
    signal input siblingsSums[nLevels];

    component nextLevel[nLevels];

    // Create array of hashes and sums to store progressive hashes and sums of the computation
    signal hashes[nLevels + 1];
    signal sums[nLevels + 1];

    // Initialize the first hash and sum corresponding to the leaf that we want to prove inclusion for
    hashes[0] <== leafHash;
    sums[0] <== leafSum;

    // Iterate over the levels of the tree until the root
    for (var i = 0; i < nLevels; i++) {

        nextLevel[i] = nextLevel();

        // Check that the path indices are either 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        // Pass in the inputs to the nextLevel component that computes the next hash and sum
        nextLevel[i].hash <== hashes[i];
        nextLevel[i].sum <== sums[i];
        nextLevel[i].siblingHash <== siblingsHashes[i];
        nextLevel[i].siblingSum <== siblingsSums[i];
        nextLevel[i].pathIndex <== pathIndices[i];

        // Store the next hash and sum in the arrays
        hashes[i + 1] <== nextLevel[i].nextHash;
        sums[i + 1] <== nextLevel[i].nextSum;

    }

    // The last hash of the computation should be equal to the root hash
    rootHash === hashes[nLevels];

    // The total sum of the computation should be equal to the root sum
    rootSum === sums[nLevels];
}

// Computes the next poseidon hash and the next sum given the current hash and sum, the sibling hash and sum, and the path index
template nextLevel() {

    signal input hash;
    signal input sum; 
    signal input siblingHash;
    signal input siblingSum;
    signal input pathIndex;

    signal output nextHash;
    signal output nextSum;

    component poseidon = Poseidon(4);
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
    poseidon.inputs[0] <== mux.out[0];
    poseidon.inputs[1] <== mux.out[1];
    poseidon.inputs[2] <== mux.out[2];
    poseidon.inputs[3] <== mux.out[3];

    // output the result of the poseidon hash and sum which is [leftSum + rightSum]
    nextHash <== poseidon.out;
    nextSum <== mux.out[1] + mux.out[3];
}

component main = MerkleTreeInclusionProof(16);

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

    hashes[0] <== leafHash;
    sums[0] <== leafSum;

    for (var i = 0; i < nLevels; i++) {

        nextLevel[i] = nextLevel();

        // Check that the path indices are either 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        // Compute the next hash and sum
        nextLevel[i].hash <== hashes[i];
        nextLevel[i].sum <== sums[i];
        nextLevel[i].siblingHash <== siblingsHashes[i];
        nextLevel[i].siblingSum <== siblingsSums[i];
        nextLevel[i].pathIndex <== pathIndices[i];

        hashes[i + 1] <== nextLevel[i].nextHash;
        sums[i + 1] <== nextLevel[i].nextSum;

    }

    // The last hash of the computation should be equal to the root hash
    rootHash === hashes[nLevels];

    // The total sum of the computation should be equal to the root sum
    rootSum === sums[nLevels];
}

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

    mux.s <== pathIndex;

    poseidon.inputs[0] <== mux.out[0];
    poseidon.inputs[1] <== mux.out[1];
    poseidon.inputs[2] <== mux.out[2];
    poseidon.inputs[3] <== mux.out[3];

    nextHash <== poseidon.out;
    nextSum <== mux.out[1] + mux.out[3];

}

component main = MerkleTreeInclusionProof(16);

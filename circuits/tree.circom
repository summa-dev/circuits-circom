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

    component poseidons[nLevels];
    component mux[nLevels];

    // Create array of hashes and sums to store progressive hashes and sums of the computation
    signal hashes[nLevels + 1];
    signal sums[nLevels + 1];

    hashes[0] <== leafHash;
    sums[0] <== leafSum;

    for (var i = 0; i < nLevels; i++) {
        // Check that the path indices are either 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];

        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    // The last hash of the computation should be equal to the root
    root === hashes[nLevels];
}

component main = MerkleTreeInclusionProof(16);

pragma circom 2.1.3;

include "./hasher.circom";
include "./merkle-sum-tree.circom";
include "./safe-cex.circom";

template PytPos(nLevels) {

    signal input rootHash;
    signal input username;
    signal input balance;
    signal input pathIndices[nLevels];
    signal input siblingsHashes[nLevels];
    signal input siblingsSums[nLevels];
    signal input assetsSum;

    signal output leafHash;

    component toLeafHash = ToLeafHash();
    component nextMstLevel[nLevels];
    component safeEqLessThan = SafeLessEqThan(252);

    // compute the leafHash from the username and balance
    toLeafHash.username <== username;
    toLeafHash.balance <== balance;

    leafHash <== toLeafHash.out;

    // Create array of hashes and sums to store progressive hashes and sums of the computation
    signal hashes[nLevels + 1];
    signal sums[nLevels + 1];

    // Initialize the first hash and balance corresponding to the entry that we want to prove inclusion for
    hashes[0] <== toLeafHash.out;
    sums[0] <== balance;

    // Iterate over the levels of the tree until the root
    for (var i = 0; i < nLevels; i++) {

        nextMstLevel[i] = NextMerkleSumTreeLevel();

        // Check that the path indices are either 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        // Pass in the inputs to the nextMstLevel component that computes the next hash and sum
        nextMstLevel[i].hash <== hashes[i];
        nextMstLevel[i].sum <== sums[i];
        nextMstLevel[i].siblingHash <== siblingsHashes[i];
        nextMstLevel[i].siblingSum <== siblingsSums[i];
        nextMstLevel[i].pathIndex <== pathIndices[i];

        // Store the next hash and sum in the arrays
        hashes[i + 1] <== nextMstLevel[i].nextHash;
        sums[i + 1] <== nextMstLevel[i].nextSum;

    }

    // The last hash of the computation should be equal to the root hash
    rootHash === hashes[nLevels];

    // The total sum of the liabilities should be less or equal to the total assets in order to prove solvency
    safeEqLessThan.in[0] <== sums[nLevels];
    safeEqLessThan.in[1] <== assetsSum;

    safeEqLessThan.out === 1;
}

component main {public [rootHash, assetsSum]} = PytPos(16);

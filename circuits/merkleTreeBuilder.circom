pragma circom 2.0.9;

// From https://github.com/privacy-scaling-explorations/incrementalquintree/blob/master/circom/incrementalMerkleTree.circom
// Given a Merkle root and a list of leaves output the root
template MerkleTreeBuilder(levels) {

    var totalLeaves = 2**levels;

    signal input leaves[totalLeaves];
    signal output root;

    // The number of leafHasher operations to be performed. Namely, hashing 2 leaves together to get to a intermediary node. 
    var numLeafHashers = totalLeaves / 2;

    // The number of intermediateHasher operations to be performed. Namely, hashing 2 intermediary nodes together to get to the next level intermediary node. 
    var numIntermediateHashers = numLeafHashers - 1;

    // The number of hashers components to be intantiated
    var numHashers = numLeafHashers + numIntermediateHashers;

    // Declare the hashers component;
    component hashers[numHashers];

    // Instantiate all hashers components;
    var i;
    for (i=0; i < numHashers; i++) {
        hashers[i] = parallel HashLeftRight();
    }

    // Wire the leaves into the (leaf) hashers
    for (i=0; i < numLeafHashers; i++){
        hashers[i].left <== leaves[i*2];
        hashers[i].right <== leaves[i*2+1];
    }

    // Wire the outputs of the (leaf) hashers to the intermediate hasher inputs
    var k = 0;
    for (i=numLeafHashers; i<numLeafHashers + numIntermediateHashers; i++) {
        hashers[i].left <== hashers[k*2].hash;
        hashers[i].right <== hashers[k*2+1].hash;
        k++;
    }

    // Wire the output of the final hash to the root (circuit's output)
    root <== hashers[numHashers-1].hash;
}
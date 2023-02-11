pragma circom 2.0.9;

include "./hasher.circom";
include "./merkleTreeBuilder.circom";
include "./safeSum.circom";

// Build Proof of Liabilities for an exchange
template PytProofOfLiabilities(levels) {

    var totalUsers = 2 ** levels;

    signal input usernames[totalUsers]; // array of usernames converted to bigInt
    signal input salts[totalUsers]; // array of salts
    signal input balances[totalUsers]; // array of balances

    signal output treeRoot; // root of the merkle tree of user's entries
    signal output liabilitiesSum; // sum of all the balances of the users

    signal leaves[totalUsers];

    component entryToLeaf[totalUsers];

    for (var i = 0; i < totalUsers; i++) {
        entryToLeaf[i] = PoseidonHasher(3);
        entryToLeaf[i].in[0] <== usernames[i];
        entryToLeaf[i].in[1] <== salts[i];
        entryToLeaf[i].in[2] <== balances[i];
        leaves[i] <== entryToLeaf[i].out;
    }

    // Build the tree starting from the leaves
    component merkleTreeBuilder = MerkleTreeBuilder(levels);

    for (var i = 0; i < totalUsers; i++) {
        merkleTreeBuilder.leaves[i] <== leaves[i];
    }

    treeRoot <== merkleTreeBuilder.root;

    component sum = SafeSum(totalUsers);

    for (var i = 0; i < totalUsers; i++) {
        sum.in[i] <== balances[i];
    }

    liabilitiesSum <== sum.out;
}


// Takes a user entry as input (username, salt, balance) and outputs the leaf of the merkle tree
template entryToLeaf() {

    signal input username;
    signal input salt;
    signal input balance;

    signal output userCombo;

    component poseidonHasher = PoseidonHasher(3);

    poseidonHasher.inputs[0] <== username;
    poseidonHasher.inputs[1] <== salt;
    poseidonHasher.inputs[2] <== balance;

    userCombo <== poseidonHasher.out;
}

component main = PytProofOfLiabilities(2);

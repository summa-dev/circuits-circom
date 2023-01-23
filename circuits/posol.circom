pragma circom 2.0.9;

include "./hasher.circom";
include "./merkleTreeBuilder.circom";
include "./safeCex.circom";

// Build Proof of Solvency for an exchange with n users
template PoSol(n) {

    signal input usernamesToBigInt[n]; // array of usernames converted to bigInt
    signal input salts[n]; // array of salts
    signal input balances[n]; // array of balances
    signal input assetsSum; // sum of all assets owned by the exchange 

    signal output userCombostreeRoot; // root of the merkle tree of userCombos

    // perform the hash of each user's entry to get the userCombo 
    signal userCombos[n + 1 \ 2];

    // is this quotient correct?

    // Declare the toUserCombos component;
    component toUserCombos[n + 1 \ 2];

    for (var i = 0; i < n + 1 \ 2; i++) {
        toUserCombos[i] = PoseidonHasher(3);
        toUserCombos[i].in[0] <== usernamesToBigInt[i];
        toUserCombos[i].in[1] <== salts[i];
        toUserCombos[i].in[2] <== balances[i];
        userCombos[i] <== toUserCombos[i].out;
    }

    // Build the tree starting from the leaves (userCombos)
    component merkleTreeBuilder = MerkleTreeBuilder(n + 1 \ 2);

    for (var i = 0; i < n + 1 \ 2; i++) {
        merkleTreeBuilder.leaves[i] <== userCombos[i];
    }

    userCombostreeRoot <== merkleTreeBuilder.root;

    // compute total liabilites of the exchange 
    signal liabilitiesSum;

    component sum = SafeSum(n);

    for (var i = 0; i < n; i++) {
        sum.in[i] <== balances[i];
    }

    liabilitiesSum <== sum.out;

    // check that the total assets are greater than the total liabilities using SafeLessEqThan
    component safeEqLessThan = SafeLessEqThan(252);

    safeEqLessThan.in[0] <== liabilitiesSum;
    safeEqLessThan.in[1] <== assetsSum;

    safeEqLessThan.out === 1;

}


// Takes a user entry as input (username, salt, balance) and outputs a hash of it (userCombo)
template toUserCombo() {

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
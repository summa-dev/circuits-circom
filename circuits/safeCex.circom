pragma circom 2.0.9;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


template SafeSum(n) {

    signal input in[n];
    signal output out;

    var sum = 0; 

    // Declare the inRanges component;
    component inRanges[n];

    // loop over the values and incrementally sum them together 
    // for each cycle perform the range checks over the inputs of the sum
    for (var i = 0; i < n; i++) {
        inRanges[i] = Num2Bits(252);
        inRanges[i].in <== in[i];
        sum += in[i];
    }

    out <== sum;
}

// Safely compare two n-bit numbers 
// Performs range checks on the inputs to avoid overflow. Range is n <= 252
template SafeLessEqThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component aInRange = Num2Bits(n);
    aInRange.in <== in[0];
    component bInRange = Num2Bits(n);
    bInRange.in <== in[1];

    component lt = LessThan(n);

    lt.in[0] <== in[0];
    lt.in[1] <== in[1] + 1;

    out <== lt.out;
}
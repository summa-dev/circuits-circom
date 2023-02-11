pragma circom 2.1.3;

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
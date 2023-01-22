pragma circom 2.0.9;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// SafeSum performs a sum between two numbers preventing overflow
// Performs range checks on the inputs to avoid overflow. Range is n <= 252
// Overflow happen when the sum of two numbers is greater than p = 21888242871839275222246405745257275088548364400416034343698204186575808495617 (which is a value between 2^253 and 2^254)
// This can be done prevented performing range checks. The range check is performed passing a value inside `num2Bits(252).`If both the addendum are less then 2**252. The result will never overflow.
// The limit scenario is that both the addendums are 2**252 - 1 (which is the maximum value that is accepted in the range check).

    // 2**252 - 1 
    // 7237005577332262213973186563042994240829374041602535252466099000494570602495
        
    // 2**252 - 1 + 2**252 - 1
    // 14474011154664524427946373126085988481658748083205070504932198000989141204990
    
    // which is less than the p (value at which the sum will overflow wrapping back to 0)
    
// Therefore as long as both the addendums are in the range check the sum will never overflow the prime.
template SafeSum() {

    signal input in[2];
    signal output out;

    var sum = 0; 

    // Declare the inRanges component;
    component inRanges[2];

    // Perform the range checks over the inputs of the sum
    inRanges[0] = Num2Bits(252);
    inRanges[0].in <== in[0];
    sum += in[0];

    inRanges[1] = Num2Bits(252);
    inRanges[1].in <== in[1];
    sum += in[1];

    out <== sum;
}

// Safely compare two n-bit numbers 
// Performs range checks on the inputs to avoid overflow. Range is n <= 252
// Discussed here => https://github.com/iden3/circomlib/pull/86#pullrequestreview-1252488037 
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
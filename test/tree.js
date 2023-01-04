const path = require("path");
const {assert} = require("chai");
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const { IncrementalMerkleSumTree } = require("ts-merkle-sum-tree")
const { poseidon } = require("circomlibjs") // v0.0.8

describe("Tree Testing", function async() {


    beforeEach(async function () {
        this.timeout(100000);
        circuit = await wasm_tester(path.join(__dirname, "../circuits", "pos-merkle-proof.circom"));

        // Create tree and insert 10 leaves
        tree = new IncrementalMerkleSumTree(poseidon, 16) // Binary tree with 16 levels and poseidon hash function

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // create a valid proof of inclusion for leaf 5
        proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add targetSum
        proof.targetSum = BigInt(125)

    });

    it("should verify a  proof of inclusion", async () => {

        // // Calculate the witness

        let witness = await circuit.calculateWitness(proof);
        await circuit.checkConstraints(witness);
    });

    it("shouldn't verify an invalid proof of inclusion based on an invalid root", async () => {

        // Invalidate the root
        proof.rootHash = proof.rootHash + 1n

        try {
            let witness = await circuit.calculateWitness(proof);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_80 line: 51")
        }
    });


    it("shouldn't verify an invalid proof of inclusion based on a merkle sum greater than the target sum", async () => {

        // the total sum of the tree is equal to 55
        const totalSum = tree.root.sum

        assert.equal(totalSum, 55n)

        // modify targetSum 
        proof.targetSum = BigInt(50)

        try {
            let witness = await circuit.calculateWitness(proof);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_80 line: 58")
        }

    });

    it("should verify a proof of inclusion based on a merkle sum equal to the target sum", async () => {

        // modify targetSum 
        proof.targetSum = BigInt(55)

        // Calculate the witness
        let witness = await circuit.calculateWitness(proof);

        await circuit.checkConstraints(witness);
        
    });

    it("shouldn't let pass a value that overflows as leaf sum", async () => {

        // replace leafSum with a negative value
        proof.leafSum = exports.p - BigInt(1)

        try {
            let witness = await circuit.calculateWitness(proof);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(60, 99), "Error in template nextLevel_79 line: 76")
        }

    });

    it("shouldn't let pass a negative value inside the siblingsSums", async () => {

        // add a negative value to siblingsSums
        proof.siblingsSums[2] = BigInt(-1)

        try {
            let witness = await circuit.calculateWitness(proof);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(60, 99), "Error in template nextLevel_79 line: 79")
        }

        await circuit.calculateWitness(proof).catch((e) => {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });


    // it("shouldn't let pass a proof that overflow the prime when computing the sum", async () => {

    //     // leafsum + proof.siblingsSums[0] should overflow the prime
    //     proof.siblingsSums[0] = BigInt(2 ** 252 - 5)

    //     try {
    //         let witness = await circuit.calculateWitness(proof);
    //         await circuit.checkConstraints(witness);
    //         assert(false)
    //     }  catch (e) {
    //         assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
    //         assert.equal(e.message.slice(60, 99), "Error in template nextLevel_79 line: 117")
    //     }

    // });

});
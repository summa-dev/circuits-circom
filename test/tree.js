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

        // Calculate the witness
        let witness = await circuit.calculateWitness(proof);

        await circuit.checkConstraints(witness);
    });

    it("shouldn't verify an invalid proof of inclusion based on an invalid root", async () => {

        // Invalidate the root
        proof.rootHash = proof.rootHash + 1n

        await circuit.calculateWitness(proof).catch((e) => {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_81 line: 55")
        });
    });


    it("shouldn't verify an invalid proof of inclusion based on a merkle sum greater than the target sum", async () => {

        // the total sum of the tree is equal to 55
        const totalSum = tree.root.sum

        assert.equal(totalSum, 55n)

        // modify targetSum 
        proof.targetSum = BigInt(50)

        await circuit.calculateWitness(proof).catch((e) => {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_81 line: 62")
        });

    });

    it("shouldn't verify an invalid proof of inclusion based on a merkle sum equal to the total assets", async () => {

        // modify targetSum 
        proof.targetSum = BigInt(55)

        await circuit.calculateWitness(proof).catch((e) => {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_81 line: 62")
        });

    });

    it("shouldn't let pass a negative value as leaf sum", async () => {

        // replace leafSum with a negative value
        proof.leafSum = BigInt(-1)

        await circuit.calculateWitness(proof).catch((e) => {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 78), "Error in template ProofOfSolvencyMerkleProof_81 line: 87")
        });

    });

    // it("shouldn't let pass a negative value inside the siblingsSums", async () => {

    //     // add a negative value to siblingsSums
    //     proof.siblingsSums[2] = BigInt(-1)

    //     await circuit.calculateWitness(proof).catch((e) => {
    //         assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
    //     });

    // });

    // it("shouldn't let pass a value that overflow the prime as leafsum", async () => {

    //     // replace leafSum with a value that overflow the prime
    //     proof.leafSum = exports.p + 1n

    //     await circuit.calculateWitness(proof).catch((e) => {
    //         assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
    //     });

    // });

    // it("shouldn't let pass a proof that overflow the prime when computing the sum", async () => {

    //     // leafsum + proof.siblingsSums[0] should overflow the prime
    //     proof.siblingsSums[0] = exports.p


    //     await circuit.calculateWitness(proof).catch((e) => {
    //         assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
    //     });

    // });

});
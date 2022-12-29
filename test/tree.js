const path = require("path");
const {assert} = require("chai");
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree")
const { poseidon } = require("circomlibjs") // v0.0.8

describe("Tree Testing", function async() {

    it("should verify a valid proof of inclusion", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // Transform proof into a format that can be used in the circuit
        proof.siblings = proof.siblings.map((s) => s[0])  

        // Calculate the witness
        let witness = await circuit.calculateWitness(proof);

        await circuit.checkConstraints(witness);
    });

    it("shouldn't verify an invalid proof of inclusion", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // Transform proof into a format that can be used in the circuit
        proof.siblings = proof.siblings.map((s) => s[0])  

        // Invalidate the root
        proof.root = proof.root + 1n

        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });

});
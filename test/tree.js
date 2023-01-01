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

    it("should verify a valid proof of inclusion", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16) // Binary tree with 16 levels and poseidon hash function

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        assert.equal(tree.root.sum, BigInt(55))

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add assetsSum 
        proof.assetsSum = BigInt(125)

        // Calculate the witness
        let witness = await circuit.calculateWitness(proof);

        await circuit.checkConstraints(witness);
    });

    it("shouldn't verify an invalid proof of inclusion based on an invalid root", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add assetsSum 
        proof.assetsSum = BigInt(125)

        // Invalidate the root
        proof.rootHash = proof.rootHash + 1n

        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });
    });


    it("shouldn't verify an invalid proof of inclusion based on a total of liabilities greater than the total assets", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add assetsSum 
        proof.assetsSum = BigInt(50)


        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });

    it("shouldn't verify an invalid proof of inclusion based on a total of liabilities equal to the total assets", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add assetsSum 
        proof.assetsSum = BigInt(55)


        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });

    it("shouldn't let pass a negative value as leaf sum", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // replace leafSum with a negative value
        proof.leafSum = BigInt(-1)

        // add assetsSum 
        proof.assetsSum = BigInt(200)

        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });

    it("shouldn't let pass a negative value inside the siblingsSums", async () => {

        let circuit = await wasm_tester(path.join(__dirname, "../circuits", "tree.circom"));

        // Create tree 
        const tree = new IncrementalMerkleSumTree(poseidon, 16, BigInt(0), 2) // Binary tree.

        // Insert 10 leaves into the tree
        for (let i = 0; i < 10; i++) {
            tree.insert(BigInt(i), BigInt(i + 1))
        }

        // Create proof of inclusion for leaf 5
        const proof = tree.createProof(5)

        // remove rootSum from the proof
        delete proof.rootSum;

        // add a negative value to siblingsSums
        proof.siblingsSums[2] = BigInt(-1)

        // add assetsSum 
        proof.assetsSum = BigInt(200)

        // Catch the error thrown by the circuit
        await circuit.calculateWitness(proof).catch((e) => {
            // Assert that the error is the expected one 
            console.log(e.message)
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
        });

    });

});
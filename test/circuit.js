const path = require("path");
const {assert} = require("chai");
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const { MerkleSumTree } = require("pyt-merkle-sum-tree")
const createCircomInput = require("./helper.js")

describe("Circuit Testing", function async() {

    const pathToCsv = "test/entries/entry-16.csv" 
    // total sum of the liablities is 3273939304
    console.log("creating merkle tree...")
    const tree = new MerkleSumTree(pathToCsv) // Init a tree from the entries in the csv file

    // get the index of the user I want to create a proof for
    const entryIndex = tree.indexOf("dxGaEAii", BigInt(11888)) 

    // create merkle tree proof for that user 
    const proof = tree.createProof(entryIndex)

    beforeEach(async function () {
        this.timeout(100000);
        circuit = await wasm_tester(path.join(__dirname, "../scripts/input", "pyt-pos-16.circom"));
    });

    it("should verify a proof of inclusion of an existing entry if assetsSum > liabilitiesSum", async () => {

        // pack into circom input adding assetsSum property - assetsSum > liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939305))

        const expectedLeafHashOutput = proof.entry.computeLeaf().hash

        // // Calculate the witness
        let witness = await circuit.calculateWitness(input);
        await circuit.assertOut(witness, {leafHash: expectedLeafHashOutput})
        await circuit.checkConstraints(witness);
    });

    it("should verify a proof of inclusion of an existing entry if assetsSum  = liabilitiesSum", async () => {

        // pack into circom input adding assetsSum property - assetsSum = liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939304))

        const expectedLeafHashOutput = proof.entry.computeLeaf().hash

        // Calculate the witness
        let witness = await circuit.calculateWitness(input);
        await circuit.assertOut(witness, {leafHash: expectedLeafHashOutput})
        await circuit.checkConstraints(witness);

    });

    it("shouldn't verify a proof of inclusion of an existing entry if assetsSum < liabilitiesSum", async () => {

        // pack into circom input adding assetsSum property - assetsSum < liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939303))

        try {
            let witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 59), "Error in template PytPos_154 line: 65")
        }

    });

    it("shouldn't verify a proof of inclusion of a non-existing entry", async () => {

        // pack into circom input adding assetsSum property - assetsSum > liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939305))

        // add a non-existing entry to the input 
        input.username = BigInt(123456789)

        try {
            let witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 59), "Error in template PytPos_154 line: 59")
        }

    });

    it("shouldn't verify a proof of inclusion based on an invalid root", async () => {

        // pack into circom input adding assetsSum property - assetsSum > liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939305))

        // Invalidate the root
        input.rootHash = input.rootHash + 1n

        try {
            let witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 59), "Error in template PytPos_154 line: 59")
        }
    });

    it("should generate an error if one of the balances overflows 2**252", async () => {

        // pack into circom input adding assetsSum property - assetsSum > liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939305))

        // add a balance that overflows 2**252 to the input
        input.balance = exports.p - 1n


        try {
            let witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(61, 99), "Error in template SafeSum_152 line: 33")
        }

    });

    it("should generate an error if the sum of two balances overflows 2**252", async () => {

        // pack into circom input adding assetsSum property - assetsSum > liabilitiesSum
        const input = createCircomInput(proof, BigInt(3273939305))

        // add a balance that will overflow 2**252 when added to the another balance
        input.balance = BigInt(2**252) - 1n

        try {
            let witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(61, 99), "Error in template SafeSum_152 line: 33")
        }

    });

});
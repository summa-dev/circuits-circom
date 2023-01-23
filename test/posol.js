const path = require("path");
const {assert} = require("chai");
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const parseCsv = require("./utils/csv.js");
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree")
const { poseidon } = require("circomlibjs")  // v0.0.8

describe("Tree Testing", function async() {

    this.timeout(1000 * 1000);

    it("should generate a valid proof with an output Root equal to the one generated building the tree outside the circuit starting from a set of 16 entries and assetsSum > liabilitiesSum", async () => {

        const circuit16 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-16.circom"));
        const input16 = parseCsv("test/data/data-16-valid.csv"); // Total liabilities is 942849
        
        // add property assetsSum to input object 
        input16.assetsSum = BigInt(942850);

        // get the leaves of the tree by hashing the input
        let leaves = [];

        for (let i = 0; i < input16.usernamesToBigInt.length; i++) {
        leaves.push(poseidon([input16.usernamesToBigInt[i], input16.salts[i], input16.balances[i]]))
        }

        // The leaves computed outside the circuit match the leaves computed inside the circuit !

        // build the tree outside the circuit 
        const tree = new IncrementalMerkleTree(poseidon, 4, BigInt(0), 2) // Binary tree with 4 levels

        // add the leaves to the tree
        for (let i = 0; i < leaves.length; i++) {
        tree.insert(leaves[i])
        }

        // Calculate the witness
        let witness = await circuit16.calculateWitness(input16);
        // Evaluate witness to output a userCombostreeRoot that matches the one generated building the tree outside the circuit
        await circuit16.assertOut(witness, {userCombostreeRoot: tree.root})
        await circuit16.checkConstraints(witness);
    });

    it("should generate a valid proof starting from a set of 16 entries and assetsSum = liabilitiesSum", async () => {

        const circuit16 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-16.circom"));
        const input16 = parseCsv("test/data/data-16-valid.csv"); // Total liabilities is 942849

        // add property assetsSum to input object 
        input16.assetsSum = BigInt(942849);

        // Calculate the witness
        let witness = await circuit16.calculateWitness(input16);        
        await circuit16.checkConstraints(witness);

    });


    it("should generate an error starting from a set of 16 entries if the assetsSum is less than the liabilities", async () => {

        const circuit16 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-16.circom"));
        const input16 = parseCsv("test/data/data-16-valid.csv"); // Total liabilities is 942849

        // add property assetsSum to input object 
        input16.assetsSum = BigInt(942848);

        try {
            let witness = await circuit16.calculateWitness(input16);
            await circuit16.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 58), "Error in template PoSol_149 line: 59")
        }
    });



    it("should generate a valid proof with an output Root equal to the one generated building the tree outside the circuit starting from a set of 32 entries and assetsSum > liabilitiesSum", async () => {
       
        const circuit32 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-32.circom"));
        const input32 = parseCsv("test/data/data-32-valid.csv"); // Total liabilities is 1622631
        
        // add property assetsSum to input object 
        input32.assetsSum = BigInt(1622632);

        // get the leaves of the tree by hashing the input
        let leaves = [];

        for (let i = 0; i < input32.usernamesToBigInt.length; i++) {
        leaves.push(poseidon([input32.usernamesToBigInt[i], input32.salts[i], input32.balances[i]]))
        }

        // The leaves computed outside the circuit match the leaves computed inside the circuit !

        // build the tree outside the circuit 
        const tree = new IncrementalMerkleTree(poseidon, 5, BigInt(0), 2) // Binary tree with 5 levels

        // add the leaves to the tree
        for (let i = 0; i < leaves.length; i++) {
        tree.insert(leaves[i])
        }

        // Calculate the witness
        let witness = await circuit32.calculateWitness(input32);
        // Evaluate witness to output a userCombostreeRoot that matches the one generated building the tree outside the circuit
        await circuit32.assertOut(witness, {userCombostreeRoot: tree.root})
        await circuit32.checkConstraints(witness);
    });

    it("should generate a valid proof starting from a set of 32 entries and assetsSum = liabilitiesSum", async () => {

        const circuit32 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-32.circom"));
        const input32 = parseCsv("test/data/data-32-valid.csv"); // Total liabilities is 1622631

        // add property assetsSum to input object 
        input32.assetsSum = BigInt(1622631);

        // Calculate the witness
        let witness = await circuit32.calculateWitness(input32);        
        await circuit32.checkConstraints(witness);

    });


    it("should generate an error starting from a set of 32 entries if the assetsSum is less than the liabilities", async () => {

        const circuit32 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-32.circom"));
        const input32 = parseCsv("test/data/data-32-valid.csv"); // Total liabilities is 1622631

        // add property assetsSum to input object 
        input32.assetsSum = BigInt(1622630);

        try {
            let witness = await circuit32.calculateWitness(input32);
            await circuit32.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 58), "Error in template PoSol_149 line: 59")
        }
    });


    it("should generate an error if one of the balances overflows 2**252", async () => {

        const circuit16 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-16.circom"));
        const inputoverflow = parseCsv("test/data/data-16-overflow.csv");  // balance[0] = p - 1, therefore overflows 2**252

        // add property assetsSum to input object 
        inputoverflow.assetsSum = BigInt(942848); 
        
        try {
            let witness = await circuit16.calculateWitness(inputoverflow);
            await circuit16.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 61), "Error in template Num2Bits_144 line: 38")
            assert.equal(e.message.slice(62, 100), "Error in template SafeSum_145 line: 21")
        }

    });

    it("should generate an error if the sum of the balances overflows 2**252", async () => {

        const circuit16 = await wasm_tester(path.join(__dirname, "./circuits-test", "posol-16.circom"));
        const inputoverflow = parseCsv("test/data/data-16-overflow-2.csv");  // balance[0] = 2**252 - 1, therefore the total liabilities should overflow 2**252

        // add property assetsSum to input object 
        inputoverflow.assetsSum = BigInt(942848); 
        
        try {
            let witness = await circuit16.calculateWitness(inputoverflow);
            await circuit16.checkConstraints(witness);
            assert(false)
        }  catch (e) {
            assert.equal(e.message.slice(0, 21), "Error: Assert Failed.")
            assert.equal(e.message.slice(22, 61), "Error in template Num2Bits_144 line: 38")
            assert.equal(e.message.slice(62, 107), "Error in template SafeLessEqThan_148 line: 36")
        }

    });

});
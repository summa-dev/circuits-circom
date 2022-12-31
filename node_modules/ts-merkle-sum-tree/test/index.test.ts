import { poseidon } from "circomlibjs"
import { IncrementalMerkleSumTree, MerkleProof } from "../src"

describe("Incremental Merkle Tree", () => {
    const depth = 10
    const numberOfLeaves = 18

    for (const arity of [2]) {
        describe(`Intremental Merkle Tree (arity = ${arity})`, () => {
            let tree: IncrementalMerkleSumTree

            beforeEach(() => {
                tree = new IncrementalMerkleSumTree(poseidon, depth)
            })

            it("Should not initialize a tree with wrong parameters", () => {
                const fun1 = () => new IncrementalMerkleSumTree(undefined as any, 33)
                const fun2 = () => new IncrementalMerkleSumTree(1 as any, 33)

                expect(fun1).toThrow("Parameter 'hash' is not defined")
                expect(fun2).toThrow("Parameter 'hash' is none of these types: function")
            })


            it("Should not initialize a tree with depth > 32", () => {
                const fun = () => new IncrementalMerkleSumTree(poseidon, 33)

                expect(fun).toThrow("The tree depth must be between 1 and 32")
            })

            it("Should not allow to add an entry with negative sum", () => {

                // Add entries
                tree.insert(BigInt(0), BigInt(5))
                tree.insert(BigInt(1), BigInt(7))

                // Check the sum 
                expect(tree.root.sum).toEqual(BigInt(12))

                // Add an entry with negative sum, should throw an error
                const fun = () => tree.insert(BigInt(0), BigInt(-1))
                expect(fun).toThrow("entrySum cant be negative")

                // Expect the sum to be the same
                expect(tree.root.sum).toEqual(BigInt(12))
            })

            it("Should initialize a tree", () => {
                expect(tree.depth).toEqual(depth)
                expect(tree.zeroes).toHaveLength(depth)
                expect(tree.arity).toEqual(arity)
                expect(tree.root.sum).toEqual(BigInt(0))
            })

            it("All the zeroes should have sum equal to 0", () => {
                for (const zero of tree.zeroes) {
                    expect(zero.sum).toEqual(BigInt(0))
                }
            })

            it("Should generate the same leaf hash using the native poseidon hash", () => {

                tree.insert(BigInt(20), BigInt(1))
                const hash = poseidon([BigInt(20), BigInt(1)])

                expect(hash).toEqual(tree.leaves[0].hash)
                expect(tree.root.sum).toEqual(BigInt(1))
            })


            it("Should generate the root leaf hash using the native poseidon hash", () => {

                const oneLevelTree = new IncrementalMerkleSumTree(poseidon, 1)

                oneLevelTree.insert(BigInt(20), BigInt(50))
                oneLevelTree.insert(BigInt(30), BigInt(65))

                const leaf1Hash = poseidon([BigInt(20), BigInt(50)])
                const leaf2Hash = poseidon([BigInt(30), BigInt(65)])

                expect(leaf1Hash).toEqual(oneLevelTree.leaves[0].hash)
                expect(leaf2Hash).toEqual(oneLevelTree.leaves[1].hash)
                expect(BigInt(50)).toEqual(oneLevelTree.leaves[0].sum)
                expect(BigInt(65)).toEqual(oneLevelTree.leaves[1].sum)

                const rootHash = poseidon([leaf1Hash, BigInt(50), leaf2Hash, BigInt(65)])

                expect(rootHash).toEqual(oneLevelTree.root.hash)
            })

            it("Should generate different root hashes when changing the entry order", () => {

                const entry1Value = BigInt(1)
                const entry1Sum = BigInt(78)
                const entry2Value = BigInt(2)
                const entry2Sum = BigInt(90)

                let tree1 = new IncrementalMerkleSumTree(poseidon, depth)
                let tree2 = new IncrementalMerkleSumTree(poseidon, depth)

                tree1.insert(entry1Value, entry1Sum)
                tree1.insert(entry2Value, entry2Sum)

                tree2.insert(entry2Value, entry2Sum)
                tree2.insert(entry1Value, entry1Sum)

                expect(tree1.root.hash).not.toEqual(tree2.root.hash)
            })

            it("should initiate a empty array of leaf nodes", () => {
                expect(tree.leaves).toHaveLength(0)
            })

            it("Should not insert a leaf in a full tree", () => {
                const fullTree = new IncrementalMerkleSumTree(poseidon, 1)

                fullTree.insert(BigInt(0), BigInt(50))
                fullTree.insert(BigInt(1), BigInt(30))

                expect(fullTree.root.sum).toEqual(BigInt(80))

                const fun = () => fullTree.insert(BigInt(2), BigInt(70))

                expect(fun).toThrow("The tree is full")
                
            })

            it(`Should insert ${numberOfLeaves} leaves`, () => {

                let sum = BigInt(0)

                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                    expect(tree.leaves).toHaveLength(i + 1)
                    // The leaves should be initiated with the correct value and the correct sum
                    expect(tree.leaves[i].hash).toEqual(poseidon([BigInt(i), BigInt(i + 1)]))
                    expect(tree.leaves[i].sum).toEqual(BigInt(i + 1))
                    sum += BigInt(i + 1)
                    // The root should store the correct sum
                    expect(tree.root.sum).toEqual(sum)
                    // IndexOf should return the correct index
                    expect(tree.indexOf(BigInt(i), BigInt(i+1))).toEqual(i)
                }
            })

            it("Should not update a leaf that does not exist", () => {
                const fun = () => tree.update(0, BigInt(0), BigInt(55))
                expect(fun).toThrow("The leaf does not exist in this tree")
            })


            it("Should not update a leaf with a negative sum", () => {
                const fun = () => tree.update(0, BigInt(0), BigInt(-1))
                expect(fun).toThrow("entrySum cant be negative")
            })

            it("Should create valid proofs for each inserted entry", () => {

                let computedSum = BigInt(0)

                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                    const proof : MerkleProof = tree.createProof(i)
                    expect(proof.siblingsHashes).toHaveLength(depth)
                    expect(proof.leafHash).toEqual(tree.leaves[i].hash)
                    expect(proof.leafSum).toEqual(tree.leaves[i].sum)
                    expect(proof.rootHash).toEqual(tree.root.hash)
                    expect(proof.rootSum).toEqual(tree.root.sum)

                    computedSum += BigInt(i + 1)
                    // last proof should have the correct sum
                    expect(proof.rootSum).toEqual(computedSum)

                }
            })



            it("Should not delete a leaf that does not exist", () => {
                const fun = () => tree.delete(0)

                expect(fun).toThrow("The leaf does not exist in this tree")
            })

            it(`Should delete ${numberOfLeaves} leaves`, () => {
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))

                    // expect the leaf to exist
                    expect(tree.indexOf(BigInt(i), BigInt(i+1))).toEqual(i)

                    // delete the leaf
                    tree.delete(i)

                    // expect the leaf to not exist
                    expect(tree.indexOf(BigInt(i), BigInt(i+1))).toEqual(-1)
                }

            })

            it(`Should update ${numberOfLeaves} leaves`, () => {

                let computedSum = BigInt(0)

                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                    computedSum += BigInt(i + 1)
                }

                // The root should store the correct sum
                expect(tree.root.sum).toEqual(computedSum)

                // zero the sum
                computedSum = BigInt(0)

                for (let i = 0; i < numberOfLeaves; i += 1) {

                    tree.update(i, BigInt(i), BigInt(i + 2))

                    // The leaves should be updated with the correct value and the correct sum
                    expect(tree.leaves[i].hash).toEqual(poseidon([BigInt(i), BigInt(i + 2)]))
                    expect(tree.leaves[i].sum).toEqual(BigInt(i + 2))

                    computedSum += BigInt(i + 2)
                }

                // The root should store the correct sum
                expect(tree.root.sum).toEqual(computedSum)
            })

            it("Should return the index of a leaf", () => {
                tree.insert(BigInt(1), BigInt(1))
                tree.insert(BigInt(2), BigInt(2))

                const index = tree.indexOf(BigInt(2), BigInt(2))

                expect(index).toBe(1)
            })

            it("Should not create any proof if the leaf does not exist", () => {

                // Add a single leaf to the tree
                tree.insert(BigInt(1), BigInt(1))

                // Query proof for a non existing leaf
                const fun = () => tree.createProof(3)

                expect(fun).toThrow("The leaf does not exist in this tree")
            })

            it("Should verify a valid proof for each entry", () => {
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                }

                for (let i = 0; i < numberOfLeaves; i += 1) {
                    const proof = tree.createProof(i)
                    expect(tree.verifyProof(proof)).toBeTruthy()
                }
            })
            
            it("Shouldn't verify an invalid proof with a wrong leaf sum", () => {

                // Gen tree
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                }

                const proof = tree.createProof(0)

                // add invalid leaf sum
                proof.leafSum = BigInt(0)

                expect(tree.verifyProof(proof)).toBeFalsy()

            })

            it("Shouldn't verify an invalid proof with a wrong leaf hash", () => {

                // Gen tree
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                }

                const proof = tree.createProof(0)

                // add invalid leaf hash
                proof.leafHash = BigInt(7)

                expect(tree.verifyProof(proof)).toBeFalsy()

            })

            it("Shouldn't verify a proof against a wrong root hash", () => {

                // Gen tree
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                }

                const proof = tree.createProof(0)

                // add invalid leaf hash
                proof.rootHash = BigInt(7)

                expect(tree.verifyProof(proof)).toBeFalsy()

            })

            it("Shouldn't verify a proof against a wrong root sum", () => {

                // Gen tree
                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                }

                const proof = tree.createProof(0)

                // add invalid leaf hash
                proof.rootSum = BigInt(12)

                expect(tree.verifyProof(proof)).toBeFalsy()

            })
        })
    }
})
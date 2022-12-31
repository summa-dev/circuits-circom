import { HashFunction, MerkleProof, Node } from './types';
/**
 * A Merkle tree is a tree in which every leaf node is labelled with the cryptographic hash of a
 * data block, and every non-leaf node is labelled with the cryptographic hash of the labels of its child nodes.
 * It allows efficient and secure verification of the contents of large data structures.
 * The IncrementalMerkleSumTree class is a TypeScript implementation of Incremental Merkle Sum tree and it
 * provides all the functions to create efficient trees and to generate and verify proofs of membership.
 */
export default class IncrementalMerkleSumTree {
    static readonly maxDepth = 32;
    private _root;
    private readonly _nodes;
    private readonly _zeroes;
    private readonly _hash;
    private readonly _depth;
    private readonly _arity;
    /**
     * Initializes the tree with the hash function, the depth.
     * @param hash Hash function.
     * @param depth Tree depth.
     */
    constructor(hash: HashFunction, depth: number);
    /**
     * Returns the root hash of the tree.
     * @returns Root hash.
     */
    get root(): Node;
    /**
     * Returns the depth of the tree.
     * @returns Tree depth.
     */
    get depth(): number;
    /**
     * Returns the leaves of the tree.
     * @returns List of leaves.
     */
    get leaves(): Node[];
    /**
     * Returns the zeroes nodes of the tree.
     * @returns List of zeroes.
     */
    get zeroes(): Node[];
    /**
     * Returns the number of children for each node.
     * @returns Number of children per node.
     */
    get arity(): number;
    /**
     * Returns the index of a leaf. If the leaf does not exist it returns -1.
     * @param entryValue value of the entry of the queried leaf.
     * @param entrySum sum of the entry of the queried leaf.
     * @returns Index of the leaf.
     */
    indexOf(entryValue: bigint, entrySum: bigint): number;
    /**
     * Inserts a new leaf in the tree.
     * @param entryValue value of the entry to be added to the tree.
     * @param entrySum sum of the entry to be added to the tree.
     */
    insert(entryValue: bigint, entrySum: bigint): void;
    /**
     * Deletes a leaf from the tree. It does not remove the leaf from
     * the data structure. It set the leaf to be deleted to a zero value.
     * @param index Index of the leaf to be deleted.
     */
    delete(index: number): void;
    /**
     * Updates a leaf in the tree.
     * @param index Index of the leaf to be updated.
     * @param newEntryValue New value of the entry to be updated.
     * @param newEntrySum New sum of the entry to be updated.
     */
    update(index: number, newEntryValue: bigint, newEntrySum: bigint): void;
    /**
     * Creates a proof of membership.
     * @param index Index of the proof's leaf.
     * @returns Proof object.
     */
    createProof(index: number): MerkleProof;
    /**
     * Verifies a proof and return true or false.
     * @param proof Proof to be verified.
     * @returns True or false.
     */
    verifyProof(proof: MerkleProof): boolean;
}

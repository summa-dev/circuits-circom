import { HashFunction, Node } from './types';
export declare function createLeafNodeFromEntry(entryValue: bigint, entrySum: bigint, hash: HashFunction): Node;
export declare function createMiddleNode(childL: Node, childR: Node, hash: HashFunction): Node;

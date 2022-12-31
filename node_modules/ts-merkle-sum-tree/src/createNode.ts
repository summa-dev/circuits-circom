import checkParameter from './checkParameter';
import { HashFunction, Node } from './types';

export function createLeafNodeFromEntry(entryValue: bigint, entrySum: bigint, hash: HashFunction): Node {
  if (entrySum < BigInt(0)) {
    throw new Error('entrySum cant be negative');
  }

  checkParameter(entryValue, 'value', 'bigint');
  checkParameter(entrySum, 'sum', 'bigint');

  const hashPreimage: bigint[] = [entryValue, entrySum];

  const leaf: Node = { hash: hash(hashPreimage), sum: entrySum };

  checkParameter(leaf, 'leaf', 'object');
  checkParameter(leaf.hash, 'hash', 'bigint');
  checkParameter(leaf.sum, 'sum', 'bigint');

  return leaf;
}

export function createMiddleNode(childL: Node, childR: Node, hash: HashFunction): Node {
  const middleNode = { hash: hash([childL.hash, childL.sum, childR.hash, childR.sum]), sum: childL.sum + childR.sum };

  checkParameter(middleNode, 'middleNode', 'object');
  checkParameter(middleNode.hash, 'hash', 'bigint');
  checkParameter(middleNode.sum, 'sum', 'bigint');

  if (middleNode.sum < BigInt(0)) {
    throw new Error('middleNode.sum cant be negative');
  }

  return middleNode;
}

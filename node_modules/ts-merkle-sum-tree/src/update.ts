import checkParameter from './checkParameter';
import { createMiddleNode } from './createNode';
import { HashFunction, Node } from './types';

export default function update(
  index: number,
  newLeaf: Node,
  depth: number,
  arity: number,
  nodes: Node[][],
  zeroes: Node[],
  hash: HashFunction,
): Node {
  checkParameter(newLeaf, 'leaf', 'object');
  checkParameter(newLeaf.hash, 'hash', 'bigint');
  checkParameter(newLeaf.sum, 'sum', 'bigint');
  checkParameter(index, 'index', 'number');

  if (index < 0 || index >= nodes[0].length) {
    throw new Error('The leaf does not exist in this tree');
  }

  let node = newLeaf;

  for (let level = 0; level < depth; level += 1) {
    const position = index % arity;
    const levelStartIndex = index - position;
    const levelEndIndex = levelStartIndex + arity;

    const children = [];
    nodes[level][index] = node;

    for (let i = levelStartIndex; i < levelEndIndex; i += 1) {
      if (i < nodes[level].length) {
        children.push(nodes[level][i]);
      } else {
        // Case where the level is not full and we need to use empty Nodes
        children.push(zeroes[level]);
      }
    }

    node = createMiddleNode(children[0], children[1], hash);

    index = Math.floor(index / arity);
  }

  return node;
}

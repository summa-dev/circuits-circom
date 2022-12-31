import checkParameter from './checkParameter';
import { MerkleProof, Node } from './types';

export default function createProof(
  index: number,
  depth: number,
  arity: number,
  nodes: Node[][],
  zeroes: Node[],
  root: Node,
): MerkleProof {
  checkParameter(index, 'index', 'number');

  if (index < 0 || index >= nodes[0].length) {
    throw new Error('The leaf does not exist in this tree');
  }

  const siblingsHashes: bigint[] = [];
  const siblingsSums: bigint[] = [];
  const pathIndices: number[] = [];
  const leafIndex = index;

  for (let level = 0; level < depth; level += 1) {
    const position = index % arity;
    const levelStartIndex = index - position;
    const levelEndIndex = levelStartIndex + arity;

    pathIndices[level] = position;

    for (let i = levelStartIndex; i < levelEndIndex; i += 1) {
      if (i !== index) {
        if (i < nodes[level].length) {
          siblingsHashes[level] = nodes[level][i].hash;
          siblingsSums[level] = nodes[level][i].sum;
        } else {
          siblingsHashes[level] = zeroes[level].hash;
          siblingsSums[level] = zeroes[level].sum;
        }
      }
    }

    index = Math.floor(index / arity);
  }

  return {
    rootHash: root.hash,
    rootSum: root.sum,
    leafHash: nodes[0][leafIndex].hash,
    leafSum: nodes[0][leafIndex].sum,
    pathIndices,
    siblingsHashes,
    siblingsSums,
  };
}

// import checkParameter from './checkParameter';
import { createMiddleNode } from './createNode';
import checkParameter from './checkParameter';
import { HashFunction, MerkleProof } from './types';

export default function verifyProof(proof: MerkleProof, hash: HashFunction): boolean {
  checkParameter(proof, 'proof', 'object');
  checkParameter(proof.rootHash, 'proof.rootHash', 'bigint');
  checkParameter(proof.rootSum, 'proof.rootSum', 'bigint');
  checkParameter(proof.leafHash, 'proof.leafHash', 'bigint');
  checkParameter(proof.leafSum, 'proof.leafSum', 'bigint');
  checkParameter(proof.siblingsHashes, 'proof.siblingsHashes', 'object');
  checkParameter(proof.siblingsSums, 'proof.siblingsSums', 'object');
  checkParameter(proof.pathIndices, 'proof.pathElements', 'object');

  let node = { hash: proof.leafHash, sum: proof.leafSum };

  for (let i = 0; i < proof.siblingsHashes.length; i += 1) {
    const siblingNode = { hash: proof.siblingsHashes[i], sum: proof.siblingsSums[i] };

    if (proof.pathIndices[i] === 0) {
      node = createMiddleNode(node, siblingNode, hash);
    } else {
      node = createMiddleNode(siblingNode, node, hash);
    }
  }

  return proof.rootHash === node.hash && proof.rootSum === node.sum;
}

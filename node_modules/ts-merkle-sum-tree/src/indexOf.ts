import checkParameter from './checkParameter';
import { Node } from './types';

export default function indexOf(leaf: Node, nodes: Node[][]): number {
  checkParameter(leaf, 'leaf', 'object');
  checkParameter(leaf.hash, 'hash', 'bigint');
  checkParameter(leaf.sum, 'sum', 'bigint');

  return nodes[0].map((x) => x.hash).indexOf(leaf.hash);
}

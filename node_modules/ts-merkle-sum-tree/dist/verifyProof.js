"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import checkParameter from './checkParameter';
var createNode_1 = require("./createNode");
var checkParameter_1 = require("./checkParameter");
function verifyProof(proof, hash) {
    (0, checkParameter_1.default)(proof, 'proof', 'object');
    (0, checkParameter_1.default)(proof.rootHash, 'proof.rootHash', 'bigint');
    (0, checkParameter_1.default)(proof.rootSum, 'proof.rootSum', 'bigint');
    (0, checkParameter_1.default)(proof.leafHash, 'proof.leafHash', 'bigint');
    (0, checkParameter_1.default)(proof.leafSum, 'proof.leafSum', 'bigint');
    (0, checkParameter_1.default)(proof.siblingsHashes, 'proof.siblingsHashes', 'object');
    (0, checkParameter_1.default)(proof.siblingsSums, 'proof.siblingsSums', 'object');
    (0, checkParameter_1.default)(proof.pathIndices, 'proof.pathElements', 'object');
    var node = { hash: proof.leafHash, sum: proof.leafSum };
    for (var i = 0; i < proof.siblingsHashes.length; i += 1) {
        var siblingNode = { hash: proof.siblingsHashes[i], sum: proof.siblingsSums[i] };
        if (proof.pathIndices[i] === 0) {
            node = (0, createNode_1.createMiddleNode)(node, siblingNode, hash);
        }
        else {
            node = (0, createNode_1.createMiddleNode)(siblingNode, node, hash);
        }
    }
    return proof.rootHash === node.hash && proof.rootSum === node.sum;
}
exports.default = verifyProof;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkParameter_1 = require("./checkParameter");
function createProof(index, depth, arity, nodes, zeroes, root) {
    (0, checkParameter_1.default)(index, 'index', 'number');
    if (index < 0 || index >= nodes[0].length) {
        throw new Error('The leaf does not exist in this tree');
    }
    var siblingsHashes = [];
    var siblingsSums = [];
    var pathIndices = [];
    var leafIndex = index;
    for (var level = 0; level < depth; level += 1) {
        var position = index % arity;
        var levelStartIndex = index - position;
        var levelEndIndex = levelStartIndex + arity;
        pathIndices[level] = position;
        for (var i = levelStartIndex; i < levelEndIndex; i += 1) {
            if (i !== index) {
                if (i < nodes[level].length) {
                    siblingsHashes[level] = nodes[level][i].hash;
                    siblingsSums[level] = nodes[level][i].sum;
                }
                else {
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
        pathIndices: pathIndices,
        siblingsHashes: siblingsHashes,
        siblingsSums: siblingsSums,
    };
}
exports.default = createProof;

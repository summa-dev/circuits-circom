"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkParameter_1 = require("./checkParameter");
var createNode_1 = require("./createNode");
function update(index, newLeaf, depth, arity, nodes, zeroes, hash) {
    (0, checkParameter_1.default)(newLeaf, 'leaf', 'object');
    (0, checkParameter_1.default)(newLeaf.hash, 'hash', 'bigint');
    (0, checkParameter_1.default)(newLeaf.sum, 'sum', 'bigint');
    (0, checkParameter_1.default)(index, 'index', 'number');
    if (index < 0 || index >= nodes[0].length) {
        throw new Error('The leaf does not exist in this tree');
    }
    var node = newLeaf;
    for (var level = 0; level < depth; level += 1) {
        var position = index % arity;
        var levelStartIndex = index - position;
        var levelEndIndex = levelStartIndex + arity;
        var children = [];
        nodes[level][index] = node;
        for (var i = levelStartIndex; i < levelEndIndex; i += 1) {
            if (i < nodes[level].length) {
                children.push(nodes[level][i]);
            }
            else {
                // Case where the level is not full and we need to use empty Nodes
                children.push(zeroes[level]);
            }
        }
        node = (0, createNode_1.createMiddleNode)(children[0], children[1], hash);
        index = Math.floor(index / arity);
    }
    return node;
}
exports.default = update;

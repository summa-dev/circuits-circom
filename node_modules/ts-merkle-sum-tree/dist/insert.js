"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkParameter_1 = require("./checkParameter");
var createNode_1 = require("./createNode");
function insert(leaf, depth, arity, nodes, zeroes, hash) {
    (0, checkParameter_1.default)(leaf, 'leaf', 'object');
    (0, checkParameter_1.default)(leaf.hash, 'hash', 'bigint');
    (0, checkParameter_1.default)(leaf.sum, 'sum', 'bigint');
    if (nodes[0].length >= Math.pow(arity, depth)) {
        throw new Error('The tree is full');
    }
    var node = leaf;
    var index = nodes[0].length;
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
exports.default = insert;

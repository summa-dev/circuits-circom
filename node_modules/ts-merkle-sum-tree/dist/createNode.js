"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleNode = exports.createLeafNodeFromEntry = void 0;
var checkParameter_1 = require("./checkParameter");
function createLeafNodeFromEntry(entryValue, entrySum, hash) {
    if (entrySum < BigInt(0)) {
        throw new Error('entrySum cant be negative');
    }
    (0, checkParameter_1.default)(entryValue, 'value', 'bigint');
    (0, checkParameter_1.default)(entrySum, 'sum', 'bigint');
    var hashPreimage = [entryValue, entrySum];
    var leaf = { hash: hash(hashPreimage), sum: entrySum };
    (0, checkParameter_1.default)(leaf, 'leaf', 'object');
    (0, checkParameter_1.default)(leaf.hash, 'hash', 'bigint');
    (0, checkParameter_1.default)(leaf.sum, 'sum', 'bigint');
    return leaf;
}
exports.createLeafNodeFromEntry = createLeafNodeFromEntry;
function createMiddleNode(childL, childR, hash) {
    var middleNode = { hash: hash([childL.hash, childL.sum, childR.hash, childR.sum]), sum: childL.sum + childR.sum };
    (0, checkParameter_1.default)(middleNode, 'middleNode', 'object');
    (0, checkParameter_1.default)(middleNode.hash, 'hash', 'bigint');
    (0, checkParameter_1.default)(middleNode.sum, 'sum', 'bigint');
    if (middleNode.sum < BigInt(0)) {
        throw new Error('middleNode.sum cant be negative');
    }
    return middleNode;
}
exports.createMiddleNode = createMiddleNode;

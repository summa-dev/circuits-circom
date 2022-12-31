"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkParameter_1 = require("./checkParameter");
function indexOf(leaf, nodes) {
    (0, checkParameter_1.default)(leaf, 'leaf', 'object');
    (0, checkParameter_1.default)(leaf.hash, 'hash', 'bigint');
    (0, checkParameter_1.default)(leaf.sum, 'sum', 'bigint');
    return nodes[0].map(function (x) { return x.hash; }).indexOf(leaf.hash);
}
exports.default = indexOf;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkParameter(value, name) {
    var types = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        types[_i - 2] = arguments[_i];
    }
    if (value === undefined) {
        throw new TypeError("Parameter '".concat(name, "' is not defined"));
    }
    if (!types.includes(typeof value)) {
        throw new TypeError("Parameter '".concat(name, "' is none of these types: ").concat(types.join(', ')));
    }
}
exports.default = checkParameter;

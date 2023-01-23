pragma circom 2.1.3;

include "../../circuits/pyt-pos.circom";

component main {public [rootHash, assetsSum]} = PytPos(16);

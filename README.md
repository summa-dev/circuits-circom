# pyt-circuits 

Circuits for Proof Of Solvency.

The circuit, written in circom, enforces the rules that the Exchange must abide by when generating a Proof Of Solvency for a specific user.

The circuit checks that: 

	- A user-balance entry has been included in the Merkle Sum Tree
	- The computation of the sum going from the user's entry to the root has been performed correctly
	- No sum overflow happened during the computation
	- The computed sum (namely the total liabilities of an exchange) is less or equal to the total sum of the assets of the exchange
	
The prover system guarantees credible and self-auditable proof while preserving the secrecy of the Exchange's business information such as:

- Number of users of the exchanges
- Users balances 
- Siblings partial sum balances 
- Total liabilities of the exchange

The prover relies on [pyt-merkle-sum-tree](https://github.com/pan-y-tomate/pyt-merkle-sum-tree) for the Merkle Sum tree operations.

## Circuit Design 

| Input                          | Description              | Public or Private
| -----------                    | -----------          |  ----------
| rootHash                      | Root Hash of the Merkle Sum Tree publicly committed by the exchange              | Public
| username     | The username (in BigInt format) of user to which the proof is being generated for| Private
| balance    | The balance of the user to which the proof is being generated for                 | Private
| pathIndices[nLevels]               | A bit array that contains the path to the user leaf inside the Merkle Sum Tree              | Private
| siblingHashes[nLevels]                | Array of hashes of the siblings of the user leaf                | Private
| siblingsSums[nLevels] | Array of sum-balances of the siblings of the user leaf                 | Private
| assetsSum             | The total assets that the Exchange claims to have   | Public

| Output                          | Description              | Public or Private
| -----------                    | -----------          |  ----------
| leafHash                      | Poseidon Hash `H(username,balance)`              | Public (by default)

![circuit illustration](./imgs/pos.png)

The `ToLeafHash` component performs the poseidon hash of the `username` and the `balance` and outputs the `leafHash`. The `leafHash` is then used as the first `hash` in the `NextMerkleSumTreeLevel` component.

The `NextMerkleSumTreeLevel` component recursively computes the current `hash` (for the first level it is the `leafHash`), the current `sum` (for the first level it is the `balance`), the current `siblingHash` and the current `siblingSum`. The output of the nextLevel component are the `nextHash` and the `nextSum`. These are calculated as follows:

- `nextHash = H(hash, sum, siblingHash, siblingSum)` if the pathIndex is 0, where H is the poseidon hash function
- `nextHash = H(siblingHash, siblingSum, hash, sum)` if the pathIndex is 1, where H is the poseidon hash function
- `nextSum = sum + siblingSum`

After the last level is computed, the circuit checks that the `nextHash` is equal to the `rootHash` and that the `nextSum` is `LessEqThan` the `assetsSum`.

Further circuit components not shown in the circuit diagram are:

- `SafeSum`, ensures that no overflow happens during the computation of the sum
- `SafeLessEqThan`, safely compare two n-bit numbers avoiding overflows

## Checks to be executed outside the circuit

A proof generated using the circuit, even if verified, doesn't ensure that the prover is solvent. Further checks must be on the public signals of the circuit to ensure that the prover is solvent. These checks are:

- The `rootHash` (input of the circuit) must be the root hash of the Merkle Sum Tree committed by the exchange on a Public Bulletin Board
- The `assetsSum` (input of the circuit) must be the total assets of the exchange. The way in which the exchange generates its proof of assets is out of the scope of this project.
- The `leafHash` (output of the circuit) must equal to `H(username, balance)` that contains the data of the user to which the proof is being generated for

## Build

In order to compile the circuit, execute the trusted setup, generate the proof (and verify it) using groth16 as proving system run from the root directory:

	```bash
	npm run build
	```

The script will:

- Download the trusted [Powers Of Tau](https://github.com/iden3/snarkjs#7-prepare-phase-2) setup generated from the Hermez Community 
- Do the trusted setup required for the groth16 proving system
- Compile the circuit 
- Generate a witness based on a pre generated sample input. In order to generate other inputs you can use this program: 

	```javascript

	const { IncrementalMerkleSumTree } = require("ts-merkle-sum-tree")

	...

	proof = tree.createProofWithTargetSum(5, BigInt(125))

	inputToCircuit = JSON.strigify(proof)

	```

- Generate the proof based on the witness
- Verify the proof

## Test

To run the tests, run the following command:

```bash
npm test
```

## Benchmarks

All benchmarks are run on a Macbook Air M1, 2020 AWS, 8GB memory. The benchmark was run on a Merkle Sum Tree with 16 levels (2^16 leaves).

| 									 | **groth16**  | 
|------------------------------------|--------------|
|Constraints                         |13892         |
|Circuit compilation                 |2s            |
|Witness generation                  |0s      		|
|Setup key generation 		         |40s  			|
|Trusted setup phase 2 contribution	 |6s 	 		|
|Proving key size					 |12.3MB  		|
|Proving key verification		  	 |41s   		|
|Proving time                        |2s     		|
|Proof verification time             |0s      		|

## Trusted Setup Artifcats

A trusted setup run by me is publicly available to test the prove/verify process. The available artifacts is based on a Merkle Sum Tree with 16 levels (2^16 leaves).

The artifacts generated during the Trusted Setup are publicly available :

- proving key zkey `wget https://pan-y-tomate.s3.eu-west-3.amazonaws.com/pyt-pos-16_final.zkey`
- circuit wasm `wget  https://pan-y-tomate.s3.eu-west-3.amazonaws.com/pyt-pos-16.wasm`
- verification key vkey `wget https://pan-y-tomate.s3.eu-west-3.amazonaws.com/vkey.json`

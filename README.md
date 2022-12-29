# pos-prover

APIs to generate and verify Proof Of Solvency Proofs 

## zkSNARK Proving System (WIP)

The zkSNARK proving system consists in a zk circuits enforcing the rules that the Exchange must abide by when generating a Proof Of Solvency. In particular, the circuit checks that:
	- A user-balance entry has been included in the Merkle Sum Tree
    - The computation of the sum going from the user's entry to the root has been performed correctly
    - No negative balances were included in the computation of the sum
	- No sum overflow happened during the computation
	- The total of the entries in the tree (namely the total liabilities of an exchange) is equal or less than the total sum of the assets of the exchange


## Scripts

- compile the circuit
- generate proof
- verify proof

## Test

To run the tests, run the following command:

```bash
mocha test
```

#### To do

- [ ] Remove zk kit from package json once I create a new npm package for it that support smt

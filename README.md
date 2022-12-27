# pos-prover

APIs to generate and verify Proof Of Solvency Proofs 

## zkSNARK Proving System (WIP)

The zkSNARK proving system consists in: 

- zk circuits enforcing the rules that the Exchange must abide by when including a user in the SMST
	- a user-balance entry has been included in the smst
    - the computation of the liabilities going from the entry to the root has been performed correctly
    - no negative balances were included in the computation of the liabilities
	- no sum overflow happened during the computation of the liabilities
- A set of javascript APIs to generate (and verify) Proof of Liabilities for each user

#### Generate Proof

```javascript
	const {proof, publicSignals} = await smst.generateProof(aliceSMSTData)
```

#### Verify Proof

```javascript
	await smst.verifyProof(proof, publicSignals)
```

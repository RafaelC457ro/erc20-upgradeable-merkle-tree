# ERC20 Airdrop

This is my implementation of the follow exercise:

> You will have to code an ERC20, that is upgradeable. Another contract, which we will call the Airdrop contract,
> will control the ERC20’s minting. Obviously, the Airdrop contract should use a Merkle tree to determine who is
> able to claim its airdrop.
> On top of that, contracts should be upgradeable (be sure to check the upgradeable OpenZeppelin library).
> Bonus points for upgrading one of them too.

## How I solved?

I've used the package [@openzeppelin/merkle-tree](https://github.com/OpenZeppelin/merkle-tree) to generate the merkle tree and verify the proofs. ie:

```typescript
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// address, amount allowed to claim
const values = [
  ["0x1111111111111111111111111111111111111111", "5000000000000000000"],
  ["0x2222222222222222222222222222222222222222", "2500000000000000000"],
];

const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

const root = tree.root;

const proof = tree.getProof([
  "0x2222222222222222222222222222222222222222",
  "2500000000000000000",
]);

const isProofValid = tree.verify(proof);

console.log({ root, proof, isProofValid });
```

## Prerequisites

Make sure you have installed the following:

- [nvm](https://github.com/nvm-sh/nvm) or [Node.js](https://nodejs.org/en) version `v16.10.0`

## Install

For install the project dependencies, run the following steps:

### With nvm

```shell
nvm install
nvm use

npm install
```

## Without nvm

```shell
npm install
```

## Run tests

```shell
npm run test
```

## Upgrade manually using hardhat upgrades

This some the scripts that I created to test the upgrade manually:

### deploy localhost

```shell
npx hardhat deploy --network localhost
```

### upgrade localhost

```shell
npx hardhat run scripts/upgrade-token.ts --network localhost
```

### validade upgrade

```shell
npx hardhat run scripts/validate-upgrade.js --network localhost
```

### validade airdrop

```shell
npx hardhat run scripts/validate-airdrop-implementation.js --network localhost
```

## License

[MIT License](LICENSE) &copy; [Rafael Castro](https://github.com/RafaelC457ro)

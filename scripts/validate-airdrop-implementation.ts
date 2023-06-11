import { ethers, upgrades } from "hardhat";

async function main() {
  const Airdrop = await ethers.getContractFactory("Airdrop");

  await upgrades.validateImplementation(Airdrop);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

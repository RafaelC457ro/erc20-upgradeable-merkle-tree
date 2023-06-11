import { ethers, upgrades } from "hardhat";

async function main() {
  const AirdropToken = await ethers.getContractFactory("AirdropToken");
  const AirdropTokenV2 = await ethers.getContractFactory("AirdropTokenV2");

  await upgrades.validateUpgrade(AirdropToken, AirdropTokenV2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

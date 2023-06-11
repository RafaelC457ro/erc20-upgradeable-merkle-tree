import { ethers, upgrades, deployments } from "hardhat";

async function main() {
  const AirdropToken = await ethers.getContractFactory("AirdropToken");
  const AirdropTokenV2 = await ethers.getContractFactory("AirdropTokenV2");

  const airdrop = await deployments.get("Airdrop");

  // deploy
  const box = await upgrades.deployProxy(AirdropToken, [airdrop.address]);

  const instance = await upgrades.upgradeProxy(box.address, AirdropTokenV2);
  console.log("upgraded", instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

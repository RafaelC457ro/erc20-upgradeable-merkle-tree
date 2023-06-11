import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { generateDefaultTree } from "../utils/generateRootTree";
import { Airdrop } from "../typechain-types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const root = await generateDefaultTree();

  const airdrop = await deploy("Airdrop", {
    from: deployer,
    proxy: {
      owner: owner,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [root.root],
        },
      },
      viaAdminContract: {
        name: "OwnerProxyAdmin",
        artifact: "OwnerProxyAdmin",
      },
    },
    log: true,
  });

  const airdropToken = await deploy("AirdropToken", {
    contract: "AirdropToken",
    from: deployer,
    proxy: {
      owner: owner,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [airdrop.address],
        },
      },
      viaAdminContract: {
        name: "OwnerProxyAdmin",
        artifact: "OwnerProxyAdmin",
      },
    },
    log: true,
  });

  const Airdrop: Airdrop = await ethers.getContractAt(
    "Airdrop",
    airdrop.address
  );

  await Airdrop.setToken(airdropToken.address);

  console.log("airdropToken(proxy)", airdropToken.address);
};

deployment.tags = ["all", "airdrop-token-v1"];

export default deployment;

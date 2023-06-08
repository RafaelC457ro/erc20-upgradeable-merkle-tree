import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { generateDefaultRootTree } from "../utils/generateRootTree";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const root = await generateDefaultRootTree();

  await deploy("AirdropToken", {
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
    },
    log: true,
  });
};

deployment.tags = ["all", "airdrop-token-v1"];

export default deployment;

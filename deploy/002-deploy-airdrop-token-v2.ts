import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  await deploy("AirdropTokenV2", {
    from: owner,
    log: true,
  });
};

deployment.tags = ["all", "airdrop-token-v2"];

export default deployment;

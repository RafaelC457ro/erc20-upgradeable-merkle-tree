import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployment: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const v2 = await deploy("AirdropTokenV2", {
    contract: "AirdropTokenV2",
    from: owner,
    log: true,
  });

  console.log("v2(proxy)", v2.address);
};

deployment.tags = ["all", "airdrop-token-v2"];

export default deployment;

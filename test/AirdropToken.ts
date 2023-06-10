import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AirdropToken } from "../typechain-types";
import { generateDefaultTree } from "../utils/generateRootTree";

describe("AirdropToken", () => {
  async function defaulFixture() {
    await deployments.fixture(["airdrop-token-v1"]);
    const { deployer, owner, receiver } = await ethers.getNamedSigners();
    const { tree, list } = await generateDefaultTree();
    return { deployer, owner, receiver, tree, list };
  }

  describe("Sucesss", () => {
    it("should get the version of the contract", async () => {
      await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      expect(await AirdropToken.version()).to.equal("v1");
    });

    it("should have same address as the proxy", async () => {
      await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      const proxy = await ethers.getContract("AirdropToken_Proxy");

      expect(proxy.address).to.equal(AirdropToken.address);
    });
  });

  describe("Failure", () => {
    it("should fail if the minter is not the airdrop contract", async () => {
      await loadFixture(defaulFixture);

      const { owner, receiver, list } = await defaulFixture();

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await expect(
        AirdropToken.connect(owner).mint(receiver.address, list[0][1])
      ).to.be.revertedWith("Only airdrop");
    });
  });
});

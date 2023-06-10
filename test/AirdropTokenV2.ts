import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  AirdropTokenV2,
  AirdropToken,
  OwnerProxyAdmin,
  Airdrop,
} from "../typechain-types";
import { generateDefaultTree } from "../utils/generateRootTree";

describe("AirdropTokenV2", () => {
  async function defaulFixture() {
    await deployments.fixture(["airdrop-token-v1"]);
    const instance = await ethers.getContract("AirdropToken_Proxy");

    const { deployer, owner, receiver } = await ethers.getNamedSigners();
    return { deployer, owner, receiver, instance };
  }

  async function upgradeFixture() {
    await deployments.fixture(["airdrop-token-v1", "airdrop-token-v2"]);
    const { tree, list } = await generateDefaultTree();
    const { deployer, owner } = await ethers.getNamedSigners();
    const instance = await ethers.getContract("AirdropToken_Proxy");

    const OwnerProxyAdmin: OwnerProxyAdmin = await ethers.getContract(
      "OwnerProxyAdmin"
    );

    const AirdropTokenV2 = await ethers.getContract("AirdropTokenV2");

    // upgrade

    await OwnerProxyAdmin.connect(owner).upgrade(
      instance.address,
      AirdropTokenV2.address
    );

    return { deployer, owner, tree, list };

    // const AirDropToken = await ethers.getContractFactory("AirDropToken");
    // const AirDropTokenV2 = await ethers.getContractFactory("AirDropTokenV2`");

    // //initilize with 42
    // const implementation = await upgrades.deployProxy(AirDropToken, [
    //   tree.root,
    // ]);

    // const instance = await upgrades.upgradeProxy(
    //   implementation.address,
    //   AirDropTokenV2
    // );

    // return { deployer, owner, tree, list, instance };
  }

  describe("Sucesss", () => {
    // it should be able to claim tokens and then upgrade and check the balance
    it("should be able to claim tokens and then upgrade and check the balance", async () => {
      const { instance } = await loadFixture(defaulFixture);

      const { deployer } = await ethers.getNamedSigners();
      const { tree } = await generateDefaultTree();

      // version 1
      const AirdropToken: AirdropToken = await ethers.getContractAt(
        "AirdropToken",
        instance.address
      );

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");

      await Airdrop.connect(deployer).redeem(
        tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
        ethers.utils.parseEther("1000")
      );

      expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );

      // upgrade
      await loadFixture(upgradeFixture);

      const AirdropTokenV2: AirdropTokenV2 = await ethers.getContractAt(
        "AirdropTokenV2",
        instance.address
      );

      expect(await AirdropTokenV2.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );
    });

    it("should get the version of the contract", async () => {
      await loadFixture(defaulFixture);
      await loadFixture(upgradeFixture);

      const AirdropToken: AirdropTokenV2 = await ethers.getContract(
        "AirdropTokenV2"
      );

      expect(await AirdropToken.version()).to.equal("v2");
    });
  });

  describe("Failure", () => {
    it("should revert when trying to claim tokens after the upgrade", async () => {
      const { instance } = await loadFixture(defaulFixture);
      await loadFixture(upgradeFixture);

      const { deployer } = await ethers.getNamedSigners();
      const { tree } = await generateDefaultTree();

      // version 1
      const AirdropToken: AirdropToken = await ethers.getContractAt(
        "AirdropToken",
        instance.address
      );

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");

      expect(
        Airdrop.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith(
        "Transaction reverted: function selector was not recognized and there's no fallback function"
      );
    });
  });
});

import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AirdropToken, Airdrop, OwnerProxyAdmin } from "../typechain-types";
import { generateDefaultTree } from "../utils/generateRootTree";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("Airdrop", () => {
  async function defaulFixture() {
    await deployments.fixture(["airdrop-token-v1"]);
    const { deployer, owner, receiver } = await ethers.getNamedSigners();
    const { tree, list } = await generateDefaultTree();

    return { deployer, owner, receiver, tree, list };
  }

  async function upgradeFixture() {
    await deployments.fixture();
    const { tree, list } = await generateDefaultTree();
    const { deployer, owner } = await ethers.getNamedSigners();
    const instance = await ethers.getContract("AirdropToken");

    const OwnerProxyAdmin: OwnerProxyAdmin = await ethers.getContract(
      "OwnerProxyAdmin"
    );

    const AirdropTokenV2 = await ethers.getContract("AirdropTokenV2");

    // upgrade
    await OwnerProxyAdmin.connect(owner).upgrade(
      instance.address,
      AirdropTokenV2.address
    );

    return { deployer, owner, tree, list, instance };
  }

  describe("Sucesss", () => {
    // it should be able to claim tokens
    it("should be able to claim tokens", async () => {
      const { deployer, owner, receiver, tree } = await loadFixture(
        defaulFixture
      );
      const Airdrop: Airdrop = await ethers.getContract("Airdrop");
      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await Airdrop.connect(deployer).redeem(
        tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
        ethers.utils.parseEther("1000")
      );

      expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );

      await Airdrop.connect(owner).redeem(
        tree.getProof([owner.address, ethers.utils.parseEther("2000")]),
        ethers.utils.parseEther("2000")
      );

      expect(await AirdropToken.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("2000")
      );

      expect(
        Airdrop.connect(receiver).redeem(
          tree.getProof([receiver.address, ethers.utils.parseEther("3000")]),
          ethers.utils.parseEther("3000")
        )
      )
        .to.emit(AirdropToken, "Redeem")
        .withArgs(receiver.address, ethers.utils.parseEther("3000"));

      expect(await AirdropToken.balanceOf(receiver.address)).to.equal(
        ethers.utils.parseEther("3000")
      );
    });
  });

  describe("Failure", () => {
    it("should not be able to claim tokens twice", async () => {
      const { deployer, tree } = await loadFixture(defaulFixture);

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");
      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await Airdrop.connect(deployer).redeem(
        tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
        ethers.utils.parseEther("1000")
      );

      expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );

      await expect(
        Airdrop.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith("Already claimed");
    });

    it("should not be able to claim tokens with invalid proof", async () => {
      const { deployer, tree } = await loadFixture(defaulFixture);

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");

      await expect(
        Airdrop.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("2000")
        )
      ).to.be.revertedWith("Invalid proof");
    });

    it("should not be able to claim tokens with invalid msg.sender but valid proof", async () => {
      const { deployer, receiver, tree } = await loadFixture(defaulFixture);

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");

      await expect(
        Airdrop.connect(receiver).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith("Invalid proof");
    });

    it("should not be able to claim tokens when the tree proof is different", async () => {
      const { deployer, owner, receiver } = await loadFixture(defaulFixture);

      const list = [
        [deployer.address, ethers.utils.parseEther("2000000")],
        [owner.address, ethers.utils.parseEther("22222222")],
        [receiver.address, ethers.utils.parseEther("22222")],
      ];

      const tree = StandardMerkleTree.of(list, ["address", "uint256"]);

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");

      await expect(
        Airdrop.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("2000000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith("Invalid proof");
    });

    // it should fail when try to set the token again
    it("should fail when try to set the token again", async () => {
      const { deployer } = await loadFixture(defaulFixture);

      const Airdrop: Airdrop = await ethers.getContract("Airdrop");
      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await expect(
        Airdrop.connect(deployer).setToken(AirdropToken.address)
      ).to.be.revertedWith("Already set");
    });
  });
});

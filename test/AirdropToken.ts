import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AirdropToken } from "../typechain-types";
import { generateDefaultTree } from "../utils/generateRootTree";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("AirdropToken", () => {
  async function defaulFixture() {
    await deployments.fixture(["airdrop-token-v1"]);
    const { deployer, owner, receiver } = await ethers.getNamedSigners();
    const { tree, list } = await generateDefaultTree();
    return { deployer, owner, receiver, tree, list };
  }

  describe("Sucesss", () => {
    it("should be able to claim tokens", async () => {
      const { deployer, owner, receiver, tree } = await loadFixture(
        defaulFixture
      );

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await AirdropToken.connect(deployer).redeem(
        tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
        ethers.utils.parseEther("1000")
      );

      expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );

      await AirdropToken.connect(owner).redeem(
        tree.getProof([owner.address, ethers.utils.parseEther("2000")]),
        ethers.utils.parseEther("2000")
      );

      expect(await AirdropToken.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("2000")
      );

      expect(
        AirdropToken.connect(receiver).redeem(
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

    // it should get the version of the contract
    it("should get the version of the contract", async () => {
      const { deployer } = await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      expect(await AirdropToken.version()).to.equal("v1");
    });
  });

  describe("Failure", () => {
    it("should not be able to claim tokens twice", async () => {
      const { deployer, tree } = await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await AirdropToken.connect(deployer).redeem(
        tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
        ethers.utils.parseEther("1000")
      );

      expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
        ethers.utils.parseEther("1000")
      );

      await expect(
        AirdropToken.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith("Already claimed");
    });

    it("should not be able to claim tokens with invalid proof", async () => {
      const { deployer, tree } = await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await expect(
        AirdropToken.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
          ethers.utils.parseEther("2000")
        )
      ).to.be.revertedWith("Invalid proof");
    });

    it("should not be able to claim tokens with invalid msg.sender but valid proof", async () => {
      const { deployer, receiver, tree } = await loadFixture(defaulFixture);

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await expect(
        AirdropToken.connect(receiver).redeem(
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

      const AirdropToken: AirdropToken = await ethers.getContract(
        "AirdropToken"
      );

      await expect(
        AirdropToken.connect(deployer).redeem(
          tree.getProof([deployer.address, ethers.utils.parseEther("2000000")]),
          ethers.utils.parseEther("1000")
        )
      ).to.be.revertedWith("Invalid proof");
    });
  });
});

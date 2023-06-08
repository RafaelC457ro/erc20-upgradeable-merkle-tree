import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { AirdropToken } from "../typechain-types";

describe("AirdropToken", () => {
  async function defaulFixture() {
    await deployments.fixture();
    const { deployer, owner, receiver } = await ethers.getNamedSigners();
    const list = [
      [deployer.address, ethers.utils.parseEther("1000")],
      [owner.address, ethers.utils.parseEther("2000")],
      [receiver.address, ethers.utils.parseEther("3000")],
    ];
    const tree = StandardMerkleTree.of(list, ["address", "uint256"]);
    return { deployer, owner, receiver, tree };
  }

  it("should be able to claim tokens", async () => {
    const { deployer, owner, receiver, tree } = await loadFixture(
      defaulFixture
    );

    const AirdropToken: AirdropToken = await ethers.getContract("AirdropToken");

    await AirdropToken.redeem(
      tree.getProof([deployer.address, ethers.utils.parseEther("1000")]),
      ethers.utils.parseEther("1000")
    );

    expect(await AirdropToken.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseEther("1000")
    );

    await AirdropToken.redeem(
      tree.getProof([owner.address, ethers.utils.parseEther("2000")]),
      ethers.utils.parseEther("2000")
    );

    expect(await AirdropToken.balanceOf(owner.address)).to.equal(
      ethers.utils.parseEther("2000")
    );

    await AirdropToken.redeem(
      tree.getProof([receiver.address, ethers.utils.parseEther("3000")]),
      ethers.utils.parseEther("3000")
    );

    expect(await AirdropToken.balanceOf(receiver.address)).to.equal(
      ethers.utils.parseEther("3000")
    );
  });
});

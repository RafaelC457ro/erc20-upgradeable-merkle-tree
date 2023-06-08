import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export async function generateDefaultRootTree() {
  const { deployer, owner, receiver } = await ethers.getNamedSigners();

  const list = [
    [deployer.address, ethers.utils.parseEther("1000")],
    [owner.address, ethers.utils.parseEther("2000")],
    [receiver.address, ethers.utils.parseEther("3000")],
  ];

  const tree = StandardMerkleTree.of(list, ["address", "uint256"]);

  console.log("Root:", tree.root);

  return tree;
}

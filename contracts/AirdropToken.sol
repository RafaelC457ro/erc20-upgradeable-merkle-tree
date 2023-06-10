// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AirdropToken is Initializable, ERC20Upgradeable {
    bytes32 private merkleRoot;
    mapping(address => bool) public claimed;

    event Redeem(address indexed account, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract setting the merkle root
     */
    function initialize(bytes32 _merkleRoot) public initializer {
        __ERC20_init("AirdropToken", "ADT");
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev redeem tokens
     * @param proof merkle proof
     * @param amount amount of tokens to redeem
     */
    function redeem(bytes32[] calldata proof, uint256 amount) public {
        require(_verify(proof, amount), "Invalid proof");
        require(!claimed[msg.sender], "Already claimed");

        emit Redeem(msg.sender, amount);
        claimed[msg.sender] = true;
        _mint(msg.sender, amount);
    }

    /**
     * @dev verify merkle proof
     * @param proof merkle proof
     * @param amount amount of tokens to redeem
     */
    function _verify(bytes32[] calldata proof, uint256 amount) private view returns (bool) {
        return MerkleProofUpgradeable.verify(proof, merkleRoot, _leaf(msg.sender, amount));
    }

    /**
     * @dev generate leaf
     * @param account address of the account
     * @param amount amount of tokens to redeem
     */
    function _leaf(address account, uint256 amount) private pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
    }

    /**
     * @dev get version
     */
    function version() public pure virtual returns (string memory) {
        return "v1";
    }
}

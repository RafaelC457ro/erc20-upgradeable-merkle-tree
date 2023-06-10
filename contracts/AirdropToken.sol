// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AirdropToken is Initializable, ERC20Upgradeable {
    address private airdrop;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier onlyAirdrop() {
        require(msg.sender == airdrop, "Only airdrop");
        _;
    }

    /**
     * @dev Initializes the contract setting the merkle root
     */
    function initialize(address _airdrop) public initializer {
        __ERC20_init("AirdropToken", "ADT");
        airdrop = _airdrop;
    }

    /**
     * @dev mint tokens
     * @param account address of the account
     * @param amount amount of tokens to redeem
     */
    function mint(address account, uint256 amount) public onlyAirdrop {
        _mint(account, amount);
    }

    /**
     * @dev get version
     */
    function version() public pure returns (string memory) {
        return "v1";
    }

    uint256[49] private __gap;
}

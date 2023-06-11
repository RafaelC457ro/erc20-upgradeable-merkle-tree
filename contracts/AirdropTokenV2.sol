// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AirdropTokenV2 is Initializable, ERC20Upgradeable {
    /// @custom:oz-renamed-from airdrop
    address private __do_not_use;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev get version
     */
    function version() public pure returns (string memory) {
        return "v2";
    }

    uint256[49] __gap;
}

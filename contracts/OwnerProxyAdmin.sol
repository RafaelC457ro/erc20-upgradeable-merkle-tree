// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract OwnerProxyAdmin is ProxyAdmin {
    constructor(address initialOwner) {
        /* ignore */
        transferOwnership(initialOwner);
    }
}

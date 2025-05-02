// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDMediator is ERC20, Ownable {
    constructor() ERC20("USDMediator", "USD") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function transferUSD(address to, uint256 amount) external {
        _transfer(msg.sender, to, amount);
    }
}

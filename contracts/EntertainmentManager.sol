// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EntertainmentManager {
    address public owner;
    mapping(address => mapping(string => uint256)) public gameRewards;
    uint256 public constant AD_REWARD = 1 ether; // 1 GOATE token per ad

    event GamePlayed(address indexed player, string game, string mode);
    event AdWatched(address indexed viewer, uint256 reward);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function playGame(string memory game, string memory mode) external {
        emit GamePlayed(msg.sender, game, mode);
    }

    function watchAds() external {
        gameRewards[msg.sender]["GOATE"] += AD_REWARD;
        emit AdWatched(msg.sender, AD_REWARD);
    }
}

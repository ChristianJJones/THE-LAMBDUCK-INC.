// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenManager {
    address public owner;
    mapping(address => mapping(string => uint256)) public balances;
    mapping(string => mapping(string => uint256)) public insuranceBalances;

    event Transfer(string asset, address indexed from, address indexed to, uint256 amount);
    event InsuranceAdded(string deviceId, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function transfer(string memory asset, address to, uint256 amount) external {
        require(balances[msg.sender][asset] >= amount, "Insufficient balance");
        balances[msg.sender][asset] -= amount;
        balances[to][asset] += amount;
        emit Transfer(asset, msg.sender, to, amount);
    }

    function addToInsurance(string memory deviceId, uint256 amount) external {
        require(balances[msg.sender]["ZPE"] >= amount, "Insufficient ZPE balance");
        balances[msg.sender]["ZPE"] -= amount;
        insuranceBalances[deviceId]["ZPE"] += amount;
        emit InsuranceAdded(deviceId, amount);
    }

    function getBalance(string memory asset) external view returns (uint256) {
        return balances[msg.sender][asset];
    }

    // For testing: mint tokens
    function mint(string memory asset, uint256 amount) external onlyOwner {
        balances[msg.sender][asset] += amount;
    }
}

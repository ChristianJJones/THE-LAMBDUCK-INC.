// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FinanceManager {
    address public owner;
    mapping(address => mapping(string => uint256)) public balances;
    mapping(address => mapping(string => uint256)) public stakedBalances;
    mapping(address => mapping(string => uint256)) public farmedBalances;
    mapping(address => mapping(string => uint256)) public liquidityBalances;
    mapping(address => mapping(string => mapping(string => uint256))) public dualStakedBalances;
    mapping(address => mapping(string => uint256)) public lentBalances;
    mapping(address => mapping(string => uint256)) public borrowedBalances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Staked(address indexed user, string asset, uint256 amount);
    event Farmed(address indexed user, string asset, uint256 amount);
    event LiquidityProvided(address indexed user, string asset, uint256 amount);
    event DualStaked(address indexed user, string asset1, string asset2, uint256 amount);
    event Lent(address indexed user, string asset, uint256 amount);
    event Borrowed(address indexed user, string asset, uint256 amount, uint256 collateral);
    event AdWatched(address indexed viewer, string asset, uint256 reward);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function deposit(uint256 amount) external {
        balances[msg.sender]["USD"] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender]["USD"] >= amount, "Insufficient USD balance");
        balances[msg.sender]["USD"] -= amount;
        emit Withdraw(msg.sender, amount);
    }

    function stake(string memory asset, uint256 amount) external {
        require(balances[msg.sender][asset] >= amount, "Insufficient balance");
        balances[msg.sender][asset] -= amount;
        stakedBalances[msg.sender][asset] += amount;
        emit Staked(msg.sender, asset, amount);
    }

    function farm(string memory asset, uint256 amount) external {
        require(balances[msg.sender][asset] >= amount, "Insufficient balance");
        balances[msg.sender][asset] -= amount;
        farmedBalances[msg.sender][asset] += amount;
        emit Farmed(msg.sender, asset, amount);
    }

    function provideLiquidity(string memory asset, uint256 amount) external {
        require(balances[msg.sender][asset] >= amount, "Insufficient balance");
        balances[msg.sender][asset] -= amount;
        liquidityBalances[msg.sender][asset] += amount;
        emit LiquidityProvided(msg.sender, asset, amount);
    }

    function dualStake(string memory asset1, string memory asset2, uint256 amount) external {
        require(balances[msg.sender][asset1] >= amount, "Insufficient balance for asset1");
        require(balances[msg.sender][asset2] >= amount, "Insufficient balance for asset2");
        balances[msg.sender][asset1] -= amount;
        balances[msg.sender][asset2] -= amount;
        dualStakedBalances[msg.sender][asset1][asset2] += amount;
        emit DualStaked(msg.sender, asset1, asset2, amount);
    }

    function lend(string memory asset, uint256 amount) external {
        require(balances[msg.sender][asset] >= amount, "Insufficient balance");
        balances[msg.sender][asset] -= amount;
        lentBalances[msg.sender][asset] += amount;
        emit Lent(msg.sender, asset, amount);
    }

    function borrow(string memory asset, uint256 amount, uint256 collateral) external {
        require(balances[msg.sender][asset] >= collateral, "Insufficient collateral");
        balances[msg.sender][asset] -= collateral;
        borrowedBalances[msg.sender][asset] += amount;
        emit Borrowed(msg.sender, asset, amount, collateral);
    }

    function watchAd(string memory asset) external {
        balances[msg.sender][asset] += 0.5 ether; // 50% revenue
        emit AdWatched(msg.sender, asset, 0.5 ether);
    }
}

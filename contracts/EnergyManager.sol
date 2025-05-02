// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EnergyManager {
    address public owner;
    mapping(string => uint256) public energyConsumed;
    mapping(string => bool) public registeredDevices;

    event EnergyConsumed(string deviceId, uint256 amount);
    event DeviceRegistered(string deviceId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function registerDevice(string memory deviceId) external {
        require(!registeredDevices[deviceId], "Device already registered");
        registeredDevices[deviceId] = true;
        emit DeviceRegistered(deviceId);
    }

    function consumeEnergy(string memory deviceId, uint256 amount) external {
        require(registeredDevices[deviceId], "Device not registered");
        energyConsumed[deviceId] += amount;
        emit EnergyConsumed(deviceId, amount);
    }

    function getEnergyConsumed(string memory deviceId) external view returns (uint256) {
        return energyConsumed[deviceId];
    }
}

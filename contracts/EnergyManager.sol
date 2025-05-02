// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Zeropoint.sol";
import "./DeviceConnect.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyManager is Ownable {
    Zeropoint public zpeToken;
    DeviceConnect public deviceConnect;

    uint256 public constant ENERGY_PRICE = 111800; // 0.1118 USD per kWh, in wei (0.1118 * 10^6)
    uint256 public totalEnergySupply; // Total energy available in kWh

    event EnergyProvided(address indexed user, string deviceId, uint256 amount);
    event EnergyConsumed(address indexed user, string deviceId, uint256 amount);
    event EnergyTransferred(address indexed from, address indexed to, uint256 amount);

    constructor(address _zpeToken, address _deviceConnect) {
        zpeToken = Zeropoint(_zpeToken);
        deviceConnect = DeviceConnect(_deviceConnect);
    }

    // Provide energy from a device to the node network
    function provideEnergy(string memory deviceId, uint256 amount) external {
        require(deviceConnect.canProvideEnergy(deviceId), "Device not eligible to provide energy");

        totalEnergySupply += amount;
        zpeToken.provideEnergy(msg.sender, amount * ENERGY_PRICE);

        emit EnergyProvided(msg.sender, deviceId, amount);
    }

    // Consume energy to a device
    function consumeEnergy(string memory deviceId, uint256 amount) external {
        require(totalEnergySupply >= amount, "Insufficient energy supply");

        totalEnergySupply -= amount;
        zpeToken.consumeEnergy(msg.sender, amount * ENERGY_PRICE);

        emit EnergyConsumed(msg.sender, deviceId, amount);
    }

    // Transfer energy to another user (e.g., for a dead device)
    function transferEnergy(address to, uint256 amount) external {
        require(totalEnergySupply >= amount, "Insufficient energy supply");

        totalEnergySupply -= amount;
        zpeToken.consumeEnergy(msg.sender, amount * ENERGY_PRICE);
        zpeToken.provideEnergy(to, amount * ENERGY_PRICE);

        emit EnergyTransferred(msg.sender, to, amount);
    }

    // Renew energy after consumption (as per the PDF)
    function renewEnergy(uint256 amount) external onlyOwner {
        totalEnergySupply += amount;
    }
}

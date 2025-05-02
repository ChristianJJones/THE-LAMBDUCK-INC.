// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeviceConnect {
    struct Device {
        string deviceId;
        bool isActive;
        uint256 modalCount;
        uint256 batteryCapacity; // Percentage (0-100)
        bool isCharging;
    }

    mapping(address => Device[]) public userDevices;

    event DeviceConnected(address indexed user, string deviceId);
    event DeviceUpdated(address indexed user, string deviceId, uint256 batteryCapacity, bool isCharging);

    function connectDevice(string memory deviceId) external {
        userDevices[msg.sender].push(Device(deviceId, true, 0, 100, false));
        emit DeviceConnected(msg.sender, deviceId);
    }

    function updateDeviceStatus(string memory deviceId, uint256 batteryCapacity, bool isCharging) external {
        uint256 index = findDeviceIndex(deviceId);
        Device storage device = userDevices[msg.sender][index];
        device.batteryCapacity = batteryCapacity;
        device.isCharging = isCharging;
        emit DeviceUpdated(msg.sender, deviceId, batteryCapacity, isCharging);
    }

    function findDeviceIndex(string memory deviceId) internal view returns (uint256) {
        for (uint256 i = 0; i < userDevices[msg.sender].length; i++) {
            if (keccak256(abi.encodePacked(userDevices[msg.sender][i].deviceId)) == keccak256(abi.encodePacked(deviceId))) {
                return i;
            }
        }
        revert("Device not found");
    }

    function canProvideEnergy(string memory deviceId) external view returns (bool) {
        uint256 index = findDeviceIndex(deviceId);
        Device memory device = userDevices[msg.sender][index];
        return device.batteryCapacity > 96 && device.isCharging;
    }
}

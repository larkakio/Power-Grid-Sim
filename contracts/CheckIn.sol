// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. No ETH accepted — user pays L2 gas only.
contract CheckIn {
    error ValueNotZero();
    error AlreadyCheckedInToday();

    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    /// @dev 0 = never checked; otherwise stores (calendar day index + 1) so 0 stays a sentinel.
    mapping(address => uint256) private lastCheckPacked;
    mapping(address => uint256) public streakOf;

    function lastCheckDay(address user) external view returns (uint256) {
        uint256 p = lastCheckPacked[user];
        return p == 0 ? 0 : p - 1;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotZero();

        uint256 day = block.timestamp / 1 days;
        uint256 packed = lastCheckPacked[msg.sender];

        if (packed != 0 && packed - 1 == day) revert AlreadyCheckedInToday();

        uint256 lastDay = packed == 0 ? type(uint256).max : packed - 1;

        uint256 newStreak;
        if (packed == 0) {
            newStreak = 1;
        } else if (day == lastDay + 1) {
            newStreak = streakOf[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckPacked[msg.sender] = day + 1;
        streakOf[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}

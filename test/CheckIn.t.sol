// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../contracts/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn internal c;
    address internal alice = address(0xA11ce);

    function setUp() public {
        c = new CheckIn();
    }

    function test_RevertWhen_ValueSent() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(CheckIn.ValueNotZero.selector);
        vm.prank(alice);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckIn_EmitsAndSetsStreak() public {
        uint256 day = block.timestamp / 1 days;

        vm.expectEmit(true, true, true, true);
        emit CheckIn.CheckedIn(alice, day, 1);

        vm.prank(alice);
        c.checkIn();

        assertEq(c.lastCheckDay(alice), day);
        assertEq(c.streakOf(alice), 1);
    }

    function test_RevertWhen_SecondCheckInSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_Streak_IncrementsNextDay() public {
        vm.startPrank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 1 days);
        c.checkIn();

        assertEq(c.streakOf(alice), 2);
        vm.stopPrank();
    }

    function test_Streak_ResetsAfterGap() public {
        vm.startPrank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 3 days);
        c.checkIn();

        assertEq(c.streakOf(alice), 1);
        vm.stopPrank();
    }
}

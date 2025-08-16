// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Secure Vault Contract
/// @notice This contract implements proper security measures to prevent reentrancy attacks
/// @dev Uses OpenZeppelin's ReentrancyGuard and follows Checks-Effects-Interactions pattern
contract VaultSecure is ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    /// @notice Deposit ETH into the vault
    function deposit() external payable {
        require(msg.value > 0, "Must deposit something");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /// @notice Withdraw ETH from the vault
    /// @dev SECURE: Uses ReentrancyGuard and Checks-Effects-Interactions pattern
    /// @param amount Amount to withdraw in wei
    function withdraw(uint256 amount) external nonReentrant {
        // CHECKS: Validate conditions
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // EFFECTS: Update state before external calls
        balances[msg.sender] -= amount;
        
        // INTERACTIONS: External calls happen last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /// @notice Alternative secure withdrawal using pull pattern
    /// @dev This version uses a pull-based approach for even better security
    /// @param amount Amount to withdraw in wei
    function withdrawPull(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        // Using transfer() which limits gas and prevents reentrancy
        // Note: transfer() has been discouraged lately, but shown here for educational purposes
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /// @notice Get balance of a user
    /// @param user Address to check balance for
    /// @return User's balance in wei
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /// @notice Get total contract balance
    /// @return Total ETH held by contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /// @notice Emergency withdrawal function with additional security
    /// @dev Can only withdraw user's own balance, with extra checks
    function emergencyWithdraw() external nonReentrant {
        uint256 userBalance = balances[msg.sender];
        require(userBalance > 0, "No balance to withdraw");
        
        // Clear balance first
        balances[msg.sender] = 0;
        
        // Use low-level call with gas limit to prevent reentrancy
        (bool success, ) = msg.sender.call{value: userBalance, gas: 2300}("");
        
        if (!success) {
            // If transfer fails, restore the balance
            balances[msg.sender] = userBalance;
            revert("Emergency withdrawal failed");
        }
        
        emit Withdrawal(msg.sender, userBalance);
    }
}
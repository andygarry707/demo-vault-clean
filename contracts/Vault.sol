// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Vulnerable Vault Contract
/// @notice This contract intentionally contains a reentrancy vulnerability for educational purposes
/// @dev WARNING: This contract is vulnerable to reentrancy attacks - DO NOT use in production
contract Vault {
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
    /// @dev VULNERABLE: This function is susceptible to reentrancy attacks
    /// @param amount Amount to withdraw in wei
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // VULNERABILITY: State update happens AFTER external call
        // This allows for reentrancy attacks
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
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
}
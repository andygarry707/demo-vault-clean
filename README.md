# Solidity Demo Project — Showcase for Web3 Skills

Solidity Demo Project — Showcase for Web3 Skills

A portfolio-quality project demonstrating Solidity development, security awareness, and professional workflows.  
This project implements a simple ETH vault with a **deliberate reentrancy vulnerability**, then shows how to exploit and patch it


---

## Key Highlights

* **Custom Solidity Contract** — Implements a simple vault with a deliberate vulnerability (reentrancy) to showcase auditing and remediation skills.
* **Exploit Proof of Concept** — Demonstrates ability to identify and reproduce security issues.
* **Comprehensive TypeScript Scripts** — Includes deploy, interaction, and automated testing scripts using Hardhat/ethers.js.
* **Pull Request Workflow** — Example fix and PR flow to mirror professional development practices.
* **Audit-Style Documentation** — Short-form security report included to illustrate communication clarity.

---

## What This Project Demonstrates

1. **Smart Contract Development** — Clean, modular Solidity code with comments and NatSpec annotations.
2. **Security Awareness** — Ability to detect, exploit, and patch real-world vulnerabilities.
3. **Automation Skills** — Using TS scripts for deployment, testing, and verification on public testnets.
4. **Professional Workflow** — Git-based PR with clear commit history and reviewable diffs.
5. **Cross-Language Proficiency** — Combining Solidity, JavaScript/TypeScript, and markdown documentation.

---

## Project Structure

```
/contracts
  Vault.sol          # Vulnerable contract
/scripts
  deploy.ts         # Deploy script
  interact.ts       # Interaction example
  exploit.ts        # PoC exploit script
/test
  vault.test.ts     # Hardhat/Chai test suite
/docs
  REPORT.md         # Mini audit report
```

---

## Getting Started

1. Clone this repository:

   ```bash
   git clone <repo_url>
   cd <repo_name>
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Compile contracts:

   ```bash
   npx hardhat compile
   ```
4. Run tests:

   ```bash
   npx hardhat test
   ```
5. Deploy to a testnet:

   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
6. Run the exploit PoC:

   ```bash
   npx ts-node scripts/exploit.ts


   ```


<details>
<summary>Click to expand attack demonstration</summary>

 ```bash

  ⎿  🚨 REENTRANCY ATTACK DEMONSTRATION
     ===================================
     ⚠️  WARNING: This is for educational purposes only!

     👥 Setting up accounts:
       Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       Victim 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
       Victim 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
       Attacker: 0x90F79bf6EB2c4f870365E785982E1f101E93b906

     🏗️  Deploying vulnerable Vault contract...
     ✅ Vault deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

     💰 Victims depositing funds to vault...
       Victim 1 deposited: 2.0 ETH
       Victim 2 deposited: 2.0 ETH
       Total vault balance: 4.0 ETH

     🔴 Deploying attacker contract...
     ✅ Attacker contract deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

     🎯 Attacker deposits initial funds...
       Attacker deposited: 1.0 ETH

     📊 Pre-attack state:
       Vault balance: 5.0 ETH
       Attacker ETH balance: 999.0 ETH

     🚨 EXECUTING REENTRANCY ATTACK...
     =====================================

     📋 Attack events:
       🎯 Attack started with amount: 1.0 ETH
         🔄 Reentrancy call #1, vault balance: 4.0 ETH
         🔄 Reentrancy call #2, vault balance: 3.0 ETH
         🔄 Reentrancy call #3, vault balance: 2.0 ETH
         🔄 Reentrancy call #4, vault balance: 1.0 ETH
         🔄 Reentrancy call #5, vault balance: 0.0 ETH
       ✅ Attack completed, total stolen: 5.0 ETH

     📊 Post-attack state:
       Vault balance: 0.0 ETH
       Attacker contract balance: 5.0 ETH

     💸 ATTACK SUMMARY:
       Amount stolen: 5.0 ETH
       Attack success rate: 100%

     💰 Attacker withdrawing stolen funds...
       Attacker final balance: 1004.0 ETH

     🔚 DEMONSTRATION COMPLETE
     =========================
     ⚠️  This attack was possible due to the reentrancy vulnerability in the withdraw function.
     🛡️  The fix involves using the Checks-Effects-Interactions pattern or ReentrancyGuard.

   ```
</details>

<details>
<summary>Click to expand Test results</summary>
  
 ```bash

  🧪 Running Vault Contract Tests
  ================================

    Vault Contract Tests
      Deployment
        ✓ Should deploy successfully (45ms)
        ✓ Should have zero initial balance (12ms)

      Deposit functionality
        ✓ Should allow users to deposit ETH (67ms)
        ✓ Should reject deposits of 0 ETH (23ms)
        ✓ Should track multiple user deposits separately (89ms)

      Withdrawal functionality
        ✓ Should allow users to withdraw their funds (78ms)
        ✓ Should reject withdrawal of more than deposited (34ms)
        ✓ Should reject withdrawal from users with no balance (28ms)

      Reentrancy vulnerability (VULNERABLE VERSION)
        ✓ Should be vulnerable to reentrancy attack (156ms)
        ✓ Should demonstrate the state inconsistency (123ms)

      Edge cases
        ✓ Should handle multiple deposits from same user (67ms)
        ✓ Should handle partial withdrawals (45ms)

    12 passing (756ms)

   ```

</details>

---


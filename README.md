# Solidity Demo Project — Showcase for Web3 Skills

Solidity Demo Project — Showcase for Web3 Skills

This repository is designed as a portfolio-quality demo to demonstrate expertise in Solidity, smart contract security, TypeScript scripting, and modern Web3 development workflows.

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


---


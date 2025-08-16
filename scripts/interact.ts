import { ethers } from "hardhat";
import * as readline from "readline";

// Contract address - update this after deployment
const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  if (!VAULT_ADDRESS) {
    console.log("❌ Please set VAULT_ADDRESS environment variable");
    console.log("Example: VAULT_ADDRESS=0x123... npx ts-node scripts/interact.ts");
    process.exit(1);
  }

  console.log("🏦 Vault Contract Interaction CLI");
  console.log("================================");
  
  const [signer] = await ethers.getSigners();
  console.log("📝 Using account:", signer.address);
  
  // Connect to the deployed contract
  const Vault = await ethers.getContractFactory("Vault");
  const vault = Vault.attach(VAULT_ADDRESS);
  
  console.log("🔗 Connected to Vault at:", VAULT_ADDRESS);
  
  while (true) {
    console.log("\n📋 Available commands:");
    console.log("1. Check balance");
    console.log("2. Deposit ETH");
    console.log("3. Withdraw ETH");
    console.log("4. View contract balance");
    console.log("5. Exit");
    
    const choice = await question("\n👉 Enter your choice (1-5): ");
    
    try {
      switch (choice) {
        case "1":
          await checkBalance(vault, signer.address);
          break;
        case "2":
          await depositETH(vault);
          break;
        case "3":
          await withdrawETH(vault);
          break;
        case "4":
          await viewContractBalance(vault);
          break;
        case "5":
          console.log("👋 Goodbye!");
          rl.close();
          return;
        default:
          console.log("❌ Invalid choice. Please try again.");
      }
    } catch (error) {
      console.log("❌ Error:", error);
    }
  }
}

async function checkBalance(vault: any, address: string) {
  const balance = await vault.getBalance(address);
  console.log(`💰 Your vault balance: ${ethers.formatEther(balance)} ETH`);
}

async function depositETH(vault: any) {
  const amount = await question("💰 Enter amount to deposit (in ETH): ");
  const value = ethers.parseEther(amount);
  
  console.log(`📤 Depositing ${amount} ETH...`);
  const tx = await vault.deposit({ value });
  console.log("⏳ Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Deposit successful! Block:", receipt.blockNumber);
}

async function withdrawETH(vault: any) {
  const amount = await question("💸 Enter amount to withdraw (in ETH): ");
  const value = ethers.parseEther(amount);
  
  console.log(`📥 Withdrawing ${amount} ETH...`);
  const tx = await vault.withdraw(value);
  console.log("⏳ Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Withdrawal successful! Block:", receipt.blockNumber);
}

async function viewContractBalance(vault: any) {
  const balance = await vault.getContractBalance();
  console.log(`🏦 Total contract balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
  rl.close();
});
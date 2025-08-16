import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying Vault contract...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);
  
  // Deploy the Vault contract
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  
  console.log("✅ Vault deployed to:", vaultAddress);
  console.log("🔍 Verification command:");
  console.log(`npx hardhat verify --network ${network.name} ${vaultAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: vaultAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Optionally verify on etherscan-like explorers
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await vault.deploymentTransaction()?.wait(5);
    
    try {
      console.log("🔍 Verifying contract on block explorer...");
      await run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
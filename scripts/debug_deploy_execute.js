const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment test...");
  const TokenFactory = await ethers.getContractFactory("AntiGravityToken");
  console.log("TokenFactory retrieved. Type:", typeof TokenFactory);
  console.log("Deploy function type:", typeof TokenFactory.deploy);
  
  const token = await TokenFactory.deploy();
  console.log("Deploy called. Transaction hash:", token.deploymentTransaction()?.hash);
  await token.waitForDeployment();
  console.log("Token address:", await token.getAddress());
}

main().catch(console.error);

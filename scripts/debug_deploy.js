const { ethers } = require("hardhat");

async function main() {
  const TokenFactory = await ethers.getContractFactory("AntiGravityToken");
  console.log("TokenFactory keys:", Object.keys(TokenFactory));
  console.log("Type of deploy:", typeof TokenFactory.deploy);
}

main().catch(console.error);

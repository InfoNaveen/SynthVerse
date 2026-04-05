const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("═══════════════════════════════════════════════════");
  console.log("  🚀 AntiGravity — Smart Contract Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:  ${network.name} (chainId: ${network.chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC`);
  console.log("═══════════════════════════════════════════════════\n");

  // ── Step 1: Deploy AntiGravityToken ──────────────────────
  console.log("📦 [1/3] Deploying AntiGravityToken (AGVT)...");
  const TokenFactory = await ethers.getContractFactory("AntiGravityToken");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`  ✅ AntiGravityToken: ${tokenAddress}\n`);

  // ── Step 2: Deploy AntiGravityAnchor ─────────────────────
  console.log("📦 [2/3] Deploying AntiGravityAnchor...");
  const AnchorFactory = await ethers.getContractFactory("AntiGravityAnchor");
  const anchor = await AnchorFactory.deploy(tokenAddress);
  await anchor.waitForDeployment();
  const anchorAddress = await anchor.getAddress();
  console.log(`  ✅ AntiGravityAnchor: ${anchorAddress}\n`);

  // ── Step 3: Deploy AntiGravityForensics ──────────────────
  console.log("📦 [3/3] Deploying AntiGravityForensics...");
  const ForensicsFactory = await ethers.getContractFactory("AntiGravityForensics");
  const forensics = await ForensicsFactory.deploy(anchorAddress);
  await forensics.waitForDeployment();
  const forensicsAddress = await forensics.getAddress();
  console.log(`  ✅ AntiGravityForensics: ${forensicsAddress}\n`);

  // ── Step 4: Set minter on token contract ─────────────────
  console.log("🔑 Setting AntiGravityAnchor as authorized minter on AGVT...");
  const setMinterTx = await token.setMinter(anchorAddress);
  await setMinterTx.wait();
  console.log("  ✅ Minter set to AntiGravityAnchor\n");

  // ── Step 5: Verify contracts on PolygonScan ──────────────
  if (Number(network.chainId) !== 31337) {
    console.log("🔍 Verifying contracts on PolygonScan...\n");

    // Wait for block explorer to index
    console.log("  ⏳ Waiting 30s for block explorer indexing...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      console.log("  Verifying AntiGravityToken...");
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [],
      });
      console.log("  ✅ AntiGravityToken verified\n");
    } catch (e) {
      console.log(`  ⚠️ Token verification: ${e.message}\n`);
    }

    try {
      console.log("  Verifying AntiGravityAnchor...");
      await hre.run("verify:verify", {
        address: anchorAddress,
        constructorArguments: [tokenAddress],
      });
      console.log("  ✅ AntiGravityAnchor verified\n");
    } catch (e) {
      console.log(`  ⚠️ Anchor verification: ${e.message}\n`);
    }

    try {
      console.log("  Verifying AntiGravityForensics...");
      await hre.run("verify:verify", {
        address: forensicsAddress,
        constructorArguments: [anchorAddress],
      });
      console.log("  ✅ AntiGravityForensics verified\n");
    } catch (e) {
      console.log(`  ⚠️ Forensics verification: ${e.message}\n`);
    }
  }

  // ── Step 6: Save deployed addresses ──────────────────────
  const deploymentData = {
    network: "polygonAmoy",
    chainId: Number(network.chainId),
    AntiGravityToken: tokenAddress,
    AntiGravityAnchor: anchorAddress,
    AntiGravityForensics: forensicsAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`💾 Deployment addresses saved to: deployed-addresses.json\n`);

  // ── Summary ──────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("  🎯 Deployment Complete!");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  AntiGravityToken:     ${tokenAddress}`);
  console.log(`  AntiGravityAnchor:    ${anchorAddress}`);
  console.log(`  AntiGravityForensics: ${forensicsAddress}`);
  console.log("═══════════════════════════════════════════════════");

  if (Number(network.chainId) !== 31337) {
    console.log("\n📋 PolygonScan Links:");
    console.log(`  https://amoy.polygonscan.com/address/${tokenAddress}`);
    console.log(`  https://amoy.polygonscan.com/address/${anchorAddress}`);
    console.log(`  https://amoy.polygonscan.com/address/${forensicsAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

/**
 * ECLIPSIS — Demo Seeding Script
 * Populates Polygon Amoy with initial anchors and forensics history.
 */
require('dotenv').config({ path: './backend/.env' });
const { ethers } = require('ethers');

const ABIs = {
  Anchor: [
    "function submitMerkleRoot(bytes32 root, string calldata ipfsCID) external",
    "function declareDarkPeriod() external",
    "function endDarkPeriod(string calldata reportCID) external",
    "function getMerkleCount() view returns (uint256)",
  ],
  Token: [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ]
};

async function main() {
  const rpcUrl = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.PRIVATE_KEY;
  const anchorAddr = process.env.CONTRACT_ANCHOR;
  const tokenAddr = process.env.CONTRACT_TOKEN;

  if (!privateKey || !anchorAddr) {
    console.error("Missing PRIVATE_KEY or CONTRACT_ANCHOR in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  console.log(`Using signer: ${signer.address}`);

  const anchor = new ethers.Contract(anchorAddr, ABIs.Anchor, signer);
  const token = new ethers.Contract(tokenAddr, ABIs.Token, signer);

  console.log("\n--- SEEDING ANCHORS ---");
  for (let i = 0; i < 3; i++) {
    const root = ethers.hexlify(ethers.randomBytes(32));
    console.log(`Submitting anchor ${i+1}: ${root}`);
    try {
      const tx = await anchor.submitMerkleRoot(root, "ipfs://setup-anchor-" + i);
      await tx.wait();
      console.log(`  ✅ Hash: ${tx.hash}`);
    } catch (e) {
      console.warn(`  ❌ Failed: ${e.message}`);
    }
  }

  console.log("\n--- SIMULATING DARK PERIOD ---");
  try {
    console.log("Declaring Dark Period...");
    const tx1 = await anchor.declareDarkPeriod();
    await tx1.wait();
    console.log(`  ✅ Declared: ${tx1.hash}`);

    console.log("Waiting 5s...");
    await new Promise(r => setTimeout(r, 5000));

    console.log("Ending Dark Period...");
    const tx2 = await anchor.endDarkPeriod("ipfs://forensic-report-seeded-1");
    await tx2.wait();
    console.log(`  ✅ Recovered: ${tx2.hash}`);
  } catch (e) {
    console.warn(`  ❌ Failed dark period simulation: ${e.message}`);
  }

  console.log("\n--- CHECKING TOKEN BALANCE ---");
  try {
    const bal = await token.balanceOf(signer.address);
    console.log(`Signer Balance: ${ethers.formatEther(bal)} AGVT`);
  } catch (e) {
    console.warn(`  ❌ Could not read balance: ${e.message}`);
  }

  console.log("\nDONE.");
}

main().catch(console.error);

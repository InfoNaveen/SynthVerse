async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  const nonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Nonce:", nonce);
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️ LOW BALANCE — get MATIC from:");
    console.log("https://faucet.polygon.technology");
  } else {
    console.log("✅ Balance sufficient for deployment");
  }
}
main().catch(console.error);

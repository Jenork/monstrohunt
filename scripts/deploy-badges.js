const hre = require("hardhat");

// Base URI for ERC-1155 metadata (optional; {id} is replaced with token ID by standard)
const BADGES_BASE_URI = process.env.BADGES_BASE_URI || "https://monstrohunt.app/badges/{id}.json";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying MonstroHuntBadges with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const MonstroHuntBadges = await hre.ethers.getContractFactory("MonstroHuntBadges");
  const badges = await MonstroHuntBadges.deploy(BADGES_BASE_URI);
  await badges.waitForDeployment();

  const address = await badges.getAddress();
  const deployTx = badges.deploymentTransaction();
  const blockNumber = deployTx ? deployTx.blockNumber : (await hre.ethers.provider.getBlock("latest")).number;

  console.log("MonstroHuntBadges deployed to:", address);
  console.log("Block:", blockNumber);
  console.log("Base URI:", BADGES_BASE_URI);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

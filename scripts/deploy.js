const { ethers } = require("hardhat");

// Hunger duration in seconds
// Testnet (Base Sepolia): 1 day = 86400 seconds
// Mainnet: 7 days = 604800 seconds
const HUNGER_DURATION_TESTNET = 86400;   // 1 day
const HUNGER_DURATION_MAINNET = 604800;  // 7 days

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  const isMainnet = network.chainId === 8453n; // Base Mainnet
  const hungerDuration = isMainnet ? HUNGER_DURATION_MAINNET : HUNGER_DURATION_TESTNET;
  
  console.log(`\nNetwork: ${network.name} (${network.chainId})`);
  console.log(`Hunger Duration: ${hungerDuration} seconds (${hungerDuration / 86400} days)`);
  console.log(`Mode: ${isMainnet ? 'MAINNET' : 'TESTNET'}\n`);

  const MonstroHunt = await ethers.getContractFactory("MonstroHunt");
  const monstroHunt = await MonstroHunt.deploy(hungerDuration);

  await monstroHunt.waitForDeployment();

  const address = await monstroHunt.getAddress();
  console.log("MonstroHunt deployed to:", address);
  
  console.log("\nDeployment Info:");
  console.log("Network:", network.name, `(${network.chainId})`);
  console.log("Contract Address:", address);
  console.log("Hunger Duration:", hungerDuration, "seconds");
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_HUNGER_DAYS=${hungerDuration / 86400}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

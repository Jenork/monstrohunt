const hre = require("hardhat");

// Hunger duration in seconds
// Testnet (Base Sepolia): 1 day = 86400 seconds
// Mainnet: 7 days = 604800 seconds
const HUNGER_DURATION_TESTNET = 86400;   // 1 day
const HUNGER_DURATION_MAINNET = 604800;  // 7 days

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  const isMainnet = network.chainId === 8453n; // Base Mainnet
  const hungerDuration = isMainnet ? HUNGER_DURATION_MAINNET : HUNGER_DURATION_TESTNET;
  
  console.log(`\nNetwork: ${network.name} (${network.chainId})`);
  console.log(`Hunger Duration: ${hungerDuration} seconds (${hungerDuration / 86400} days)`);
  console.log(`Mode: ${isMainnet ? 'MAINNET' : 'TESTNET'}\n`);

  const MonstroHunt = await hre.ethers.getContractFactory("MonstroHunt");
  const monstroHunt = await MonstroHunt.deploy(hungerDuration);

  const deployTx = monstroHunt.deploymentTransaction();
  const receipt = await monstroHunt.waitForDeployment();

  const address = await monstroHunt.getAddress();
  const blockNumber = deployTx ? deployTx.blockNumber : (await hre.ethers.provider.getBlock("latest")).number;

  console.log("MonstroHunt deployed to:", address);
  console.log("\n---");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("Network: Base Sepolia");
  console.log("Contract:", address);
  console.log("Block:", blockNumber);
  console.log("---");
  console.log("\nDeployment Info:");
  console.log("Network:", network.name, `(${network.chainId})`);
  console.log("Contract Address:", address);
  console.log("Block Number:", blockNumber);
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

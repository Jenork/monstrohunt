const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const MonstroHunt = await ethers.getContractFactory("MonstroHunt");
  const monstroHunt = await MonstroHunt.deploy();

  await monstroHunt.waitForDeployment();

  const address = await monstroHunt.getAddress();
  console.log("MonstroHunt deployed to:", address);
  
  // Save deployment info
  const network = await ethers.provider.getNetwork();
  console.log("\nDeployment Info:");
  console.log("Network:", network.name, `(${network.chainId})`);
  console.log("Contract Address:", address);
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

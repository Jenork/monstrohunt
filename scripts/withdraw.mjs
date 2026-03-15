/**
 * Withdraw protocol fees from MonstroHunt to treasury.
 * In .env set:
 *   PRIVATE_KEY = private key of treasury (0xEb45918A1efC99C84Fa337E36A2F84317a9DE1b8)
 *   NEXT_PUBLIC_CONTRACT_ADDRESS = your MonstroHunt contract address
 * Then run: npx hardhat run scripts/withdraw.js --network baseMainnet
 */
import hre from "hardhat";

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env to your MonstroHunt contract");
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("Treasury (caller):", signer.address);
  console.log("Contract:", contractAddress);

  const MonstroHunt = await hre.ethers.getContractFactory("MonstroHunt");
  const contract = MonstroHunt.attach(contractAddress);

  const balanceBefore = await contract.protocolBalance();
  console.log("Protocol balance (wei):", balanceBefore.toString());
  if (balanceBefore === 0n) {
    console.log("Nothing to withdraw.");
    return;
  }

  const tx = await contract.withdrawProtocolBalance();
  console.log("Tx hash:", tx.hash);
  await tx.wait();
  console.log("Withdraw done. Check treasury wallet balance.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

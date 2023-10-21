import { Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

const CONTRACT_NAME = "RewardMe"

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the ${CONTRACT_NAME} contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(CONTRACT_NAME);

  const args = [process.env.VERIFICATION_PUBLIC_KEY];
  const contract = await hre.zkUpgrades.deployProxy(deployer.zkWallet, artifact, args, { initializer: "initialize" });
  await contract.deployed();

  // Show the contract info.
  const contractAddress = contract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // Verify contract
  if (hre.network.config.verifyURL) {
    const verificationId = await hre.run("verify:verify", {
      address: contractAddress,
      contract: `contracts/${CONTRACT_NAME}.sol:${CONTRACT_NAME}`,
      constructorArguments: []
    });
    console.log(`Contract verified at ${verificationId}`);
  }
}

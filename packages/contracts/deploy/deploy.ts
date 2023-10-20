import { Wallet } from "zksync-web3";
import * as ethers from "ethers";
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

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the ${CONTRACT_NAME} contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(CONTRACT_NAME);

  // Estimate contract deployment fee
  const args = [process.env.VERIFICATION_PUBLIC_KEY];
  const deploymentFee = await deployer.estimateDeployFee(artifact, args);

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const contract = await deployer.deploy(artifact, args);

  //obtain the Constructor Arguments
  console.log(
    "Constructor args:" + contract.interface.encodeDeploy(args)
  );

  // Show the contract info.
  const contractAddress = contract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}

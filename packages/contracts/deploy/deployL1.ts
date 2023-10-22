import { ethers, upgrades } from 'hardhat';

// load env file
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_NAME = "RewardMe"

async function main() {
 const factory = await ethers.getContractFactory(CONTRACT_NAME);

 const args = [process.env.VERIFICATION_PUBLIC_KEY];
 const contract = await upgrades.deployProxy(factory, args, { initializer: "initialize" });
 await contract.deployed();

 console.log(`${CONTRACT_NAME} deployed to: ${contract.address}`);
}

main();
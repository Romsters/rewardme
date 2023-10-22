import { utils } from "ethers";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@matterlabs/hardhat-zksync-upgradable";

// load env file
import dotenv from "dotenv";
dotenv.config();

const zkSyncLocalNode = {
  url: "http://127.0.0.1:3050",
  ethNetwork: "http://127.0.0.1:8545",
  zksync: true,
  accounts: ["0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e"]
}

const zkSyncInMemoryNode = {
  url: "http://127.0.0.1:8011",
  ethNetwork: "http://127.0.0.1:8545",
  zksync: true,
  accounts: ["0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e"]
}

const zkSyncGoerli = {
  url: "https://zksync2-testnet.zksync.dev",
  ethNetwork: "goerli",
  zksync: true,
  accounts: [process.env.WALLET_PRIVATE_KEY || ""],
  verifyURL:
    "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
}

const zkSyncMainnet = {
  url: "https://mainnet.era.zksync.io",
  ethNetwork: "mainnet",
  zksync: true,
  verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
}

const hardhat = {
  zksync: false,
  accounts: [{
    privateKey: "0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e",
    balance: utils.parseEther("100").toString()
  }]
}

const sepolia = {
  zksync: false,
  url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  accounts: [process.env.WALLET_PRIVATE_KEY || ""]
}

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncLocalNode",
  networks: {
    hardhat,
    sepolia,
    zkSyncLocalNode,
    zkSyncInMemoryNode,
    zkSyncGoerli,
    zkSyncMainnet
  },
  solidity: {
    version: "0.8.18",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@matterlabs/hardhat-zksync-upgradable";

export const zkSyncLocalNode = {
  url: "http://127.0.0.1:3050",
  ethNetwork: "http://127.0.0.1:8545",
  zksync: true,
}

export const zkSyncInMemoryNode = {
  url: "http://127.0.0.1:8011",
  ethNetwork: "http://127.0.0.1:8545",
  zksync: true,
}

export const zkSyncGoerli = {
  url: "https://zksync2-testnet.zksync.dev",
  ethNetwork: "goerli",
  zksync: true,
  verifyURL:
    "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
}

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncLocalNode",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncLocalNode,
    zkSyncInMemoryNode,
    zkSyncGoerli,
  },
  solidity: {
    version: "0.8.18",
  },
};

export default config;

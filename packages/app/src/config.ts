import { configureChains, createConfig } from "wagmi";
import { sepolia } from "@wagmi/core";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { defineChain } from "viem";

const zkSyncLocalNode = defineChain({
  id: 270,
  network: "geth",
  name: "zkSync Era Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:3050"],
    },
    public: {
      http: ["http://localhost:3050"],
    },
  },
  blockExplorers: {
    default: {
      name: "zkSync Block explorer",
      url: "http://localhost:3010",
      apiUrl: "http://localhost:3020",
    },
  },
  isL2: true,
  systemContractAddress:
    localStorage.getItem("rewardMeLocalNodeSystemContract") || process.env.REACT_APP_LOCAL_NODE_SYSTEM_CONTRACT_ADDRESS,
});

const zkSyncGoerliTestnet = defineChain({
  id: 280,
  network: "goerli",
  name: "zkSync Era Goerli Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.era.zksync.dev"],
    },
    public: {
      http: ["https://testnet.era.zksync.dev"],
    },
  },
  blockExplorers: {
    default: {
      name: "zkSync Block explorer",
      url: "https://goerli.explorer.zksync.io",
      apiUrl: "https://block-explorer-api.testnets.zksync.dev",
    },
  },
  isL2: true,
  systemContractAddress: process.env.REACT_APP_GOERLI_TESTNET_SYSTEM_CONTRACT_ADDRESS,
});

const zkSyncMainnet = defineChain({
  id: 324,
  network: "mainnet",
  name: "zkSync Era Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
    },
    public: {
      http: ["https://mainnet.era.zksync.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "zkSync Block explorer",
      url: "https://explorer.zksync.io",
      apiUrl: "https://block-explorer-api.mainnet.zksync.io",
    },
  },
  isL2: true,
  systemContractAddress: process.env.REACT_APP_MAINNET_SYSTEM_CONTRACT_ADDRESS,
});

const sepoliaTestnet = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: ["https://sepolia.infura.io/v3/84842078b09946638c03157f83405213"],
    },
    public: {
      http: ["https://sepolia.infura.io/v3/84842078b09946638c03157f83405213"],
    },
  },
  systemContractAddress: process.env.REACT_APP_L1_SEPOLIA_SYSTEM_CONTRACT_ADDRESS,
};

export const { chains, publicClient } = configureChains(
  [zkSyncMainnet, zkSyncGoerliTestnet, zkSyncLocalNode, sepoliaTestnet],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID!,
      },
    }),
  ],
});

import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { defineChain } from "viem";

const localNode = defineChain({
  id: 270,
  network: "geth",
  name: "zkSyn Era Local",
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
  systemContractAddress:
    localStorage.getItem("rewardMeLocalNodeSystemContract") || process.env.REACT_APP_LOCAL_NODE_SYSTEM_CONTRACT_ADDRESS,
});

const goerliTestnet = defineChain({
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
  systemContractAddress: process.env.REACT_APP_GOERLI_TESTNET_SYSTEM_CONTRACT_ADDRESS,
});

const mainnet = defineChain({
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
  systemContractAddress: process.env.REACT_APP_MAINNET_SYSTEM_CONTRACT_ADDRESS,
});

export const { chains, publicClient } = configureChains([mainnet, goerliTestnet, localNode], [publicProvider()]);

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [new MetaMaskConnector({ chains })],
});

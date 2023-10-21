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
  systemContractAddress: "0x809c896B311982F3Aa18FfD3493169401c5e3347",
});

const testnet = defineChain({
  id: 280,
  network: "goerli",
  name: "zkSync Era Testnet",
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
  systemContractAddress: null,
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
  systemContractAddress: null,
});

export const { chains, publicClient } = configureChains([mainnet, testnet, localNode], [publicProvider()]);

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [new MetaMaskConnector({ chains })],
});

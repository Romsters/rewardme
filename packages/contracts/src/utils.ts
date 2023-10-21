import { Wallet, Provider, Contract } from 'zksync-web3';
import * as hre from 'hardhat';
import { ethers } from "ethers";
import { HttpNetworkConfig } from "hardhat/types/config";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

export const deploy = async (artifactName: string, args: string[], deployer?: Deployer | null): Promise<Contract> => {
  let contract;
  if (!deployer) {
    const factory = await hre.ethers.getContractFactory(artifactName);
    contract = await factory.deploy(...args);
  } else {
    const artifact = await deployer.loadArtifact(artifactName);
    contract = await deployer.deploy(artifact, args);
  }
  console.log(`${artifactName} deployed at ${contract.address}`);
  return contract;
}

export const getProvider = () => hre.network.zksync ? new Provider({ url: (hre.network.config as HttpNetworkConfig).url }) : hre.ethers.provider;

export const getWallet = (privateKey: string, provider?: Provider | ethers.providers.JsonRpcProvider) => hre.network.zksync ? new Wallet(privateKey, provider as Provider) : new hre.ethers.Wallet(privateKey, provider);

export const hashString = (str: string) => hre.ethers.utils.keccak256(hre.ethers.utils.defaultAbiCoder.encode(["string"], [str]));

import { ethers, type BigNumberish } from "ethers";
import { waitForTransaction as waitForTransactionBase } from "@wagmi/core";

export const formatTokenBalance = (value: BigNumberish, decimals: number) =>
  ethers.utils.formatUnits(value, decimals).replace(/.0$/g, "");

export const formatAddressToDisplay = (address?: string) =>
  `${address?.substring(0, 6)}...${address?.substring(address.length - 3)}`;

export const waitForTransaction = async ({ hash }: { hash: `0x${string}` }) => {
  // doesn't work properly for zkSync Era
  await waitForTransactionBase({
    hash,
    confirmations: 1,
  });
  // wait for 2 secs for transaction to get processed
  await new Promise((resolve) => setTimeout(resolve, 2000));
};

export const ZKSYNC_ETH_ADDRESS = "0x000000000000000000000000000000000000800a";

export const L1_ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

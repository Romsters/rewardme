import { readContract, readContracts, writeContract, prepareWriteContract, erc20ABI, erc721ABI } from "@wagmi/core";
import { utils } from "ethers";
import { ZKSYNC_ETH_ADDRESS, waitForTransaction } from "../../utils";
import SystemContractABI from "../../abi/SystemContract.json";

export interface Reward {
  from: `0x${string}`;
  description: string;
  token: `0x${string}`;
  amount: BigInt;
  tokenId: BigInt;
  tokenType: number;
  decimals: number;
  symbol: string;
  tokenURI: string;
  [key: string]: string | BigInt | number;
}

const fetchTokenFields = async (
  rewards: Reward[],
  functionName: string,
  argsFields: any[],
  mapToField: string,
  defaultValue: string | BigInt | number
) => {
  const results = await readContracts({
    contracts: rewards.map((reward) => ({
      address: reward.token,
      abi: reward.tokenType === 1 ? erc20ABI : erc721ABI,
      functionName,
      args: argsFields.map((field) => reward[field]),
    })),
  });
  rewards.forEach((reward, index) => {
    if (results[index]?.status !== "success" || !results[index]?.result) {
      reward[mapToField] = defaultValue;
      return;
    }
    reward[mapToField] = results[index].result as string | BigInt | number;
  });
};

export const getRewardList = async (systemContractAddress: `0x${string}`, receiver: string) => {
  const hashedReceiver = utils.keccak256(utils.defaultAbiCoder.encode(["string"], [receiver.toLowerCase()]));
  const rewards = (await readContract({
    address: systemContractAddress,
    abi: SystemContractABI,
    functionName: "getRewardList",
    args: [hashedReceiver],
  })) as any as Reward[];

  const ethTokenRewards = rewards.filter((reward) => reward.tokenType === 0);
  ethTokenRewards.forEach((reward) => {
    reward.decimals = 18;
    reward.symbol = "ETH";
    reward.token = ZKSYNC_ETH_ADDRESS;
  });
  const erc20TokenRewards = rewards.filter((reward) => reward.tokenType === 1);
  const erc721TokenRewards = rewards.filter((reward) => reward.tokenType === 2);
  await Promise.all([
    fetchTokenFields(erc20TokenRewards, "decimals", [], "decimals", 0),
    fetchTokenFields(erc20TokenRewards, "symbol", [], "symbol", "UNKNOWN"),
    fetchTokenFields(erc721TokenRewards, "symbol", [], "symbol", "UNKNOWN"),
    fetchTokenFields(erc721TokenRewards, "tokenURI", ["tokenId"], "tokenURI", ""),
  ]);
  await Promise.all(
    erc721TokenRewards.map(async (reward): Promise<void> => {
      if (reward.tokenURI) {
        try {
          const res = await fetch(reward.tokenURI);
          const metadata = await res.json();
          reward.tokenURI = metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "";
        } catch {}
      }
    })
  );
  return rewards;
};

export const claimRewards = async (
  systemContractAddress: `0x${string}`,
  receiver: string,
  provider: string,
  nonce: string,
  signature: string
) => {
  const hashedReceiver = utils.keccak256(utils.defaultAbiCoder.encode(["string"], [receiver.toLowerCase()]));
  const config = await prepareWriteContract({
    address: systemContractAddress,
    abi: SystemContractABI,
    functionName: "claimRewards",
    args: [hashedReceiver, provider, nonce, signature],
  });
  const data = await writeContract(config);
  await waitForTransaction({
    hash: data.hash,
  });
  return data.hash;
};

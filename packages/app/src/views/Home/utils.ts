import { writeContract, prepareWriteContract } from "@wagmi/core";
import { utils } from "ethers";
import SystemContractABI from "../../abi/SystemContract.json";
import { waitForTransaction } from "../../utils";
import { type Token } from "../../components/TokenItem";

export const sendETHReward = async (
  systemContractAddress: `0x${string}`,
  receiver: string,
  value: bigint,
  description: string
) => {
  const hashedReceiver = utils.keccak256(utils.defaultAbiCoder.encode(["string"], [receiver.toLowerCase()]));
  const config = await prepareWriteContract({
    address: systemContractAddress,
    abi: SystemContractABI,
    functionName: "sendETHReward",
    value,
    args: [hashedReceiver, description],
  });
  const data = await writeContract(config);
  await waitForTransaction({
    hash: data.hash,
  });
  return data.hash;
};

export const sendTokenReward = async (
  systemContractAddress: `0x${string}`,
  receiver: string,
  token: Token,
  value: BigInt,
  description: string
) => {
  const hashedReceiver = utils.keccak256(utils.defaultAbiCoder.encode(["string"], [receiver.toLowerCase()]));
  const config = await prepareWriteContract({
    address: systemContractAddress,
    abi: SystemContractABI,
    functionName: "sendTokenReward",
    args: [hashedReceiver, token.address, value, description],
  });
  const data = await writeContract(config);
  await waitForTransaction({
    hash: data.hash,
  });
  return data.hash;
};

export const sendNFTReward = async (
  systemContractAddress: `0x${string}`,
  receiver: string,
  token: Token,
  value: BigInt,
  description: string
) => {
  const hashedReceiver = utils.keccak256(utils.defaultAbiCoder.encode(["string"], [receiver.toLowerCase()]));
  const config = await prepareWriteContract({
    address: systemContractAddress,
    abi: SystemContractABI,
    functionName: "sendNFTReward",
    args: [hashedReceiver, token.address, value, description],
  });
  const data = await writeContract(config);
  await waitForTransaction({
    hash: data.hash,
  });
  return data.hash;
};

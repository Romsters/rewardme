import { expect } from 'chai';
import { ethers } from "ethers";
import { Wallet, Provider, Contract } from 'zksync-web3';
import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { zkSyncLocalNode } from "../hardhat.config";

const RICH_WALLET_PK = "0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e";
const RICH_WALLET_ADDRESS = "0x0D43eB5B8a47bA8900d84AA36656c92024e9772e";

const SIGNING_PK = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
const VERIFICATION_PUBLIC_KEY = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";

async function deploy(deployer: Deployer, artifactName: string, args: string[]): Promise<Contract> {
  const artifact = await deployer.loadArtifact(artifactName);
  const contract = await deployer.deploy(artifact, args);
  console.log(`${artifactName} deployed at ${contract.address}`);
  return contract;
}

const receiver = {
  address: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
  privateKey: "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3",
  id: "test-id",
  provider: "GITHUB",
  nonce: `0x${Math.floor(new Date().getTime() / 1000 + 3600).toString(16)}`
}

describe('RewardMe', function () {
  it("verifies contract functionality", async function () {
    const provider = new Provider(zkSyncLocalNode.url);
    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const signerWallet = new Wallet(SIGNING_PK, provider);
    const receiverWallet = new Wallet(receiver.privateKey, provider);
    const deployer = new Deployer(hre, wallet);

    const hashedReceiverId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [receiver.id]));
    const identity = {
      address: receiver.address,
      provider: receiver.provider,
      id: hashedReceiverId,
      nonce: receiver.nonce
    }
    const hashedMessage = ethers.utils.solidityKeccak256(["string"], [JSON.stringify(identity)]);
    const signature = await signerWallet.signMessage(ethers.utils.arrayify(hashedMessage));

    // deploy contract
    const contract = await deploy(deployer, "RewardMe", [VERIFICATION_PUBLIC_KEY]);

    // deploy token for test
    const token = await deploy(deployer, "Coin", []);

    // deploy NFT for test
    const zkNFT = await deploy(deployer, "ZkNFT", []);
    const mintTx = await zkNFT.mintNFT(RICH_WALLET_ADDRESS, "https://gateway.pinata.cloud/ipfs/QmWi2YK2cmNpJRq4pLKJj2fPz22w1V9ZAi7oP7s28GMQok");
    await mintTx.wait();

    // send ETH reward
    const ethTx = await contract.sendETHReward(receiver.id, "Description ETH", { value: ethers.utils.parseEther("0.1") });
    await ethTx.wait();

    // send token reward
    const approveTokenTx = await token.approve(contract.address, ethers.utils.parseEther("1.5"));
    await approveTokenTx.wait();
    const sendTokenTx = await contract.sendTokenReward(receiver.id, token.address, ethers.utils.parseEther("1.5"), "Description Token");
    await sendTokenTx.wait();

    // send NFT reward
    const approveNftTx = await zkNFT.approve(contract.address, 1);
    await approveNftTx.wait();
    const sendNftTx = await contract.sendNFTReward(receiver.id, zkNFT.address, 1, "Description NFT");
    await sendNftTx.wait();

    // view rewards
    const rewards = await contract.getRewardList(receiver.id);
    expect(rewards).to.deep.equal([
      [
        RICH_WALLET_ADDRESS,
        "Description ETH",
        "0x0000000000000000000000000000000000000000",
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0"),
        0
      ],
      [
        RICH_WALLET_ADDRESS,
        "Description Token",
        token.address,
        ethers.utils.parseEther("1.5"),
        ethers.utils.parseEther("0"),
        1
      ],
      [
        RICH_WALLET_ADDRESS,
        "Description NFT",
        zkNFT.address,
        ethers.utils.parseEther("0"),
        ethers.BigNumber.from("1"),
        2
      ]
    ]);

    // try to claim reward with not receiver's account
    try {
      const claimTxFailure = await contract.claimRewards(identity.id, identity.provider, identity.nonce, signature);
      await claimTxFailure.wait();
      throw "Should not allow claiming with not receiver's account";
    } catch (err: any) {
      expect(err.message).to.include("The provided signature is not valid");
    }

    // claim with receiver's account
    const claimTx = await contract.connect(receiverWallet).claimRewards(identity.id, identity.provider, identity.nonce, signature);
    await claimTx.wait();

    // view reward
    const rewardsAfterClaim = await contract.getRewardList(receiver.id);
    expect(rewardsAfterClaim).to.deep.equal([]);
  });
});
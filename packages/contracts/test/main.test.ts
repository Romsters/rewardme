import { expect } from 'chai';
import { Wallet, Provider, Contract } from 'zksync-web3';
import * as hre from 'hardhat';
import { HttpNetworkConfig } from "hardhat/types/config";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

const REWARD_ME_SIGNING_PK = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
const REWARD_ME_VERIFICATION_PUBLIC_KEY = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";

async function deploy(deployer: Deployer, artifactName: string, args: string[]): Promise<Contract> {
  const artifact = await deployer.loadArtifact(artifactName);
  const contract = await deployer.deploy(artifact, args);
  console.log(`${artifactName} deployed at ${contract.address}`);
  return contract;
}

const hashString = (str: string) => hre.ethers.utils.keccak256(hre.ethers.utils.defaultAbiCoder.encode(["string"], [str]))

describe('RewardMe', function () {
  it("verifies contract functionality", async function () {
    const provider = new Provider({ url: (hre.network.config as HttpNetworkConfig).url });

    // contract deployer
    const [deployerSigner] = await hre.ethers.getSigners();
    const [deployerPK] = hre.network.config.accounts as string[];
    const deployerWallet = new Wallet(deployerPK, provider);
    const deployer = new Deployer(hre, deployerWallet);

    // reward receiver
    const rewardReceiverWallet = new Wallet(Wallet.createRandom().privateKey, provider);
    const receiver = {
      address: rewardReceiverWallet.address.toLowerCase(),
      id: hashString("test-id"),
      provider: "GITHUB",
      nonce: `0x${Math.floor(new Date().getTime() / 1000 + 3600).toString(16)}`
    }
    // send some ethers to receiver for covering fees
    const tx = await deployerWallet.transfer({
      to: rewardReceiverWallet.address,
      amount: hre.ethers.utils.parseEther("1")
    });
    await tx.wait();

    // simulate Auth server signature
    const rewardMeSignerWallet = new Wallet(REWARD_ME_SIGNING_PK, provider);
    const hashedMessage = hashString(JSON.stringify(receiver));
    const signature = await rewardMeSignerWallet.signMessage(hre.ethers.utils.arrayify(hashedMessage));

    // deploy contract with simulated Auth server signer's public key
    const contract = await deploy(deployer, "RewardMe", [REWARD_ME_VERIFICATION_PUBLIC_KEY]);

    // deploy token for test
    const token = await deploy(deployer, "Coin", []);

    // deploy NFT for test
    const zkNFT = await deploy(deployer, "ZkNFT", []);
    const mintTx = await zkNFT.mintNFT(deployerSigner.address, "https://gateway.pinata.cloud/ipfs/QmWi2YK2cmNpJRq4pLKJj2fPz22w1V9ZAi7oP7s28GMQok");
    await mintTx.wait();

    // send ETH reward
    const ethTx = await contract.sendETHReward(receiver.id, "Description ETH", { value: hre.ethers.utils.parseEther("0.1") });
    await ethTx.wait();

    // send token reward
    const approveTokenTx = await token.approve(contract.address, hre.ethers.utils.parseEther("1.5"));
    await approveTokenTx.wait();
    const sendTokenTx = await contract.sendTokenReward(receiver.id, token.address, hre.ethers.utils.parseEther("1.5"), "Description Token");
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
        deployerSigner.address,
        "Description ETH",
        "0x0000000000000000000000000000000000000000",
        hre.ethers.utils.parseEther("0.1"),
        hre.ethers.utils.parseEther("0"),
        0
      ],
      [
        deployerSigner.address,
        "Description Token",
        token.address,
        hre.ethers.utils.parseEther("1.5"),
        hre.ethers.utils.parseEther("0"),
        1
      ],
      [
        deployerSigner.address,
        "Description NFT",
        zkNFT.address,
        hre.ethers.utils.parseEther("0"),
        hre.ethers.BigNumber.from("1"),
        2
      ]
    ]);

    // try to claim reward with unauthorized receiver's account
    try {
      const claimTxFailure = await contract.claimRewards(receiver.id, receiver.provider, receiver.nonce, signature);
      await claimTxFailure.wait();
      throw "Should not allow claiming with not receiver's account";
    } catch (err: any) {
      expect(err.message).to.include("The provided signature is not valid");
    }

    // claim with receiver's account
    const claimTx = await contract.connect(rewardReceiverWallet).claimRewards(receiver.id, receiver.provider, receiver.nonce, signature);
    await claimTx.wait();

    // view reward
    const rewardsAfterClaim = await contract.getRewardList(receiver.id);
    expect(rewardsAfterClaim).to.deep.equal([]);
  });
});
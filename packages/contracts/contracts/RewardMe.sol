//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./lib/Verifier.sol";

struct Reward {
  address from;
  string description;
  address token;
  uint amount;
  uint256 tokenId;
  uint8 tokenType;
}

contract RewardMe is Initializable {
  address public publicKey;

  mapping (string => Reward[]) public rewards;

  function initialize(address _publicKey) public initializer {
    publicKey = _publicKey;
  }

  function sendETHReward(string calldata id, string calldata description) public payable {
    rewards[id].push(Reward(msg.sender, description, address(0), msg.value, 0, 0));
  }

  function sendTokenReward(string calldata id, IERC20 token, uint amount, string calldata description) public {
    token.transferFrom(msg.sender, address(this), amount);
    rewards[id].push(Reward(msg.sender, description, address(token), amount, 0, 1));
  }

  function sendNFTReward(string calldata id, IERC721 token, uint256 tokenId, string calldata description) public {
    token.transferFrom(msg.sender, address(this), tokenId);
    rewards[id].push(Reward(msg.sender, description, address(token), 0, tokenId, 2));
  }

  function getRewardList(string calldata id) public view returns (Reward[] memory) {
    return rewards[id];
  }

  function claimRewards(string calldata id, string calldata provider, uint256 nonce, bytes calldata signature) public {
    verify(id, provider, nonce, signature);
    for (uint i = 0; i < rewards[id].length; i++) {
      if (rewards[id][i].tokenType == 0) {
        (bool sent,) = msg.sender.call{value: rewards[id][i].amount}("");
        require(sent, "Failed to send ETH reward");
      } else if (rewards[id][i].tokenType == 1) {
        IERC20(rewards[id][i].token).transfer(msg.sender, rewards[id][i].amount);
      } else {
        IERC721(rewards[id][i].token).safeTransferFrom(address(this), msg.sender, rewards[id][i].tokenId);
      }
    }
    delete rewards[id];
  }

  function verify(string calldata id, string calldata provider, uint256 nonce, bytes calldata signature) private view {
    string memory addr = Strings.toHexString(uint160(msg.sender), 20);
    string memory message = string(abi.encodePacked('{"address":"', addr, '","id":"', id, '","provider":"', provider, '","nonce":"', Strings.toHexString(nonce), '"}'));
    Verifier.verify(message, signature, publicKey);
    require(
      block.timestamp < nonce,
      "Nonce is invalid"
    );
  }
}

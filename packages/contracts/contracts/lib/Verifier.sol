//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library Verifier {
  using ECDSA for bytes32;

  function verify(
    string memory message,
    bytes calldata signature,
    address publicKey
  ) internal pure {
    bytes32 signedMessageHash = keccak256(abi.encode(message)).toEthSignedMessageHash();
    require(
      signedMessageHash.recover(signature) == publicKey,
      "The provided signature is not valid"
    );
  }
}
use ethers_core::{types::H256, abi::{encode, Token}, utils::keccak256};

pub fn hash(
    message: String,
) -> H256 {
  let encoded_message = encode(&[Token::String(message)]);
  H256(keccak256(encoded_message))
}

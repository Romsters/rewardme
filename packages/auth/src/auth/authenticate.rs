use crate::github;
use crate::utils;
use crate::jwk;

use serde::Deserialize;
use strum_macros::{Display, EnumString, IntoStaticStr};
use ethers_core::types::H256;
use actix_web::error;
use jwk::{JwkKeys, JwkVerifier};

#[derive(PartialEq, Display, EnumString, IntoStaticStr)]
pub enum AuthProvider {
  GOOGLE,
  GITHUB
}

#[derive(Debug, Deserialize)]
pub struct AuthDetails {
  pub username: String,
  pub user_id: H256,
  pub provider: String
}

pub async fn authenticate(
  token: &String,
  provider: &AuthProvider
) -> Result<AuthDetails, actix_web::Error> {
  let provider_str: &'static str = provider.into();
  if provider == &AuthProvider::GITHUB {
    let token_result = github::get_token(&token).await;
    let token: github::TokenResponse = match token_result {
      Ok(value) => value,
      Err(_) => {
        return Err(error::ErrorBadRequest("Failed to get github access token by the provided code"));
      }
    };

    let user_result = github::get_user(&token.access_token).await;
    let user: github::UserResponse = match user_result {
      Ok(value) => value,
      Err(_) => {
        return Err(error::ErrorInternalServerError("Failed to fetch github user details"));
      }
    };

    return Ok(AuthDetails {
      username: user.login.to_string(),
      user_id: utils::hash(user.login.to_lowercase()),
      provider: provider_str.to_string()
    });
  }
  if provider == &AuthProvider::GOOGLE {
    let config = jwk::get_google_configuration();
    let jwk_keys_result = jwk::fetch_keys(&config).await;
    let jwk_keys: JwkKeys = match jwk_keys_result {
      Ok(keys) => keys,
      Err(_) => {
        return Err(error::ErrorInternalServerError("Unable to fetch jwk keys"));
      }
    };
    let verifier = JwkVerifier::new(jwk_keys.keys, config);
    let token_data = verifier.verify(token);
    if token_data.is_none() {
      return Err(error::ErrorBadRequest("Failed to validate token"));
    }
    let claims = token_data.unwrap().claims;
    return Ok(AuthDetails {
      username: claims.email.to_string(),
      user_id: utils::hash(claims.email.to_lowercase()),
      provider: provider_str.to_string()
    });
  }
  return Err(error::ErrorBadRequest("Unknown provider specified"));
}

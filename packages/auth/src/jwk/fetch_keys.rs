use crate::jwk::JwkConfiguration;
use serde::Deserialize;
use std::error::Error;

#[derive(Debug, Deserialize)]
struct KeyResponse {
    keys: Vec<JwkKey>,
}

#[derive(Debug, Deserialize, Eq, PartialEq)]
pub struct JwkKey {
    pub e: String,
    pub alg: String,
    pub kty: String,
    pub kid: String,
    pub n: String,
}

#[derive(Debug)]
pub struct JwkKeys {
    pub keys: Vec<JwkKey>,
}

pub async fn fetch_keys(
    config: &JwkConfiguration,
) -> Result<JwkKeys, Box<dyn Error>> {
    let http_response = reqwest::get(&config.jwk_url).await?;
    let result = Result::Ok(http_response.json::<KeyResponse>().await?);

    return result.map(|res| JwkKeys {
        keys: res.keys
    });
}

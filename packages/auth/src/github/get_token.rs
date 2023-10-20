use serde::Deserialize;
use std::env;
use std::error::Error;
use std::collections::HashMap;

const GITHUB_TOKEN_URL: &'static str = "https://github.com/login/oauth/access_token";

#[derive(Debug, Deserialize)]
pub struct TokenResponse {
    pub access_token: String
}

pub async fn get_token(
    auth_code: &String,
) -> Result<TokenResponse, Box<dyn Error>> {
    let client_id = env::var("GITHUB_CLIENT_ID").unwrap();
    let client_secret = env::var("GITHUB_CLIENT_SECRET").unwrap();

    let mut payload = HashMap::new();
    payload.insert("client_id", client_id);
    payload.insert("client_secret", client_secret);
    payload.insert("code", auth_code.clone());

    let client = reqwest::Client::new();
    let http_response = client.post(GITHUB_TOKEN_URL)
        .header("Accept", "application/json")
        .json(&payload)
        .send().await?;
    Result::Ok(http_response.json::<TokenResponse>().await?)
}

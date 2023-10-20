use serde::Deserialize;
use std::error::Error;

const GITHUB_GET_USER_URL: &'static str = "https://api.github.com/user";

#[derive(Debug, Deserialize)]
pub struct UserResponse {
  pub login: String,
  pub email: String,
}

pub async fn get_user(
    token: &String,
) -> Result<UserResponse, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let http_response = client.get(GITHUB_GET_USER_URL)
      .header("User-Agent", "rust-back-end")
      .header("Authorization", format!("Bearer {token}"))
      .send().await?;
    Result::Ok(http_response.json::<UserResponse>().await?)
}

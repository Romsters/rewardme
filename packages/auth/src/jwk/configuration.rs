use std::env;

const GOOGLE_JWK_URL: &'static str = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_JWK_ISSUER: &'static str = "https://accounts.google.com";

#[derive(Debug)]
pub struct JwkConfiguration {
    pub jwk_url: String,
    pub audience: String,
    pub issuer: String,
}

pub fn get_google_configuration() -> JwkConfiguration {
  JwkConfiguration {
      jwk_url: GOOGLE_JWK_URL.to_string(),
      audience: env::var("GOOGLE_JWK_AUDIENCE").unwrap(),
      issuer: GOOGLE_JWK_ISSUER.to_string(),
  }
}
pub mod jwk;
pub mod utils;
pub mod github;
pub mod auth;

use actix_web::{error, get, post, web, App, Result, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use actix_json_response::JsonResponse;
use serde::{Serialize, Deserialize};
use serde_json;
use std::str::FromStr;
use std::env;
use const_hex::Buffer;
use ethers_signers::{LocalWallet, Signer};
use ethers_core::types::{H256,U256};
use dotenv::dotenv;
use auth::{AuthProvider, AuthDetails};

#[derive(Deserialize)]
struct AuthPayload {
    token: String,
    provider: String,
    address: String,
    nonce: U256
}

#[derive(Serialize)]
struct AuthResponse {
    username: String,
    message: AuthMessageJSON,
    signature: String
}

#[derive(Serialize)]
struct AuthMessageJSON {
    address: String,
    id: H256,
    provider: String,
    nonce: U256
}

#[post("/auth")]
async fn authorize(payload: web::Json<AuthPayload>) -> Result<JsonResponse<AuthResponse>> {
    let provider_result = AuthProvider::from_str(&payload.provider);
    let provider: AuthProvider = match provider_result {
        Ok(value) => value,
        Err(_) => {
            return Err(error::ErrorBadRequest("Unknown provider specified"));
        }
    };

    let auth_details_result = auth::authenticate(&payload.token, &provider).await;
    let auth_details: AuthDetails = match auth_details_result {
        Ok(value) => value,
        Err(error) => {
            return Err(error);
        }
    };

    let message_payload = AuthMessageJSON {
        address: payload.address.to_lowercase(),
        id: auth_details.user_id,
        provider: auth_details.provider,
        nonce: payload.nonce.clone()
    };
    let message = serde_json::to_string(&message_payload).unwrap();
    let message_hash = utils::hash(message);

    let private_key = env::var("SIGNING_KEY").unwrap();
    let wallet = private_key.parse::<LocalWallet>().unwrap();
    let signature_result = wallet.sign_message(&message_hash).await;
    let signature = "0x".to_string() + Buffer::<65, false>::new().format(&signature_result.unwrap().into());

    let auth_response = AuthResponse {
        username: auth_details.username,
        message: message_payload,
        signature
    };
    Ok(auth_response.into())
}


#[get("/")]
async fn home() -> impl Responder {
    HttpResponse::Ok().body("RewardMe API")
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let port = env::var("PORT").unwrap_or(String::from("8080"));
    HttpServer::new(|| {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .service(home)
            .service(health)
            .service(authorize)
    })
    .bind(("0.0.0.0", port.parse::<u16>().unwrap()))?
    .run()
    .await
}
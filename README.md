<h1 align="center">RewardMe</h1>

<p align="center">Reward anyone with crypto assets using receiver's Google email or GitHub username</p>

## 📌 Overview
This repository is a monorepo consisting of 3 packages:
- [Contracts](./packages/contracts) - solidity contracts and deployment scripts.
- [Auth](./packages/auth) - authentication service.
- [App](./packages/app) - a front-end app.

## 📋 Prerequisites

- Ensure you have `node >= 18.0.0` and `npm >= 9.0.0` installed.

## 🛠 Installation

```bash
$ npm install
```

## ⛓️ Setting up GitHub App and Google OAuth client
Follow [Registering a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) to set up a `GitHub` App.
Follow [Integrating Google Sign-In into your web app](https://developers.google.com/identity/sign-in/web/sign-in) to set up a `Google` OAuth client.

## 🚀 Deploying contracts
Set up all the necessary env variables for  [Contracts](./packages/contracts) package. Check [.env.example](./packages/contracts/.env.example) for reference.
Run the deployment script for each network you want to support.

### Deployment to zkSync
```
npm run deploy -- --network {network_name_here}
```
The deployed contracts are verified automatically if `verifyURL` is present for hardhat network config.

### Deployment to L1
```
npm run deployL1 -- --network {network_name_here}
```
### Verification
```
npm run verify -- --network {network_name_here} {contract_address_here}
```

## ⚙️ Setting up env variables

Make sure you have set up all the necessary env variables for  [Auth](./packages/auth) and [App](./packages/app) services.

## 👨‍💻 Running locally

Before running the app, make sure you have system contract deployed.
To start [Auth](./packages/auth) and [App](./packages/app) services locally in `dev` mode run:
```bash
$ npm run dev
```

## 🕵️‍♂️ Testing
Run tests for contracts:
```bash
$ npm run test -w contracts
```

## 💻 Using App with zkSync local node
In order to let the App know what is your system contract address deployed to your local node just add a record to the local storage in your browser:
```
localStorage.setItem("rewardMeLocalNodeSystemContract", "your_system_contract_address_here");
```

## 🔗 Links:
- [App](https://rewardme-app-kxknkq7kaq-lm.a.run.app)
- [Auth API](https://rewardme-kxknkq7kaq-lm.a.run.app)

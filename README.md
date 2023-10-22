# RewardMe
Reward anyone with crypto assets using receiver's email or github username

## Using App with zkSync local node
In order to let the App know what is your system contract address deployed to your local node just add a record to the local storage in your browser:
```
localStorage.setItem("rewardMeLocalNodeSystemContract", "your_system_contract_address_here");
```

## Contracts deployment
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

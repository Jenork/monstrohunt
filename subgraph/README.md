# Monstro Hunt Subgraph

Read-only indexer for Monstro Hunt smart contract on Base Sepolia.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update `subgraph.yaml` with your deployed contract address and start block:
```yaml
source:
  address: "0xYOUR_CONTRACT_ADDRESS"
  startBlock: YOUR_DEPLOYMENT_BLOCK
```

## Build

```bash
npm run codegen
npm run build
```

## Deploy

### The Graph Studio
```bash
graph auth --studio YOUR_DEPLOY_KEY
npm run deploy:studio
```

### Goldsky
```bash
goldsky login
npm run deploy:goldsky
```

## Entities

- **Monster**: Individual monster data (owner, tier, weight, status)
- **Feed**: Feed events with amount and timestamp
- **Hunt**: Hunt events with hunter address and weight
- **Sale**: Sale events with payout amount
- **ProtocolStats**: Global aggregates (totalMonsters, totalKilled, protocolRevenue)

## Example Queries

### Get all monsters
```graphql
{
  monsters(first: 100) {
    id
    owner
    tier
    weight
    status
    createdAt
  }
}
```

### Get protocol stats
```graphql
{
  protocolStats(id: "global") {
    totalMonsters
    totalKilled
    totalFed
    totalDistributed
    protocolRevenue
  }
}
```

### Get recent hunts
```graphql
{
  hunts(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    monster { id }
    hunter
    weight
    timestamp
  }
}
```

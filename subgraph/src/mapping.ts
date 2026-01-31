import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  MonsterCreated,
  MonsterFed,
  MonsterHunted,
  MonsterSold,
} from "../generated/MonstroHunt/MonstroHunt";
import { Monster, Feed, Hunt, Sale, ProtocolStats } from "../generated/schema";

const GLOBAL_STATS_ID = "global";
const ALIVE_SHARE_BP = BigInt.fromI32(6500); // 65%
const PROTOCOL_SHARE_BP = BigInt.fromI32(500); // 5%
const SELL_FEE_BP = BigInt.fromI32(100); // 1%
const BP_DIVISOR = BigInt.fromI32(10000);

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(GLOBAL_STATS_ID);
  if (stats == null) {
    stats = new ProtocolStats(GLOBAL_STATS_ID);
    stats.totalMonsters = BigInt.fromI32(0);
    stats.totalKilled = BigInt.fromI32(0);
    stats.totalFed = BigInt.fromI32(0);
    stats.totalDistributed = BigInt.fromI32(0);
    stats.protocolRevenue = BigInt.fromI32(0);
  }
  return stats;
}

export function handleMonsterCreated(event: MonsterCreated): void {
  let monsterId = event.params.monsterId.toString();
  
  let monster = new Monster(monsterId);
  monster.owner = event.params.owner;
  monster.tier = event.params.tier;
  monster.initialWeight = event.params.initialWeight;
  monster.weight = event.params.initialWeight;
  monster.status = "Calm";
  monster.createdAt = event.block.timestamp;
  monster.diedAt = null;
  monster.save();

  let stats = getOrCreateProtocolStats();
  stats.totalMonsters = stats.totalMonsters.plus(BigInt.fromI32(1));
  stats.save();
}

export function handleMonsterFed(event: MonsterFed): void {
  let monsterId = event.params.monsterId.toString();
  let feedId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  
  // Create Feed entity
  let feed = new Feed(feedId);
  feed.monster = monsterId;
  feed.amount = event.params.feedCost;
  feed.timestamp = event.block.timestamp;
  feed.save();

  // Update monster weight
  let monster = Monster.load(monsterId);
  if (monster != null) {
    monster.weight = event.params.newWeight;
    monster.status = "Calm"; // Reset status after feeding
    monster.save();
  }

  // Update stats
  let stats = getOrCreateProtocolStats();
  stats.totalFed = stats.totalFed.plus(BigInt.fromI32(1));
  stats.save();
}

export function handleMonsterHunted(event: MonsterHunted): void {
  let monsterId = event.params.monsterId.toString();
  let huntId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  
  // Load monster to get weight before death
  let monster = Monster.load(monsterId);
  let weight = BigInt.fromI32(0);
  
  if (monster != null) {
    weight = monster.weight;
    monster.status = "Dead";
    monster.diedAt = event.block.timestamp;
    monster.save();
  }

  // Create Hunt entity
  let hunt = new Hunt(huntId);
  hunt.monster = monsterId;
  hunt.hunter = event.params.hunter;
  hunt.weight = weight;
  hunt.timestamp = event.block.timestamp;
  hunt.save();

  // Update stats
  let stats = getOrCreateProtocolStats();
  stats.totalKilled = stats.totalKilled.plus(BigInt.fromI32(1));
  stats.totalDistributed = stats.totalDistributed.plus(event.params.distributedToAlive);
  stats.protocolRevenue = stats.protocolRevenue.plus(event.params.protocolFee);
  stats.save();
}

export function handleMonsterSold(event: MonsterSold): void {
  let monsterId = event.params.monsterId.toString();
  let saleId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

  // Create Sale entity
  let sale = new Sale(saleId);
  sale.monster = monsterId;
  sale.payout = event.params.payout;
  sale.timestamp = event.block.timestamp;
  sale.save();

  // Update monster status
  let monster = Monster.load(monsterId);
  if (monster != null) {
    monster.status = "Sold";
    monster.diedAt = event.block.timestamp;
    monster.save();
  }

  // Update stats with protocol fee from event
  let stats = getOrCreateProtocolStats();
  stats.protocolRevenue = stats.protocolRevenue.plus(event.params.protocolFee);
  stats.save();
}

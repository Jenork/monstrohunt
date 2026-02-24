# NFT Achievements — On-Chain Verification Spec

**Game Contract:** `0x03082c8ca5208E538cc5A4Cf0e669E2B035Ff80A` (Base mainnet)  
**Constraint:** Game Contract is immutable; no changes allowed. All proofs must be derived from existing interface.

---

## 1. Contract Interface Summary

### 1.1 View / Read-Only Functions

| Function | Returns | Use for achievements |
|----------|---------|----------------------|
| `getMonster(uint256 monsterId)` | `(name, avatarId, tier, initialWeight, weight, hungerDeadline, alive, lastRewardIndex, lastHuntAttemptAt, owner)` | Prove ownership, alive/dead, current state |
| `getOwnerMonsterId(address owner)` | `uint256` (monster ID or 0) | One monster per wallet; 0 = no current monster |
| `monsterExists(uint256 monsterId)` | `bool` | Monster slot exists (false after sell or hunt death) |
| `isStarved(uint256 monsterId)` | `bool` | For **alive** monster: `block.timestamp >= hungerDeadline`; for dead monster always `false` |
| `getFeedCost(uint256)`, `getPendingRewards(uint256)` | `uint256` | Not needed for achievements |
| `canHunt(address hunter, uint256 targetMonsterId)` | `bool` | Not needed for achievements |
| `getTotalMonsters()` | `uint256` | Not needed for achievements |
| `HUNGER_DURATION`, `HUNT_COOLDOWN`, `protocolTreasury` | config | Not needed for achievements |

**Important:**  
- One monster per wallet: creation sets `ownerToMonsterId[user] = monsterId`; **sell** clears it (`ownerToMonsterId[user] = 0`); **hunt death does not** clear it (victim still has `getOwnerMonsterId(victim) == deadMonsterId`).  
- `isStarved(monsterId)` for a **dead** monster always returns `false`, so you cannot distinguish “died by hunt” vs “died by starvation” from view alone.

### 1.2 State-Changing Functions (no direct “entered game” hook)

| Function | Effect |
|----------|--------|
| `createMonster(bytes32 name, uint8 avatarId, uint8 tier)` | payable; creates monster, emits `MonsterCreated` |
| `feedMonster(uint256 monsterId)` | payable; emits `MonsterFed` |
| `huntMonster(uint256 targetMonsterId)` | kills target if starved; emits `MonsterHunted` |
| `sellMonster(uint256 monsterId)` | removes monster, pays owner; emits `MonsterSold` |
| `withdrawProtocolBalance()` | treasury only; emits `ProtocolWithdrawn` |

### 1.3 Events (indexed args = filterable)

| Event | Indexed | Non-indexed | Use for achievements |
|-------|---------|-------------|----------------------|
| `MonsterCreated` | `monsterId`, `owner` | name, avatarId, tier, initialWeight | Goblin, Swamp |
| `MonsterFed` | `monsterId` | feedCost, newWeight, newHungerDeadline | Zombie (with owner at block) |
| `MonsterHunted` | `monsterId`, `hunter` | hunterReward, distributedToAlive, protocolFee | Ice (hunter), Demon (victim owner at block) |
| `MonsterSold` | `monsterId`, `owner` | payout, protocolFee | Swamp |
| `ProtocolWithdrawn` | `to` | amount | Not needed |

---

## 2. Achievement → On-Chain Condition Mapping

### 2.1 Swamp — “User entered the game (any valid interaction)”

**Exact condition:** User has performed at least one of: create monster, feed their monster, complete a hunt, sell a monster.

**On-chain proof:**

- **Preferred (event-based, no trust):**
  - `MonsterCreated(owner = user)` **or**
  - `MonsterSold(owner = user)` **or**
  - `MonsterHunted(hunter = user)` **or**
  - `MonsterFed(monsterId)` for some `monsterId` where **at that block** `getMonster(monsterId).owner == user` (requires historical read or indexer).

- **View-only approximation (weaker):**  
  `getOwnerMonsterId(user) != 0`  
  → Proves “user has (or had) a monster” and thus has interacted (created); misses users who only hunted or only sold and never created again. Use only if you accept “has ever owned a monster” as sufficient for Swamp.

**Recommended for Achievement Contract:** Index or query events: `MonsterCreated`, `MonsterSold`, `MonsterHunted` by `owner`/`hunter`; for feed, query `MonsterFed` and verify ownership at event block (or maintain an indexer that stores “user X has ever fed” when `MonsterFed(monsterId)` and owner at block = X).

---

### 2.2 Goblin — “User created a monster”

**Exact condition:** User is the `owner` in a `MonsterCreated` event.

**On-chain proof:**

- **Event (recommended):**  
  Exists `MonsterCreated(owner = user)`.

- **View-only (equivalent under current rules):**  
  `getOwnerMonsterId(user) != 0`.  
  Contract has no transfer; the only way to have a monster is to create it (or have been killed/sold and then create again). So “has a monster” ⇒ “has created (at some point).” If you only need “currently has a monster,” view is enough; if you need “has ever created,” use the event (so that after sell, user still qualifies).

**Recommended for Achievement Contract:** Prefer event `MonsterCreated(owner = user)` so that users who created then sold still qualify. Fallback: `getOwnerMonsterId(user) != 0` for “has created and still has a monster.”

---

### 2.3 Zombie — “User fed their monster at least once”

**Exact condition:** There exists a `MonsterFed(monsterId)` such that at that block the owner of `monsterId` was the user.

**On-chain proof:**

- **Event + ownership at block:**  
  Exists `MonsterFed(monsterId)` and at that block `getMonster(monsterId).owner == user`.  
  No view can infer “has ever fed” from current state (weight/hungerDeadline can change for other reasons).

**Recommended for Achievement Contract:** Indexer or historical RPC: on each `MonsterFed(monsterId)`, resolve `getMonster(monsterId).owner` at that block and record “owner has fed.” Achievement contract then checks that index or replays events + historical `getMonster` (if the chain supports it).

---

### 2.4 Ice — “User completed their first successful hunt”

**Exact condition:** User has successfully hunted (killed) at least one monster. The Game Contract emits `MonsterHunted` only when a monster is actually killed.

**On-chain proof:**

- **Event (recommended):**  
  Exists `MonsterHunted(hunter = user)`.  
  Emitted only on successful kill (rewards and state change happen in the same call).

**Optional stricter check:** Same event and `hunterReward > 0` (always true on kill). No view-only equivalent for “has ever hunted.”

**Recommended for Achievement Contract:** Query or index `MonsterHunted(hunter = user)`.

---

### 2.5 Demon — “User’s monster was killed”

**Exact condition:** A monster owned by the user was killed by a hunt (not sold, not starved).  
Contract: on hunt kill, `target.alive = false`, `monsterExists[targetMonsterId] = false`, but **`ownerToMonsterId[victim]` is not cleared** (only cleared on sell). So the victim still has `getOwnerMonsterId(victim) == deadMonsterId`.  
`isStarved(monsterId)` for a dead monster always returns `false`, so you cannot distinguish “killed by hunt” vs “starved” from view alone.

**On-chain proof:**

- **Event + ownership at block (required):**  
  Exists `MonsterHunted(monsterId)` and at that block `getMonster(monsterId).owner == user`.

- **View-only:**  
  Not possible to prove “was killed (by hunt)”;
  you can only see “user has a dead monster” (`getOwnerMonsterId(user) != 0` and `getMonster(id).alive == false`), which could be starved or hunted.

**Recommended for Achievement Contract:** Indexer or historical read: on each `MonsterHunted(monsterId)`, resolve `getMonster(monsterId).owner` at that block and record “owner had monster killed.” Achievement contract consumes that index or replays events + historical `getMonster`.

---

### 2.6 Cthulhu — “User collected all previous NFTs”

**Exact condition:** Handled entirely outside the Game Contract (e.g. in the Achievement Contract or NFT contract that checks ownership of Swamp, Goblin, Zombie, Ice, Demon). No on-chain condition from the Game Contract.

---

## 3. Edge Cases & Limitations

### 3.1 Event-Only Achievements

- **Zombie** and **Demon** cannot be proven with view calls alone; they require **events + ownership at block** (indexer or historical `getMonster`).
- **Swamp** (if you want “any interaction” including “only fed” or “only hunted”) and **Ice** require events (or an index built from events).

### 3.2 View-Only Limitations

- **getOwnerMonsterId:** Returns 0 only when the user has no monster (never created or already sold). After a hunt kill, the victim’s `getOwnerMonsterId` still points to the dead monster.
- **isStarved(monsterId):** For dead monsters always returns `false`; cannot distinguish hunt death vs starvation from view.
- **getMonster:** Gives current state only; no “created at” or “feed count,” so “ever fed” / “ever killed” are not view-provable.

### 3.3 One Monster per Wallet

- A user has at most one “current” monster ID (`getOwnerMonsterId`). To know “all monsters ever owned,” you must use `MonsterCreated(owner = user)` and, if needed, `MonsterSold(owner = user)` / `MonsterHunted(monsterId)` to know which IDs belonged to the user at which time.

### 3.4 Block / Time Semantics

- For “owner at time of event,” the Achievement Contract or indexer must use the **block number (and block hash)** of the event when calling or simulating `getMonster(monsterId)` so that ownership is consistent and verifiable.

### 3.5 Recommended Architecture for Achievement Contract

1. **Fully on-chain verifiable:**
   - **Goblin:** Use `MonsterCreated(owner = user)` or, for “has a monster now,” `getOwnerMonsterId(user) != 0`.
   - **Ice:** Use `MonsterHunted(hunter = user)`.
   - **Swamp:** Use any of the event-based conditions above (create/sell/hunt; feed with ownership at block).
   - **Zombie / Demon:** Use events + ownership at block (indexer that writes “user X fed” / “user X had monster killed” into a mapping or Merkle structure that the Achievement Contract reads, or use a chain that allows historical static calls and replay events + `getMonster` at event block).

2. **Indexer (recommended):**  
   A subgraph or backend that, on each `MonsterFed` / `MonsterHunted`, resolves owner at that block and updates a mapping or Merkle tree. The Achievement Contract then:
   - Either reads a trusted (optimistic or ZK) state root / mapping updated by the indexer, or
   - Receives and verifies Merkle proofs that “user X has fed” / “user X had monster killed.”

3. **Cthulhu:** Implement in the Achievement/NFT contract by checking that the user holds the other five achievement NFTs (or has been granted the corresponding flags) before minting or unlocking Cthulhu.

---

## 4. Minimal Interface for an External Achievement Contract

If the Achievement Contract can only call the Game Contract and read its own state:

```text
Game Contract: 0x03082c8ca5208E538cc5A4Cf0e669E2B035Ff80A

View calls:
  getOwnerMonsterId(address) → uint256
  getMonster(uint256)        → (..., alive, owner)
  isStarved(uint256)         → bool
  monsterExists(uint256)     → bool

Events to index or query (from logs):
  MonsterCreated(owner indexed, monsterId indexed)
  MonsterFed(monsterId indexed)  → need getMonster(monsterId).owner at block
  MonsterHunted(monsterId indexed, hunter indexed)
  MonsterSold(owner indexed, monsterId indexed)
```

**Achievement flags (how to set them):**

| Achievement | Primary proof | Fallback / note |
|-------------|----------------|------------------|
| Swamp      | Any of: MonsterCreated(owner=user), MonsterSold(owner=user), MonsterHunted(hunter=user), or MonsterFed + owner at block = user | getOwnerMonsterId(user) != 0 (only “has monster”) |
| Goblin     | MonsterCreated(owner=user) | getOwnerMonsterId(user) != 0 |
| Zombie     | MonsterFed(monsterId) and getMonster(monsterId).owner == user at event block | — |
| Ice        | MonsterHunted(hunter=user) | — |
| Demon      | MonsterHunted(monsterId) and getMonster(monsterId).owner == user at event block | — |
| Cthulhu    | Logic in Achievement Contract (e.g. hold Swamp+Goblin+Zombie+Ice+Demon) | — |

This gives a clean, fully on-chain verifiable (with event + optional historical view) specification for an external Achievement Contract without modifying the Game Contract.

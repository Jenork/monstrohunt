# MonstroHunt Contract — Audit & Gameplay Fixes

Contract: `contracts/MonstroHunt.sol`  
Scope: bugs and issues that block or confuse gameplay (no economic/formal audit).

---

## 1. Fixed Issues

### 1.1 Victim cannot create new monster after death (CRITICAL)

**Problem:** On `huntMonster`, the victim's monster was set `alive = false` and `monsterExists[id] = false`, but `ownerToMonsterId[victim]` was **not** cleared. So:

- `getOwnerMonsterId(victim)` still returned the dead monster ID.
- `createMonster` requires `ownerToMonsterId[msg.sender] == 0`, so the victim could **never** create a new monster.

**Fix:** In `huntMonster`, after killing the target, add:

```solidity
ownerToMonsterId[target.owner] = 0;
```

**Frontend:** `useMyMonsters` now treats a monster as “mine” only if `getMonster(id).alive === true`, so the Manage tab shows “Create one” when the monster is dead (even on old deployments where the contract does not clear the slot).

---

### 1.2 Hunter with dead monster could hunt (DEFENSE IN DEPTH)

**Problem:** `huntMonster` only checked `ownerToMonsterId[msg.sender] > 0` and cooldown. It did **not** require that the hunter’s monster is alive. After the victim fix, when your monster is killed your slot is cleared, so you cannot hunt. But for consistency and safety:

**Fix:**

- In `huntMonster`: require `hunter.alive` after loading the hunter’s monster.
- In `canHunt`: return `false` if `!hunterMonster.alive`, so the UI does not show “can hunt” when the hunter’s monster is dead.

---

## 2. Verified — No Issues

### 2.1 Reentrancy

- State (e.g. `totalAliveWeight`, `alive`, `ownerToMonsterId`) is updated **before** any `transfer` or `call` to external addresses.
- Treasury and user payouts happen at the end. No reentrancy into critical state.

### 2.2 Division by zero

- `globalRewardIndex += (distributedToAlive * 1e18) / totalAliveWeight` is guarded by `if (totalAliveWeight > 0)`, so when the last monster is killed we do not divide by zero.

### 2.3 Distribution rounding

- Hunter 30% + Alive 65% + Protocol 5% = 100%. All from the same `weight`, so no wei is left in the contract from a single hunt.

### 2.4 Hunt distribution: all to wallets (30% / 65% / 5%)

- **30%** of the killed monster’s weight is sent as ETH to the hunter’s wallet (`msg.sender`).
- **65%** is split among the **owners of all alive monsters** (proportionally by monster weight) and sent as ETH to each owner’s wallet (the wallet that created that monster). So no part of the victim’s weight is added to monster weight; it all goes to wallets. When only two monsters exist and one kills the other, the hunter is the only alive owner and receives 100% of that 65% on their wallet.
- **5%** is sent to the protocol treasury wallet.
- Implementation: a loop over all monster IDs sends each alive monster’s share to `monster.owner`. Gas is O(monsters.length).

### 2.5 Hunter hunger reset on successful kill

- When a player successfully hunts and kills another monster, the hunter’s monster gets a **full new hunger period**: `hunter.hungerDeadline = block.timestamp + HUNGER_DURATION` (e.g. 3 days). The week is reset so the hunter doesn’t immediately risk starvation after winning a hunt.

### 2.6 Feed cost and rewards

- `feedMonster` calls `_updateMonsterRewards` first, then computes `feedCost` from the updated `monster.weight`. Refund is done after state updates. Logic is consistent.

### 2.7 Sell / Hunt race

- If the target is fed or sold between user signing and mining, the tx reverts (e.g. “Monster already dead” or “Target not starved”). User loses gas only; no state corruption.

### 2.8 View functions

- `getMonster` does not require `monsterExists`; it only checks `monsterId` bounds. So dead/sold monsters still return data (e.g. `alive = false`), which the frontend can use.
- `getFeedCost` requires `monsterExists[monsterId]`, so it correctly reverts for dead/sold monsters.

### 2.9 Solidity 0.8

- Built-in overflow checks; no unchecked blocks that could hide overflows.

---

## 3. Recommendations (Optional)

- **Treasury:** Ensure `protocolTreasury` is an EOA or a contract that can receive ETH; if it reverts on receive, fees accumulate in `protocolBalance` and can be withdrawn later (by design).
- **Testing:** Add tests for: victim creates new monster after being hunted; hunter with dead monster cannot hunt; `canHunt` returns false when hunter’s monster is dead.

---

## 4. Summary

| Issue                               | Severity   | Status   |
|-------------------------------------|------------|----------|
| Victim cannot create after death    | Critical   | Fixed    |
| Hunter alive not checked            | Low / DoD  | Fixed    |
| Reentrancy / div-by-zero / rounding | —          | Checked  |

After redeploy with these fixes, gameplay is consistent: victim can create again, and only a hunter with an alive monster can hunt; the view `canHunt` matches that behavior.

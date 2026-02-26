// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Monstro Hunt
 * @notice Economy LOCKED - protocol fees (5% death, 1% sell) auto-sent to treasury
 * @dev Onchain survival game - 1 wallet = 1 monster
 * No tokens, no NFTs, no upgradeability. Treasury set at deploy.
 * Protocol fees are automatically sent to treasury on each event (hunt/sell).
 * If auto-send fails, fees accumulate in protocolBalance for manual withdrawal.
 */
contract MonstroHunt {
    // Immutable hunger duration (set at deployment, never changeable)
    uint256 public immutable HUNGER_DURATION;
    // Address that can withdraw accumulated protocol fees (set at deployment, never changeable)
    address public immutable protocolTreasury;
    
    // Constants
    uint256 public constant HUNT_COOLDOWN = 20 minutes;
    
    // Tiers (FIXED)
    uint256 public constant TIER_SCOUT = 0.001 ether;
    uint256 public constant TIER_HUNTER = 0.005 ether;
    uint256 public constant TIER_LEVIATHAN = 0.01 ether;
    
    // Distribution shares (basis points: 10000 = 100%) - LOCKED
    uint16 public constant HUNTER_SHARE_BP = 3000;   // 30%
    uint16 public constant ALIVE_SHARE_BP = 6500;    // 65%
    uint16 public constant PROTOCOL_SHARE_BP = 500;  // 5%
    
    // Sell fee - LOCKED
    uint16 public constant SELL_FEE_BP = 100;        // 1%
    
    // Feed formula (internal, not shown in UI) - LOCKED
    uint16 public constant FEED_INITIAL_BP = 500;    // 5%
    uint16 public constant FEED_CURRENT_BP = 500;    // 5%
    
    enum Tier {
        Scout,      // 0.001 ETH
        Hunter,     // 0.005 ETH
        Leviathan   // 0.01 ETH
    }
    
    struct Monster {
        bytes32 name;
        uint8 avatarId;
        Tier tier;
        uint256 initialWeight;
        uint256 weight;
        uint256 hungerDeadline;
        bool alive;
        uint256 lastRewardIndex;
        uint256 lastHuntAttemptAt;
        address owner;
    }
    
    Monster[] public monsters;
    mapping(address => uint256) public ownerToMonsterId;
    mapping(uint256 => bool) public monsterExists;
    
    // Reward distribution system (O(1) global index pattern)
    uint256 public totalAliveWeight;
    uint256 public globalRewardIndex;
    
    // Protocol balance (5% on deaths + 1% on sells)
    uint256 public protocolBalance;
    
    event MonsterCreated(
        uint256 indexed monsterId,
        address indexed owner,
        bytes32 name,
        uint8 avatarId,
        Tier tier,
        uint256 initialWeight
    );
    
    event MonsterFed(
        uint256 indexed monsterId,
        uint256 feedCost,
        uint256 newWeight,
        uint256 newHungerDeadline
    );
    
    event MonsterHunted(
        uint256 indexed monsterId,
        address indexed hunter,
        uint256 hunterReward,
        uint256 distributedToAlive,
        uint256 protocolFee
    );
    
    event MonsterSold(
        uint256 indexed monsterId,
        address indexed owner,
        uint256 payout,
        uint256 protocolFee
    );
    
    event ProtocolWithdrawn(address indexed to, uint256 amount);
    
    /**
     * @notice Constructor sets hunger duration and treasury for protocol fees
     * @param hungerDuration Hunger window in seconds (testnet: 1 day, mainnet: 3 days)
     * @param treasury Address that receives 5% on hunt death and 1% on sell
     */
    constructor(uint256 hungerDuration, address treasury) {
        require(hungerDuration > 0, "Invalid hunger duration");
        require(treasury != address(0), "Invalid treasury");
        HUNGER_DURATION = hungerDuration;
        protocolTreasury = treasury;
    }
    
    /**
     * @notice Create a monster. 1 wallet = 1 monster. No protocol fee.
     * @param name Monster name (max 31 bytes)
     * @param avatarId Avatar ID
     * @param tier Tier (must match msg.value exactly)
     */
    function createMonster(
        bytes32 name,
        uint8 avatarId,
        Tier tier
    ) external payable {
        require(ownerToMonsterId[msg.sender] == 0, "One monster per wallet");
        require(name != bytes32(0), "Name required");
        
        uint256 tierPrice;
        if (tier == Tier.Scout) {
            tierPrice = TIER_SCOUT;
        } else if (tier == Tier.Hunter) {
            tierPrice = TIER_HUNTER;
        } else if (tier == Tier.Leviathan) {
            tierPrice = TIER_LEVIATHAN;
        } else {
            revert("Invalid tier");
        }
        
        require(msg.value == tierPrice, "Value must equal tier price");
        
        uint256 monsterId = monsters.length + 1;
        uint256 hungerDeadline = block.timestamp + HUNGER_DURATION;
        
        monsters.push(Monster({
            name: name,
            avatarId: avatarId,
            tier: tier,
            initialWeight: msg.value,
            weight: msg.value,
            hungerDeadline: hungerDeadline,
            alive: true,
            lastRewardIndex: globalRewardIndex,
            lastHuntAttemptAt: 0,
            owner: msg.sender
        }));
        
        ownerToMonsterId[msg.sender] = monsterId;
        monsterExists[monsterId] = true;
        totalAliveWeight += msg.value;
        
        emit MonsterCreated(monsterId, msg.sender, name, avatarId, tier, msg.value);
    }
    
    /**
     * @notice Feed your monster. No protocol fee. Full amount added to weight.
     * @param monsterId Your monster ID
     */
    function feedMonster(uint256 monsterId) external payable {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster storage monster = monsters[monsterId - 1];
        require(monsterExists[monsterId], "Monster not found");
        require(monster.owner == msg.sender, "Not your monster");
        require(monster.alive, "Monster is dead");
        
        // Last-chance feeding is allowed (even if STARVED)
        
        // Update rewards before state change
        _updateMonsterRewards(monsterId);
        
        // Calculate feed cost (internal formula, not shown in UI)
        uint256 feedCost = (monster.initialWeight * FEED_INITIAL_BP) / 10000 +
                          (monster.weight * FEED_CURRENT_BP) / 10000;
        
        require(msg.value >= feedCost, "Insufficient payment");
        
        uint256 oldWeight = monster.weight;
        monster.weight += feedCost;
        monster.hungerDeadline = block.timestamp + HUNGER_DURATION;
        
        totalAliveWeight = totalAliveWeight - oldWeight + monster.weight;
        monster.lastRewardIndex = globalRewardIndex;
        
        // Refund excess
        if (msg.value > feedCost) {
            payable(msg.sender).transfer(msg.value - feedCost);
        }
        
        emit MonsterFed(monsterId, feedCost, monster.weight, monster.hungerDeadline);
    }
    
    /**
     * @notice Hunt a STARVED monster. Cooldown: 20 minutes per monster.
     * @param targetMonsterId Target monster ID
     */
    function huntMonster(uint256 targetMonsterId) external {
        require(targetMonsterId > 0 && targetMonsterId <= monsters.length, "Monster not found");
        Monster storage target = monsters[targetMonsterId - 1];
        require(monsterExists[targetMonsterId], "Monster not found");
        require(target.alive, "Monster already dead");
        require(isStarved(targetMonsterId), "Target not starved");
        require(target.owner != msg.sender, "Cannot hunt your own");
        
        // Check hunter has a monster and it is alive
        uint256 hunterMonsterId = ownerToMonsterId[msg.sender];
        require(hunterMonsterId > 0, "Hunter must have a monster");
        Monster storage hunter = monsters[hunterMonsterId - 1];
        require(hunter.alive, "Hunter monster is dead");
        
        // Check cooldown (per monster, not per address)
        require(
            block.timestamp >= hunter.lastHuntAttemptAt + HUNT_COOLDOWN,
            "Hunt cooldown active"
        );
        
        // Update cooldown immediately (applies on any attempt)
        hunter.lastHuntAttemptAt = block.timestamp;
        // Reset hunter's hunger: successful kill grants a full new hunger period (e.g. 3 days)
        hunter.hungerDeadline = block.timestamp + HUNGER_DURATION;
        
        // Update rewards for hunter before state change
        _updateMonsterRewards(hunterMonsterId);
        
        // Re-check conditions (honest tx race - gas loss possible)
        require(target.alive, "Monster already dead");
        require(isStarved(targetMonsterId), "Target not starved");
        
        // Update rewards for target before removal
        _updateMonsterRewards(targetMonsterId);
        
        uint256 weight = target.weight;
        
        // Distribution: Hunter 30%, Alive monsters 65%, Protocol 5%
        uint256 hunterReward = (weight * HUNTER_SHARE_BP) / 10000;
        uint256 distributedToAlive = (weight * ALIVE_SHARE_BP) / 10000;
        uint256 protocolFee = (weight * PROTOCOL_SHARE_BP) / 10000;
        
        // Remove monster from alive pool and free victim's slot so they can create again
        totalAliveWeight -= weight;
        target.alive = false;
        monsterExists[targetMonsterId] = false;
        ownerToMonsterId[target.owner] = 0;
        
        // Distribute rewards: 30% hunter wallet, 65% to alive monsters' owners' wallets, 5% protocol
        payable(msg.sender).transfer(hunterReward);
        
        // 65% to owners of all alive monsters (by weight); sent as ETH to their wallets (O(n) in monster count)
        if (totalAliveWeight > 0 && distributedToAlive > 0) {
            for (uint256 id = 1; id <= monsters.length; id++) {
                if (!monsterExists[id]) continue;
                Monster storage m = monsters[id - 1];
                if (!m.alive || m.weight == 0) continue;
                uint256 share = (distributedToAlive * m.weight) / totalAliveWeight;
                if (share > 0) {
                    payable(m.owner).transfer(share);
                }
            }
        }
        
        // 5% to protocol treasury
        if (protocolFee > 0) {
            (bool ok,) = payable(protocolTreasury).call{value: protocolFee}("");
            if (!ok) {
                protocolBalance += protocolFee;
            }
        }
        
        emit MonsterHunted(
            targetMonsterId,
            msg.sender,
            hunterReward,
            distributedToAlive,
            protocolFee
        );
    }
    
    /**
     * @notice Sell your monster. Only if not STARVED. 1% protocol fee.
     * @param monsterId Your monster ID
     */
    function sellMonster(uint256 monsterId) external {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster storage monster = monsters[monsterId - 1];
        require(monsterExists[monsterId], "Monster not found");
        require(monster.owner == msg.sender, "Not your monster");
        require(monster.alive, "Monster is dead");
        require(!isStarved(monsterId), "Cannot sell starved monster");
        
        // Update rewards before state change
        _updateMonsterRewards(monsterId);
        
        uint256 weight = monster.weight;
        uint256 protocolFee = (weight * SELL_FEE_BP) / 10000;
        uint256 payout = weight - protocolFee;
        
        // Remove monster
        totalAliveWeight -= weight;
        monster.alive = false;
        monsterExists[monsterId] = false;
        ownerToMonsterId[msg.sender] = 0;
        
        // Send protocol fee directly to treasury (auto-withdraw)
        if (protocolFee > 0) {
            (bool ok,) = payable(protocolTreasury).call{value: protocolFee}("");
            // If transfer fails, accumulate (fallback for edge cases)
            if (!ok) {
                protocolBalance += protocolFee;
            }
        }
        
        payable(msg.sender).transfer(payout);
        
        emit MonsterSold(monsterId, msg.sender, payout, protocolFee);
    }
    
    /**
     * @notice Update rewards for a specific monster (distribution variant A)
     */
    function _updateMonsterRewards(uint256 monsterId) internal {
        Monster storage monster = monsters[monsterId - 1];
        if (!monster.alive || monster.weight == 0) return;
        
        uint256 pending = monster.weight * (globalRewardIndex - monster.lastRewardIndex) / 1e18;
        if (pending > 0) {
            uint256 oldWeight = monster.weight;
            monster.weight += pending;
            totalAliveWeight = totalAliveWeight - oldWeight + monster.weight;
        }
        monster.lastRewardIndex = globalRewardIndex;
    }
    
    // View functions
    
    function getMonster(uint256 monsterId) external view returns (
        bytes32 name,
        uint8 avatarId,
        Tier tier,
        uint256 initialWeight,
        uint256 weight,
        uint256 hungerDeadline,
        bool alive,
        uint256 lastRewardIndex,
        uint256 lastHuntAttemptAt,
        address owner
    ) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        return (
            monster.name,
            monster.avatarId,
            monster.tier,
            monster.initialWeight,
            monster.weight,
            monster.hungerDeadline,
            monster.alive,
            monster.lastRewardIndex,
            monster.lastHuntAttemptAt,
            monster.owner
        );
    }
    
    function getOwnerMonsterId(address owner) external view returns (uint256) {
        return ownerToMonsterId[owner];
    }
    
    function isStarved(uint256 monsterId) public view returns (bool) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        if (!monster.alive) return false;
        return block.timestamp >= monster.hungerDeadline;
    }
    
    function getFeedCost(uint256 monsterId) external view returns (uint256) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        require(monsterExists[monsterId], "Monster not found");
        
        uint256 currentWeight = monster.weight;
        if (monster.alive && monster.weight > 0) {
            uint256 pending = monster.weight * (globalRewardIndex - monster.lastRewardIndex) / 1e18;
            currentWeight += pending;
        }
        
        return (monster.initialWeight * FEED_INITIAL_BP) / 10000 +
               (currentWeight * FEED_CURRENT_BP) / 10000;
    }
    
    function getPendingRewards(uint256 monsterId) external view returns (uint256) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        if (!monster.alive || monster.weight == 0) return 0;
        
        return monster.weight * (globalRewardIndex - monster.lastRewardIndex) / 1e18;
    }
    
    function canHunt(address hunter, uint256 targetMonsterId) external view returns (bool) {
        uint256 hunterMonsterId = ownerToMonsterId[hunter];
        if (hunterMonsterId == 0) return false;
        
        Monster memory hunterMonster = monsters[hunterMonsterId - 1];
        if (!hunterMonster.alive) return false;
        if (block.timestamp < hunterMonster.lastHuntAttemptAt + HUNT_COOLDOWN) {
            return false;
        }
        
        if (!isStarved(targetMonsterId)) return false;
        
        Monster memory target = monsters[targetMonsterId - 1];
        if (!target.alive || target.owner == hunter) return false;
        
        return true;
    }
    
    function getTotalMonsters() external view returns (uint256) {
        return monsters.length;
    }
    
    /**
     * @notice Withdraw accumulated protocol fees to treasury. Only treasury can call.
     */
    function withdrawProtocolBalance() external {
        require(msg.sender == protocolTreasury, "Not treasury");
        uint256 amount = protocolBalance;
        require(amount > 0, "Nothing to withdraw");
        require(address(this).balance >= amount, "Insufficient contract balance");
        protocolBalance = 0;
        (bool ok,) = payable(protocolTreasury).call{value: amount}("");
        require(ok, "Transfer failed");
        emit ProtocolWithdrawn(protocolTreasury, amount);
    }
}

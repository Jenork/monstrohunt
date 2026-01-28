// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Monstro Hunt
 * @notice FINAL ECONOMY v1.3 (LOCKED + VERIFIED)
 * @dev Onchain survival game - 1 wallet = 1 monster
 * No tokens, no NFTs, no upgradeability
 */
contract MonstroHunt {
    // Constants
    uint256 public constant HUNGER_WINDOW = 7 days;
    uint256 public constant HUNT_COOLDOWN = 20 minutes;
    
    // Tiers (FIXED)
    uint256 public constant TIER_SCOUT = 0.001 ether;      // 0.001 ETH
    uint256 public constant TIER_HUNTER = 0.005 ether;      // 0.005 ETH
    uint256 public constant TIER_LEVIATHAN = 0.01 ether;   // 0.01 ETH
    
    // Distribution shares (basis points: 10000 = 100%)
    uint16 public constant HUNTER_SHARE_BP = 2000;  // 20%
    uint16 public constant ALIVE_SHARE_BP = 7500;    // 75%
    uint16 public constant PROTOCOL_SHARE_BP = 500;  // 5%
    
    // Sell fee
    uint16 public constant SELL_FEE_BP = 100;        // 1%
    
    // Feed formula: 5% initialWeight + 5% currentWeight
    uint16 public constant FEED_INITIAL_BP = 500;     // 5%
    uint16 public constant FEED_CURRENT_BP = 500;     // 5%
    
    enum Tier {
        Scout,      // 0.001 ETH
        Hunter,     // 0.005 ETH
        Leviathan   // 0.01 ETH
    }
    
    struct Monster {
        bytes32 name;
        uint8 avatarId;
        Tier tier;
        uint256 initialWeight;      // Initial deposit (wei)
        uint256 weight;             // Current weight (wei)
        uint256 hungerDeadline;     // Timestamp when monster becomes STARVED
        bool alive;                 // false if hunted/dead
        uint256 lastRewardIndex;    // Last globalRewardIndex when rewards were claimed
        uint256 lastHuntAttemptAt;  // Timestamp of last hunt attempt (for cooldown)
        address owner;
    }
    
    Monster[] public monsters;
    mapping(address => uint256) public ownerToMonsterId;  // 1 wallet = 1 monster
    mapping(uint256 => bool) public monsterExists;         // Quick existence check
    
    // Reward distribution system
    uint256 public totalAliveWeight;      // Sum of all alive monster weights
    uint256 public globalRewardIndex;     // Accumulated rewards per weight (scaled by 1e18)
    
    // Protocol balance (earns from 5% on deaths + 1% on sells)
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
    
    /**
     * @notice Create a monster. 1 wallet = 1 monster.
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
        
        // Update rewards for all monsters before state change
        _updateAllMonsterRewards();
        
        uint256 monsterId = monsters.length + 1; // Start from 1 (0 means no monster)
        uint256 hungerDeadline = block.timestamp + HUNGER_WINDOW;
        
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
     * @notice Feed your monster. Cost = 5% initialWeight + 5% currentWeight
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
        
        // Calculate feed cost: 5% initialWeight + 5% currentWeight
        uint256 feedCost = (monster.initialWeight * FEED_INITIAL_BP) / 10000 +
                          (monster.weight * FEED_CURRENT_BP) / 10000;
        
        require(msg.value >= feedCost, "Insufficient payment");
        
        uint256 oldWeight = monster.weight;
        monster.weight += feedCost; // Full feed amount is added to weight
        monster.hungerDeadline = block.timestamp + HUNGER_WINDOW;
        
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
        
        // Check hunter has a monster
        uint256 hunterMonsterId = ownerToMonsterId[msg.sender];
        require(hunterMonsterId > 0, "Hunter must have a monster");
        
        // Check cooldown
        Monster storage hunter = monsters[hunterMonsterId - 1];
        require(
            block.timestamp >= hunter.lastHuntAttemptAt + HUNT_COOLDOWN,
            "Hunt cooldown active"
        );
        
        // Update cooldown immediately (applies on success or failure)
        hunter.lastHuntAttemptAt = block.timestamp;
        
        // Update rewards for hunter before state change
        _updateMonsterRewards(hunterMonsterId);
        
        // Re-check conditions (honest tx race)
        require(target.alive, "Monster already dead");
        require(isStarved(targetMonsterId), "Target not starved");
        
        // Update rewards for target before removal
        _updateMonsterRewards(targetMonsterId);
        
        uint256 weight = target.weight;
        
        // Distribution: Hunter 20%, Alive monsters 75%, Protocol 5%
        uint256 hunterReward = (weight * HUNTER_SHARE_BP) / 10000;
        uint256 distributedToAlive = (weight * ALIVE_SHARE_BP) / 10000;
        uint256 protocolFee = (weight * PROTOCOL_SHARE_BP) / 10000;
        
        // Remove monster
        totalAliveWeight -= weight;
        target.alive = false;
        monsterExists[targetMonsterId] = false;
        
        // Distribute rewards
        payable(msg.sender).transfer(hunterReward);
        protocolBalance += protocolFee;
        
        // Distribute to alive monsters proportionally
        if (totalAliveWeight > 0) {
            globalRewardIndex += (distributedToAlive * 1e18) / totalAliveWeight;
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
        
        protocolBalance += protocolFee;
        payable(msg.sender).transfer(payout);
        
        emit MonsterSold(monsterId, msg.sender, payout, protocolFee);
    }
    
    /**
     * @notice Update rewards for a specific monster
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
    
    /**
     * @notice Update rewards for all monsters (O(1) - no loops)
     * Called before state changes that affect totalAliveWeight
     */
    function _updateAllMonsterRewards() internal {
        // This is O(1) - we don't loop. Rewards are calculated on-demand
        // when monsters interact with the system (feed/hunt/sell)
        // The globalRewardIndex accumulates, and each monster tracks its lastRewardIndex
    }
    
    // View functions
    
    /**
     * @notice Get monster data
     */
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
    
    /**
     * @notice Get monster ID for an owner (0 if none)
     */
    function getOwnerMonsterId(address owner) external view returns (uint256) {
        return ownerToMonsterId[owner];
    }
    
    /**
     * @notice Check if monster is STARVED (can be hunted)
     */
    function isStarved(uint256 monsterId) public view returns (bool) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        if (!monster.alive) return false;
        return block.timestamp >= monster.hungerDeadline;
    }
    
    /**
     * @notice Calculate feed cost for a monster
     */
    function getFeedCost(uint256 monsterId) external view returns (uint256) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        require(monsterExists[monsterId], "Monster not found");
        
        // Update weight with pending rewards for accurate calculation
        uint256 currentWeight = monster.weight;
        if (monster.alive && monster.weight > 0) {
            uint256 pending = monster.weight * (globalRewardIndex - monster.lastRewardIndex) / 1e18;
            currentWeight += pending;
        }
        
        return (monster.initialWeight * FEED_INITIAL_BP) / 10000 +
               (currentWeight * FEED_CURRENT_BP) / 10000;
    }
    
    /**
     * @notice Get pending rewards for a monster
     */
    function getPendingRewards(uint256 monsterId) external view returns (uint256) {
        require(monsterId > 0 && monsterId <= monsters.length, "Monster not found");
        Monster memory monster = monsters[monsterId - 1];
        if (!monster.alive || monster.weight == 0) return 0;
        
        return monster.weight * (globalRewardIndex - monster.lastRewardIndex) / 1e18;
    }
    
    /**
     * @notice Check if hunter can hunt (cooldown check)
     */
    function canHunt(address hunter, uint256 targetMonsterId) external view returns (bool) {
        uint256 hunterMonsterId = ownerToMonsterId[hunter];
        if (hunterMonsterId == 0) return false;
        
        Monster memory hunterMonster = monsters[hunterMonsterId - 1];
        if (block.timestamp < hunterMonster.lastHuntAttemptAt + HUNT_COOLDOWN) {
            return false;
        }
        
        if (!isStarved(targetMonsterId)) return false;
        
        Monster memory target = monsters[targetMonsterId - 1];
        if (!target.alive || target.owner == hunter) return false;
        
        return true;
    }
    
    /**
     * @notice Get total number of monsters
     */
    function getTotalMonsters() external view returns (uint256) {
        return monsters.length;
    }
}

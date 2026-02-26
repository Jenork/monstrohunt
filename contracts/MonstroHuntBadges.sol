// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MonstroHuntBadges
 * @notice ERC-1155 achievement badges for Monstro Hunt. Token IDs: 1=Swamp, 2=Goblin, 3=Zombie, 4=Ice, 5=Demon, 6=Cthulhu.
 */
contract MonstroHuntBadges is ERC1155, Ownable {
    // Token IDs (match app/constants/achievements.ts)
    uint256 public constant SWAMP = 1;
    uint256 public constant GOBLIN = 2;
    uint256 public constant ZOMBIE = 3;
    uint256 public constant ICE = 4;
    uint256 public constant DEMON = 5;
    uint256 public constant CTHULHU = 6;

    mapping(address => bool) public hasClaimedSwamp;

    event SwampClaimed(address indexed to);

    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}

    /**
     * @notice Claim free Swamp badge (one per address). No game condition.
     */
    function claimSwamp() external {
        require(!hasClaimedSwamp[msg.sender], "Already claimed");
        hasClaimedSwamp[msg.sender] = true;
        _mint(msg.sender, SWAMP, 1, "");
        emit SwampClaimed(msg.sender);
    }

    /**
     * @notice Owner can mint any badge (for airdrops or after verifying game conditions off-chain).
     */
    function mint(address to, uint256 tokenId, uint256 amount) external onlyOwner {
        require(tokenId >= SWAMP && tokenId <= CTHULHU, "Invalid token id");
        _mint(to, tokenId, amount, "");
    }

    /**
     * @notice Set URI for metadata (optional; can point to IPFS or API).
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}

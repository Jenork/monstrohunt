import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  CONTRACT_ADDRESS,
  BADGES_CONTRACT_ADDRESS,
  isBadgesAddressValid,
  isContractAddressValid,
  monstroHuntABI,
} from '../../utils/contract';
import { monstroHuntBadgesABI, BADGES_TOKEN_IDS } from '../../contracts/monstroHuntBadges';

const BADGES_OWNER_KEY = process.env.BADGES_OWNER_PRIVATE_KEY;
const GAME_DEPLOY_BLOCK = process.env.GAME_CONTRACT_DEPLOY_BLOCK
  ? BigInt(process.env.GAME_CONTRACT_DEPLOY_BLOCK)
  : 0n;

const CLAIMABLE_TOKEN_IDS = [
  BADGES_TOKEN_IDS.goblin,
  BADGES_TOKEN_IDS.zombie,
  BADGES_TOKEN_IDS.ice,
  BADGES_TOKEN_IDS.demon,
  BADGES_TOKEN_IDS.cthulhu,
] as const;

/**
 * POST /api/claim-badge
 * Body: { address: string, tokenId: number }
 * Verifies game condition for the badge and mints from badges contract (owner only).
 * Supported: 2=Goblin, 3=Zombie, 4=Ice, 5=Demon, 6=Cthulhu.
 */
export async function POST(request: NextRequest) {
  if (!BADGES_OWNER_KEY || !isBadgesAddressValid) {
    return NextResponse.json(
      { error: 'Claim not configured (missing BADGES_OWNER_PRIVATE_KEY or contract)' },
      { status: 503 }
    );
  }

  let body: { address?: string; tokenId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address: rawAddress, tokenId } = body;
  if (!rawAddress || typeof tokenId !== 'number') {
    return NextResponse.json({ error: 'address and tokenId required' }, { status: 400 });
  }

  let address: `0x${string}`;
  try {
    address = parseAddress(rawAddress);
  } catch {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  if (!CLAIMABLE_TOKEN_IDS.includes(tokenId as (typeof CLAIMABLE_TOKEN_IDS)[number])) {
    return NextResponse.json(
      { error: 'Invalid tokenId; use 2 (Goblin), 3 (Zombie), 4 (Ice), 5 (Demon), 6 (Cthulhu)' },
      { status: 400 }
    );
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const balance = await publicClient.readContract({
    address: BADGES_CONTRACT_ADDRESS,
    abi: monstroHuntBadgesABI,
    functionName: 'balanceOf',
    args: [address, BigInt(tokenId)],
  });
  if (balance > 0n) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  if (!isContractAddressValid) {
    return NextResponse.json({ error: 'Game contract not configured' }, { status: 503 });
  }

  // Verify condition for each badge
  if (tokenId === BADGES_TOKEN_IDS.goblin) {
    const monsterId = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      functionName: 'getOwnerMonsterId',
      args: [address],
    });
    if (monsterId === 0n) {
      return NextResponse.json(
        { error: 'Create a monster first to claim Goblin badge' },
        { status: 400 }
      );
    }
  } else if (tokenId === BADGES_TOKEN_IDS.zombie) {
    const fedEvents = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      eventName: 'MonsterFed',
      fromBlock: GAME_DEPLOY_BLOCK,
    });
    let hasFed = false;
    for (const ev of fedEvents.slice(-500)) {
      const monster = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'getMonster',
        args: [ev.args.monsterId!],
        blockNumber: ev.blockNumber,
      });
      if (monster && monster[9]?.toLowerCase() === address.toLowerCase()) {
        hasFed = true;
        break;
      }
    }
    if (!hasFed) {
      return NextResponse.json(
        { error: 'Feed your monster at least once to claim Zombie badge' },
        { status: 400 }
      );
    }
  } else if (tokenId === BADGES_TOKEN_IDS.ice) {
    const huntEvents = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      eventName: 'MonsterHunted',
      args: { hunter: address },
      fromBlock: GAME_DEPLOY_BLOCK,
    });
    if (huntEvents.length === 0) {
      return NextResponse.json(
        { error: 'Complete at least one successful hunt to claim Ice badge' },
        { status: 400 }
      );
    }
  } else if (tokenId === BADGES_TOKEN_IDS.demon) {
    const huntEvents = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: monstroHuntABI,
      eventName: 'MonsterHunted',
      fromBlock: GAME_DEPLOY_BLOCK,
    });
    let wasVictim = false;
    for (const ev of huntEvents.slice(-500)) {
      if (!ev.args.monsterId) continue;
      const monster = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: monstroHuntABI,
        functionName: 'getMonster',
        args: [ev.args.monsterId],
        blockNumber: ev.blockNumber,
      });
      if (monster && monster[9]?.toLowerCase() === address.toLowerCase()) {
        wasVictim = true;
        break;
      }
    }
    if (!wasVictim) {
      return NextResponse.json(
        { error: 'Your monster must be hunted while starved to claim Demon badge' },
        { status: 400 }
      );
    }
  } else if (tokenId === BADGES_TOKEN_IDS.cthulhu) {
    for (let id = 1; id <= 5; id++) {
      const b = await publicClient.readContract({
        address: BADGES_CONTRACT_ADDRESS,
        abi: monstroHuntBadgesABI,
        functionName: 'balanceOf',
        args: [address, BigInt(id)],
      });
      if (b === 0n) {
        return NextResponse.json(
          { error: 'Collect all other badges (1–5) first to claim Cthulhu' },
          { status: 400 }
        );
      }
    }
  }

  const account = privateKeyToAccount(BADGES_OWNER_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  try {
    const hash = await walletClient.writeContract({
      address: BADGES_CONTRACT_ADDRESS,
      abi: monstroHuntBadgesABI,
      functionName: 'mint',
      args: [address, BigInt(tokenId), 1n],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return NextResponse.json({ success: true, hash });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Mint failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

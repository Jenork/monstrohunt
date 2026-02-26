import { Address, isAddress, zeroAddress } from 'viem';
import { monstroHuntABI } from '../contracts/monstroHunt';

const RAW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RAW_BADGES_ADDRESS = process.env.NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS;

export const isContractAddressValid =
  !!RAW_CONTRACT_ADDRESS &&
  isAddress(RAW_CONTRACT_ADDRESS) &&
  RAW_CONTRACT_ADDRESS.toLowerCase() !== zeroAddress;

export const CONTRACT_ADDRESS = (isContractAddressValid
  ? RAW_CONTRACT_ADDRESS
  : zeroAddress) as Address;

export const isBadgesAddressValid =
  !!RAW_BADGES_ADDRESS &&
  isAddress(RAW_BADGES_ADDRESS) &&
  RAW_BADGES_ADDRESS.toLowerCase() !== zeroAddress;

export const BADGES_CONTRACT_ADDRESS = (isBadgesAddressValid
  ? RAW_BADGES_ADDRESS
  : zeroAddress) as Address;

export { monstroHuntABI };

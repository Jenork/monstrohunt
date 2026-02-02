import { Address, isAddress, zeroAddress } from 'viem';
import { monstroHuntABI } from '../contracts/monstroHunt';

const RAW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const isContractAddressValid =
  !!RAW_CONTRACT_ADDRESS &&
  isAddress(RAW_CONTRACT_ADDRESS) &&
  RAW_CONTRACT_ADDRESS.toLowerCase() !== zeroAddress;

export const CONTRACT_ADDRESS = (isContractAddressValid
  ? RAW_CONTRACT_ADDRESS
  : zeroAddress) as Address;

export { monstroHuntABI };

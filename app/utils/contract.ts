import { Address } from 'viem';
import { monstroHuntABI } from '../contracts/monstroHunt';

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

export { monstroHuntABI };

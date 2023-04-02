import { DecreeRarity } from './constants';
import { decrees } from './decrees';

export const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export const commonDecrees = decrees.filter((x) => x.rarity === DecreeRarity.Common);
export const rareDecrees = decrees.filter((x) => x.rarity === DecreeRarity.Rare);
export const epicDecrees = decrees.filter((x) => x.rarity === DecreeRarity.Epic);
export const legendaryDecrees = decrees.filter((x) => x.rarity === DecreeRarity.Legendary);

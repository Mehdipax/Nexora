export interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'nova-hoodie', label: 'Nova Hoodie', src: '/avatars/nova-hoodie.svg' },
  { id: 'luna-glasses', label: 'Luna Glasses', src: '/avatars/luna-glasses.svg' },
  { id: 'kai-headphones', label: 'Kai Headphones', src: '/avatars/kai-headphones.svg' },
  { id: 'amina-hijab', label: 'Amina Hijab', src: '/avatars/amina-hijab.svg' },
  { id: 'milo-coder', label: 'Milo Coder', src: '/avatars/milo-coder.svg' },
  { id: 'zara-cap', label: 'Zara Cap', src: '/avatars/zara-cap.svg' },
  { id: 'ren-techwear', label: 'Ren Techwear', src: '/avatars/ren-techwear.svg' },
  { id: 'leo-shades', label: 'Leo Shades', src: '/avatars/leo-shades.svg' },
  { id: 'orion-laptop', label: 'Orion Laptop', src: '/avatars/orion-laptop.svg' },
  { id: 'nina-headset', label: 'Nina Headset', src: '/avatars/nina-headset.svg' },
  { id: 'sol-jacket', label: 'Sol Jacket', src: '/avatars/sol-jacket.svg' },
  { id: 'maya-bucket', label: 'Maya Bucket', src: '/avatars/maya-bucket.svg' },
  { id: 'hana-buns', label: 'Hana Buns', src: '/avatars/hana-buns.svg' },
  { id: 'amir-mask', label: 'Amir Mask', src: '/avatars/amir-mask.svg' },
  { id: 'ivy-ponytail', label: 'Ivy Ponytail', src: '/avatars/ivy-ponytail.svg' },
  { id: 'rio-fade', label: 'Rio Fade', src: '/avatars/rio-fade.svg' },
];

const avatarIdSet = new Set(AVATAR_OPTIONS.map((avatar) => avatar.id));

export const DEFAULT_AVATAR_ID = AVATAR_OPTIONS[0].id;

export function isValidAvatarId(value: string | null | undefined): value is string {
  return Boolean(value && avatarIdSet.has(value));
}

export function getAvatarById(avatarId: string | null | undefined): AvatarOption {
  return AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId) ?? AVATAR_OPTIONS[0];
}

export function avatarUrl(avatarId: string | null | undefined): string {
  return getAvatarById(avatarId).src;
}

export function getDefaultAvatarIdForWallet(walletAddress: string): string {
  if (!walletAddress) return DEFAULT_AVATAR_ID;
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = (hash * 31 + walletAddress.charCodeAt(i)) % 1000003;
  }
  const index = Math.abs(hash) % AVATAR_OPTIONS.length;
  return AVATAR_OPTIONS[index].id;
}

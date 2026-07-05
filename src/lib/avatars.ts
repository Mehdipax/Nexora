export interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=8B5CF6,38BDF8,1E293B&backgroundType=gradientLinear&radius=50`;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'nova-hoodie',    label: 'Nova Hoodie',    src: dicebearUrl('nova-hoodie-2026') },
  { id: 'luna-glasses',   label: 'Luna Glasses',   src: dicebearUrl('luna-glasses-2026') },
  { id: 'kai-headphones', label: 'Kai Headphones', src: dicebearUrl('kai-headphones-2026') },
  { id: 'amina-hijab',    label: 'Amina Hijab',    src: dicebearUrl('amina-hijab-2026') },
  { id: 'milo-coder',     label: 'Milo Coder',     src: dicebearUrl('milo-coder-2026') },
  { id: 'zara-cap',       label: 'Zara Cap',       src: dicebearUrl('zara-cap-2026') },
  { id: 'ren-techwear',   label: 'Ren Techwear',   src: dicebearUrl('ren-techwear-2026') },
  { id: 'leo-shades',     label: 'Leo Shades',     src: dicebearUrl('leo-shades-2026') },
  { id: 'orion-laptop',   label: 'Orion Laptop',   src: dicebearUrl('orion-laptop-2026') },
  { id: 'nina-headset',   label: 'Nina Headset',   src: dicebearUrl('nina-headset-2026') },
  { id: 'sol-jacket',     label: 'Sol Jacket',     src: dicebearUrl('sol-jacket-2026') },
  { id: 'maya-bucket',    label: 'Maya Bucket',    src: dicebearUrl('maya-bucket-2026') },
  { id: 'hana-buns',      label: 'Hana Buns',      src: dicebearUrl('hana-buns-2026') },
  { id: 'amir-mask',      label: 'Amir Mask',      src: dicebearUrl('amir-mask-2026') },
  { id: 'ivy-ponytail',   label: 'Ivy Ponytail',   src: dicebearUrl('ivy-ponytail-2026') },
  { id: 'rio-fade',       label: 'Rio Fade',       src: dicebearUrl('rio-fade-2026') },
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

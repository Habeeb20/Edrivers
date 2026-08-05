import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

// e.g. "wlt-m5k2p1a3-x7h2q9k1a0bc" — lowercase alnum + hyphens, well over 16 chars
export const generateWalletReference = () => `wlt-${Date.now().toString(36)}-${nanoid()}`;
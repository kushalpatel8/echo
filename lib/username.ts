import User from './models/User';

const ADJECTIVES = [
  'calm', 'serene', 'gentle', 'mindful', 'hopeful', 'peaceful', 'bright', 'kind', 'warm', 'quiet', 
  'brave', 'happy', 'patient', 'silent', 'swift', 'stellar', 'cosmic', 'tranquil', 'noble', 'vibrant',
  'lucid', 'solar', 'harmonic', 'radiant', 'mystic', 'cozy', 'golden', 'silver', 'sapphire'
];

const NOUNS = [
  'river', 'sky', 'breeze', 'dawn', 'star', 'cloud', 'leaf', 'wave', 'forest', 'spark', 
  'moon', 'sun', 'echo', 'light', 'meadow', 'voyager', 'falcon', 'phoenix', 'harbor', 'brook',
  'compass', 'beacon', 'valley', 'zenith', 'solace', 'sanctuary', 'aurora', 'glide', 'bloom', 'creek'
];

export async function getUniqueUsername(clerkUser?: any): Promise<string> {
  // 1. If Clerk user has a username explicitly set, check if it's available in DB
  if (clerkUser?.username) {
    const existing = await User.findOne({ name: clerkUser.username });
    if (!existing) return clerkUser.username;
  }

  // 2. Otherwise generate adjective_noun_number and verify uniqueness against User collection
  let attempts = 0;
  while (attempts < 20) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${adj}_${noun}_${num}`;

    const existing = await User.findOne({ name: candidate });
    if (!existing) {
      return candidate;
    }
    attempts++;
  }

  // Fallback if loop finishes without finding unique name
  return `echo_user_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
}

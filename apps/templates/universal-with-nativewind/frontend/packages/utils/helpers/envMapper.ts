/**
 * Removes 'NEXT_PUBLIC_' or 'EXPO_PUBLIC_' prefix from an environment variable key.
 * @param key - The environment variable key to map.
 * @returns A new key with the prefix removed.
 */
export function envMapper(key: string): string {
  return key.replace(/^(NEXT_PUBLIC_|EXPO_PUBLIC_)/, '');
}

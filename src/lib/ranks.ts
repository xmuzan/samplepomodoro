
export const TIERS = ['E', 'D', 'C', 'B', 'A', 'S'];

/**
 * Calculates the user's tier based on their level.
 * A new tier is achieved every 20 levels.
 * @param level The user's current level.
 * @returns The tier string (e.g., 'E', 'D', 'S').
 */
export function getTierForLevel(level: number): string {
  const tierIndex = Math.floor(level / 20);
  
  if (tierIndex >= TIERS.length) {
    // For levels 100 and above, return the highest tier 'S'
    return TIERS[TIERS.length - 1];
  }
  
  if (tierIndex < 0) {
      return TIERS[0];
  }

  return TIERS[tierIndex];
}

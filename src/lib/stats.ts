
// This file can be refactored or removed as its logic is now within userData.ts
// For now, we keep it to avoid breaking imports that might still exist,
// but its functions should be considered deprecated in favor of getUserData and updateUserData.

export interface UserStats {
    hp: number;
    mp: number;
    ir: number;
}

const defaultStats: UserStats = {
    hp: 100,
    mp: 100,
    ir: 100,
};

/**
 * @deprecated Use getUserData(username) from `lib/userData` instead.
 */
export function getStats(): UserStats {
    console.warn("getStats() is deprecated. Use getUserData(username) from `lib/userData` instead.");
    return defaultStats;
}

/**
 * @deprecated Use updateUserData(username, { baseStats: ... }) from `lib/userData` instead.
 */
export function updateStats(changes: Partial<UserStats>): UserStats {
    console.warn("updateStats() is deprecated. Use updateUserData(username, { baseStats: ... }) from `lib/userData` instead.");
    
    const newStats: UserStats = { ...defaultStats };

    if (changes.hp !== undefined) {
        newStats.hp = Math.max(0, Math.min(100, defaultStats.hp + changes.hp));
    }
    if (changes.mp !== undefined) {
        newStats.mp = Math.max(0, Math.min(100, defaultStats.mp + changes.mp));
    }
    if (changes.ir !== undefined) {
        newStats.ir = Math.max(0, Math.min(100, defaultStats.ir + changes.ir));
    }

    return newStats;
}

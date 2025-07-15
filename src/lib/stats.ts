
export interface UserStats {
    hp: number;
    mp: number;
    ir: number;
}

const STATS_KEY = 'baseStats';

const defaultStats: UserStats = {
    hp: 100,
    mp: 100,
    ir: 100,
};

// Function to get current stats from localStorage
export function getStats(): UserStats {
    if (typeof window === 'undefined') {
        return defaultStats;
    }
    try {
        const storedStats = localStorage.getItem(STATS_KEY);
        if (storedStats) {
            const parsed = JSON.parse(storedStats);
            // Basic validation
            if (typeof parsed.hp === 'number' && typeof parsed.mp === 'number') {
                return { ...defaultStats, ...parsed };
            }
        }
        // If no valid stats found, set and return default
        localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
        return defaultStats;
    } catch (error) {
        console.error("Failed to parse stats from localStorage", error);
        return defaultStats;
    }
}

// Function to update stats and save to localStorage
export function updateStats(changes: Partial<UserStats>): UserStats {
    const currentStats = getStats();
    
    const newStats: UserStats = { ...currentStats };

    if (changes.hp !== undefined) {
        newStats.hp = Math.max(0, Math.min(100, currentStats.hp + changes.hp));
    }
    if (changes.mp !== undefined) {
        newStats.mp = Math.max(0, Math.min(100, currentStats.mp + changes.mp));
    }
    if (changes.ir !== undefined) {
        newStats.ir = Math.max(0, Math.min(100, currentStats.ir + changes.ir));
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
        // Dispatch a storage event to notify other tabs/components
        window.dispatchEvent(new Event('storage'));
    }

    return newStats;
}

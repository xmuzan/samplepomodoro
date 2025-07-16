
'use client'; // Keep client for direct debugging from the login page

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { User } from '@/types';
import type { Task } from '@/components/task-manager';
import type { InventoryItem } from '@/app/(protected)/profile/_components/inventory-dialog';
import type { SkillData } from './skills';
import type { UserStats } from './stats';

export interface UserData {
    userGold: number;
    avatarUrl: string;
    level: number;
    tasksCompletedThisLevel: number;
    tasksRequiredForNextLevel: number;
    attributePoints: number;
    stats: {
        str: number;
        vit: number;
        agi: number;
        int: number;
        per: number;
    };
    baseStats: UserStats;
    skillData: SkillData;
    tasks: Task[];
    inventory: InventoryItem[];
    penaltyEndTime?: number | null;
    taskDeadline?: number | null;
}

const defaultUserData: Omit<UserData, 'password'> = {
    userGold: 150,
    avatarUrl: "https://placehold.co/100x100.png",
    level: 0,
    tasksCompletedThisLevel: 0,
    tasksRequiredForNextLevel: 32,
    attributePoints: 0,
    stats: { str: 0, vit: 0, agi: 0, int: 0, per: 0 },
    baseStats: { hp: 100, mp: 100, ir: 100 },
    skillData: {},
    tasks: [],
    inventory: [],
    penaltyEndTime: null,
    taskDeadline: null,
};

// Get a user's entire data document
export async function getUserData(username: string): Promise<UserData | null> {
    const userRef = doc(db, 'users', username);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        // We only need the progress data, not the auth info
        const { password, isAdmin, status, ...progressData } = docSnap.data();
        return progressData as UserData;
    } else {
        console.log("No such document for user:", username);
        return null;
    }
}

// Update parts of a user's data document
export async function updateUserData(username: string, dataToUpdate: Partial<UserData>) {
    const userRef = doc(db, 'users', username);
    await updateDoc(userRef, dataToUpdate);
}


export async function updateTasks(username: string, dataToUpdate: Partial<Pick<UserData, 'tasks' | 'taskDeadline' | 'penaltyEndTime'>>) {
    const userRef = doc(db, 'users', username);
    await updateDoc(userRef, dataToUpdate);
}


// --- User Authentication and Management ---

export async function getUserForLogin(username: string, password?: string): Promise<{ success: boolean, message: string, user?: User }> {
    const userRef = doc(db, "users", username);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        return { success: false, message: "Kullanıcı bulunamadı." };
    }

    const userData = docSnap.data();
    // In a real app, passwords would be hashed and compared securely.
    // For this project, we are comparing plain text.
    if (userData.password !== password) {
        return { success: false, message: "Yanlış şifre." };
    }
    
    return { 
        success: true, 
        message: "Giriş başarılı", 
        user: {
            username: docSnap.id,
            isAdmin: userData.isAdmin || false,
            status: userData.status || 'pending'
        }
    };
}

export async function createNewUser(username: string, password?: string): Promise<{ success: boolean, message: string }> {
    if (!username || !password) {
        return { success: false, message: "Kullanıcı adı ve şifre gereklidir." };
    }
    const userRef = doc(db, "users", username);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        return { success: false, message: "Bu kullanıcı adı zaten alınmış." };
    }

    // This is the auth-related part of the user document
    const newUserAuthInfo: User & { password?: string } = {
        username,
        password, // Storing plain text password - NOT FOR PRODUCTION
        isAdmin: false,
        status: 'pending' // Users start as pending
    };
    
    // Combine auth info with the default game progress data
    const fullUserData = {
        ...newUserAuthInfo,
        ...defaultUserData,
    };

    // Set the new user document in Firestore
    await setDoc(userRef, fullUserData);

    return { success: true, message: 'Kaydınız alındı. Hesabınız yönetici tarafından onaylandığında giriş yapabilirsiniz.' };
}

export async function getAllUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({
        username: doc.id,
        isAdmin: doc.data().isAdmin || false,
        status: doc.data().status || 'pending'
    }));
    return userList;
}

export async function updateUserStatus(username: string, status: 'active' | 'pending') {
    const userRef = doc(db, "users", username);
    await updateDoc(userRef, { status });
}

export async function resetUserProgress(username: string) {
    const userRef = doc(db, 'users', username);
    // Reset all progress fields to default, but keep auth fields like isAdmin, status, password
    const dataToUpdate = { ...defaultUserData };
    await updateDoc(userRef, dataToUpdate);
}

// --- Global Data (like Boss) ---

interface BossData {
    hp: number;
    respawnTime: number | null;
}

export async function getGlobalBossData(bossId: string): Promise<Partial<BossData>> {
    const bossRef = doc(db, 'global_state', bossId);
    const docSnap = await getDoc(bossRef);
    if (docSnap.exists()) {
        return docSnap.data() as BossData;
    }
    return {};
}

export async function updateGlobalBossData(bossId: string, data: Partial<BossData>) {
    const bossRef = doc(db, 'global_state', bossId);
    // Use setDoc with merge to create or update
    await setDoc(bossRef, data, { merge: true });
}

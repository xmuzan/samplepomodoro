
'use server';

import { revalidatePath } from 'next/cache';
import { getUserData, updateUserData } from '@/lib/userData';
import { getTierForLevel } from '@/lib/ranks';
import { type Task } from '@/components/task-manager';
import type { UserData } from '@/lib/userData';

const TASKS_PER_RANK = 20;

export async function completeTaskAction(username: string, task: Task): Promise<{ error?: string; message?: string }> {
  try {
    const userData = await getUserData(username);
    if (!userData) {
      return { error: 'Kullanıcı verisi bulunamadı.' };
    }

    // Create a mutable copy of tasks to modify
    const newTasks = [...userData.tasks];
    const taskIndex = newTasks.findIndex(t => t.id === task.id);

    if (taskIndex === -1) {
      return { error: 'Görev bulunamadı.' };
    }

    const isNowCompleted = !newTasks[taskIndex].completed;
    newTasks[taskIndex].completed = isNowCompleted;

    // Create a deep copy of skillData to safely mutate
    const newSkillData = JSON.parse(JSON.stringify(userData.skillData || {}));
    const category = task.category;

    if (category !== 'other') {
      if (!newSkillData[category]) {
        newSkillData[category] = { completedTasks: 0, rankIndex: 0 };
      }
      const skill = newSkillData[category]!;

      if (isNowCompleted) {
        skill.completedTasks += 1;
        if (skill.completedTasks >= TASKS_PER_RANK && skill.rankIndex < 9) {
          skill.rankIndex += 1;
          skill.completedTasks = 0;
        }
      } else {
        if (skill.completedTasks > 0) {
          skill.completedTasks -= 1;
        } else if (skill.rankIndex > 0) {
          // If we need to de-rank
          skill.rankIndex -= 1;
          skill.completedTasks = TASKS_PER_RANK - 1;
        }
      }
    }
    
    // Prepare all updates in a single object
    const updates: Partial<UserData> = {
        tasks: newTasks,
        skillData: newSkillData
    };

    let completionMessage;
    
    if (isNowCompleted) {
        let finalReward = task.reward;
        let canLevelUp = true;
        const messages = [];
        
        const isPenaltyActiveNow = userData.penaltyEndTime && userData.penaltyEndTime > Date.now();
        if (isPenaltyActiveNow) {
            messages.push("Ceza aktif, ödül kazanamazsın.");
        } else {
             if (userData.baseStats.hp <= 0) {
                finalReward = Math.round(task.reward * 0.1);
                messages.push(`HP Sıfır! Altın kazanımı %90 azaldı. (+${finalReward} Altın)`);
            } else {
                messages.push(`+${finalReward} Altın`);
            }
            if (userData.baseStats.mp <= 0) {
                canLevelUp = false;
                messages.push("MP Sıfır! Seviye ilerlemesi durdu.");
            }
             updates.userGold = (userData.userGold || 0) + finalReward;
        }

        if (canLevelUp) {
            let { level, tasksCompletedThisLevel, tasksRequiredForNextLevel, attributePoints } = userData;
            tasksCompletedThisLevel = (tasksCompletedThisLevel || 0) + 1;
            if (tasksCompletedThisLevel >= tasksRequiredForNextLevel) {
                level += 1;
                tasksCompletedThisLevel = 0;
                tasksRequiredForNextLevel = 32 + level;
                attributePoints = (attributePoints || 0) + 1;
                messages.push("Seviye atladın!");
            }
            updates.level = level;
            updates.tier = getTierForLevel(level);
            updates.tasksCompletedThisLevel = tasksCompletedThisLevel;
            updates.tasksRequiredForNextLevel = tasksRequiredForNextLevel;
            updates.attributePoints = attributePoints;
        }
        
        completionMessage = messages.join(' ');
        
    } else {
        // Logic for un-completing a task
        const { tasksCompletedThisLevel = 0, userGold = 0 } = userData;
        if (tasksCompletedThisLevel > 0) {
            updates.tasksCompletedThisLevel = tasksCompletedThisLevel - 1;
        }
        updates.userGold = Math.max(0, userGold - task.reward);
        completionMessage = `Görev geri alındı. İlerlemeniz ve ${task.reward} altın geri alındı.`;
    }

    // Handle task deadline
    if (!newTasks.some(t => !t.completed)) {
        updates.taskDeadline = null;
    }

    // Atomically update the user document with all changes
    await updateUserData(username, updates);

    revalidatePath('/tasks');
    revalidatePath('/profile');
    return { message: completionMessage };

  } catch (error) {
    console.error('Error toggling task:', error);
    return { error: 'Görev durumu güncellenirken bir hata oluştu.' };
  }
}

export async function deleteTaskAction(username: string, taskId: string): Promise<{ error?: string }> {
    try {
        const userData = await getUserData(username);
        if (!userData) {
            return { error: 'Kullanıcı verisi bulunamadı.' };
        }
        const newTasks = userData.tasks.filter(t => t.id !== taskId);
        await updateUserData(username, { tasks: newTasks });
        revalidatePath('/tasks');
        return {};
    } catch (error) {
        console.error('Error deleting task:', error);
        return { error: 'Görev silinirken bir hata oluştu.' };
    }
}

export async function updateTaskDeadlineAction(username: string, tasks: Task[]): Promise<{ error?: string }> {
     try {
        const userData = await getUserData(username);
        if (!userData) {
            return { error: 'Kullanıcı verisi bulunamadı.' };
        }
        
        const hasIncompleteTasks = tasks.some(task => !task.completed);
        const isPenaltyActive = userData.penaltyEndTime && userData.penaltyEndTime > Date.now();
        let taskDeadline = userData.taskDeadline;

        if (hasIncompleteTasks && !taskDeadline && !isPenaltyActive) {
            taskDeadline = Date.now() + 24 * 60 * 60 * 1000;
        }

        await updateUserData(username, { tasks, taskDeadline });
        revalidatePath('/tasks');
        return {};

    } catch (error) {
        console.error('Error updating task list:', error);
        return { error: 'Görev listesi güncellenirken bir hata oluştu.' };
    }
}


'use server';

import { revalidatePath } from 'next/cache';
import { getUserData, updateUserData } from '@/lib/userData';
import type { InventoryItem } from './_components/inventory-dialog';

export async function deleteItemAction(username: string, itemId: string): Promise<{ success: boolean; message: string }> {
  if (!username || !itemId) {
    return { success: false, message: 'Kullanıcı adı veya ürün ID eksik.' };
  }

  try {
    const userData = await getUserData(username);
    if (!userData) {
      return { success: false, message: 'Kullanıcı verisi bulunamadı.' };
    }

    const currentInventory = userData.inventory || [];
    const itemIndex = currentInventory.findIndex((item: InventoryItem) => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, message: 'Silinecek ürün envanterde bulunamadı.' };
    }

    currentInventory[itemIndex].quantity -= 1;

    const updatedInventory = currentInventory.filter((item: InventoryItem) => item.quantity > 0);

    // Pass the entire username to updateUserData
    await updateUserData(username, {
      inventory: updatedInventory,
    });
    
    revalidatePath('/profile'); // Revalidate the profile page to show changes
    return { success: true, message: 'Ürün silindi.' };

  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, message: 'Ürün silinirken bir hata oluştu.' };
  }
}

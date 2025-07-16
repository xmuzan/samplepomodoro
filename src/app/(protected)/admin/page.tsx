
'use client';

import { useState, useEffect } from 'react';
import { FuturisticBorder } from '@/components/futuristic-border';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, UserCheck, Trash2, RefreshCcw } from 'lucide-react';
import { getAllUsers, updateUserStatus, resetUserProgress } from '@/lib/userData';
import { getCurrentUser } from '@/lib/auth';

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setPendingUsers(allUsers.filter((user: User) => user.status === 'pending'));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir sorun oluştu.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUsers();
  }, []);

  const handleActivateUser = async (username: string) => {
    try {
      await updateUserStatus(username, 'active');
      await fetchUsers(); // Refresh the list
      toast({
        title: "Başarılı",
        description: `${username} adlı kullanıcının hesabı aktive edildi.`,
      });
    } catch (error) {
       console.error("Failed to activate user:", error);
       toast({
        title: "Hata",
        description: "Kullanıcı aktive edilirken bir sorun oluştu.",
        variant: "destructive"
      });
    }
  };
  
  const handleResetProgress = async () => {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            toast({
                title: "Hata",
                description: "Mevcut kullanıcı bulunamadı.",
                variant: "destructive"
            });
            return;
        }
        await resetUserProgress(currentUser.username);
        
        window.dispatchEvent(new Event('storage')); // Notify other components to refetch data
        
        toast({
            title: "İlerleme Sıfırlandı",
            description: "Tüm ilerlemeniz başlangıç durumuna getirildi.",
        });
    } catch(error) {
        console.error("Failed to reset progress:", error);
        toast({
            title: "Hata",
            description: "İlerleme sıfırlanırken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  if (!isMounted) {
    return <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64"></main>;
  }

  return (
    <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64">
      <div className="max-w-4xl mx-auto space-y-8">
        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
            <h1 className="flex items-center gap-3 text-2xl font-headline tracking-widest text-primary uppercase text-glow mb-6">
              <UserCheck className="h-7 w-7" />
              Bekleyen Kullanıcılar
            </h1>

            {pendingUsers.length > 0 ? (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.username} className="flex items-center justify-between p-3 bg-muted/20 rounded-md border border-border/20">
                    <span className="font-semibold text-foreground">{user.username}</span>
                    <Button size="sm" onClick={() => handleActivateUser(user.username)}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Aktive Et
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Onay bekleyen kullanıcı yok.</p>
            )}
          </div>
        </FuturisticBorder>

        <FuturisticBorder>
          <div className="bg-background/90 backdrop-blur-sm p-4 md:p-6">
            <h1 className="flex items-center gap-3 text-2xl font-headline tracking-widest text-destructive uppercase text-glow mb-6">
                <Trash2 className="h-7 w-7" />
                Yönetim Araçları
            </h1>
            <div className='space-y-4'>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md border border-border/20">
                    <div>
                        <h3 className='font-bold text-foreground'>Kendi İlerlemeni Sıfırla</h3>
                        <p className='text-sm text-muted-foreground'>Tüm görev, seviye, altın ve istatistik verilerini siler.</p>
                    </div>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Sıfırla
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Tüm ilerlemeniz (seviye, altın, görevler, yetenekler, eşyalar vb.) kalıcı olarak silinecek ve başlangıç durumuna dönecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetProgress}>Evet, Sıfırla</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          </div>
        </FuturisticBorder>

      </div>
    </main>
  );
}

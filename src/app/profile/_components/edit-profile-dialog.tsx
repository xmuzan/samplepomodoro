
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuturisticBorder } from '@/components/futuristic-border';
import { useToast } from '@/hooks/use-toast';

interface EditProfileDialogProps {
  children: React.ReactNode;
  currentUsername: string;
  currentAvatarUrl: string;
  onSave: (newUsername: string, newAvatarUrl: string) => void;
}

export function EditProfileDialog({ children, currentUsername, currentAvatarUrl, onSave }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      toast({
        title: "Error",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    onSave(username.trim(), avatarUrl.trim());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-[425px]">
        <FuturisticBorder>
          <div className='bg-background/90 backdrop-blur-sm p-1'>
            <form onSubmit={handleSubmit}>
              <DialogHeader className="p-6">
                <DialogTitle className="font-headline text-primary">Profili Düzenle</DialogTitle>
                <DialogDescription>
                  Kullanıcı adını ve profil fotoğrafını değiştir.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 pb-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatarUrl" className="text-right">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="col-span-3"
                    placeholder='https://....'
                  />
                </div>
              </div>
              <DialogFooter className="p-6 pt-0">
                <Button type="submit">Değişiklikleri Kaydet</Button>
              </DialogFooter>
            </form>
          </div>
        </FuturisticBorder>
      </DialogContent>
    </Dialog>
  );
}

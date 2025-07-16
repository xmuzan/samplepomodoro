
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
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
import { Upload } from 'lucide-react';

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
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Error",
          description: "File size should not exceed 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarUrl(dataUrl);
        setAvatarPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

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
    // Username cannot be changed after registration in this model
    if (username.trim() !== currentUsername) {
        toast({
            title: "Error",
            description: "Kullanıcı adı değiştirilemez.",
            variant: "destructive",
        });
        setUsername(currentUsername);
        return;
    }
    onSave(username.trim(), avatarUrl);
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Reset state when dialog opens
      setUsername(currentUsername);
      setAvatarUrl(currentAvatarUrl);
      setAvatarPreview(currentAvatarUrl);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                    disabled // Username cannot be changed
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Avatar
                  </Label>
                   <div className="col-span-3 flex items-center gap-4">
                     <Image 
                       src={avatarPreview}
                       alt="Avatar preview"
                       width={40}
                       height={40}
                       className='rounded-full'
                     />
                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                       <Upload className='mr-2 h-4 w-4'/> Yükle
                     </Button>
                     <Input 
                       type="file"
                       ref={fileInputRef}
                       className='hidden'
                       accept="image/png, image/jpeg, image/gif"
                       onChange={handleFileChange}
                     />
                   </div>
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

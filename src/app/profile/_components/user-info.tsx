import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EditProfileDialog } from './edit-profile-dialog';

interface UserInfoProps {
  level: number;
  job: string;
  title: string;
  username: string;
  avatarUrl: string;
  onProfileUpdate: (newUsername: string, newAvatarUrl: string) => void;
}

export function UserInfo({ level, job, title, username, avatarUrl, onProfileUpdate }: UserInfoProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
      <div className="relative group">
        <Image
          src={avatarUrl}
          alt="User Avatar"
          width={100}
          height={100}
          className="rounded-full border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
          data-ai-hint="warrior avatar"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/100x100.png';
          }}
        />
        <EditProfileDialog
            currentUsername={username}
            currentAvatarUrl={avatarUrl}
            onSave={onProfileUpdate}
        >
            <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background/50 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80">
                <Pencil className="h-4 w-4" />
            </Button>
        </EditProfileDialog>

      </div>
      <div className="flex-1">
        <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-3xl font-bold text-glow">{username}</h2>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
            <div className="text-center">
                <p className="text-4xl font-headline font-bold text-primary text-glow">{level}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Level</p>
            </div>
            <div className="text-left">
                <p className="text-md"><span className="font-semibold text-muted-foreground">JOB:</span> {job}</p>
                <p className="text-md"><span className="font-semibold text-muted-foreground">TITLE:</span> {title}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

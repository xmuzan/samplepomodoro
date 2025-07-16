
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EditProfileDialog } from './edit-profile-dialog';
import { cn } from '@/lib/utils';

interface UserInfoProps {
  level: number;
  tier: string;
  job: string;
  title: string;
  username: string;
  avatarUrl: string;
  onProfileUpdate: (newUsername: string, newAvatarUrl: string) => void;
}

const tierColorMap: { [key: string]: string } = {
    'S': 'text-purple-400 border-purple-500/50 shadow-purple-500/50',
    'A': 'text-red-400 border-red-500/50 shadow-red-500/50',
    'B': 'text-blue-400 border-blue-500/50 shadow-blue-500/50',
    'C': 'text-green-400 border-green-500/50 shadow-green-500/50',
    'D': 'text-yellow-400 border-yellow-500/50 shadow-yellow-500/50',
    'E': 'text-gray-400 border-gray-500/50 shadow-gray-500/50',
};

export function UserInfo({ level, tier, job, title, username, avatarUrl, onProfileUpdate }: UserInfoProps) {
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
            <div className="flex items-end gap-2">
              <div className="text-center">
                  <p className="text-4xl font-headline font-bold text-primary text-glow">{level}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">SEVİYE</p>
              </div>
              <div className={cn(
                  "border-2 rounded-md px-2 py-0.5 font-headline font-bold text-2xl mb-1 shadow-[0_0_10px]",
                  tierColorMap[tier] || tierColorMap['E']
              )}>
                  {tier}
              </div>
            </div>
            <div className="text-left">
                <p className="text-md"><span className="font-semibold text-muted-foreground">İŞ:</span> {job}</p>
                <p className="text-md"><span className="font-semibold text-muted-foreground">ÜNVAN:</span> {title}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

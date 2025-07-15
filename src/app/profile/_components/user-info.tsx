import Image from 'next/image';

interface UserInfoProps {
  level: number;
  job: string;
  title: string;
  username: string;
  avatarUrl: string;
}

export function UserInfo({ level, job, title, username, avatarUrl }: UserInfoProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
      <div className="relative">
        <Image 
          src={avatarUrl}
          alt="User Avatar"
          width={100}
          height={100}
          className="rounded-full border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
          data-ai-hint="warrior avatar"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-glow">{username}</h2>
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

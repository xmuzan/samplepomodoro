
'use client';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Wand2, ShieldAlert } from 'lucide-react';
import { suggestTaskAction } from '@/app/tasks/actions';
import { FuturisticBorder } from './futuristic-border';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SKILL_CATEGORIES } from '@/lib/skills';
import type { SkillCategory } from '@/lib/skills';

interface CreateTaskDialogProps {
    onAddTask: (taskText: string, difficulty: 'easy' | 'hard', category: SkillCategory) => void;
}

const skillOptions = Object.entries(SKILL_CATEGORIES).map(([key, value]) => ({
    value: key as SkillCategory,
    label: value.label,
}));

export function CreateTaskDialog({ onAddTask }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'hard' | null>(null);
    const [category, setCategory] = useState<SkillCategory | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSuggest = () => {
        startTransition(async () => {
            const result = await suggestTaskAction();
            if (result.success && result.taskName) {
                setTaskName(result.taskName);
            } else {
                toast({
                    title: 'AI Suggestion Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (taskName.trim() === '') {
            toast({ title: 'Error', description: 'Task name cannot be empty.', variant: 'destructive' });
            return;
        }
        if (!difficulty) {
            toast({ title: 'Error', description: 'Please select a task difficulty.', variant: 'destructive' });
            return;
        }
        if (!category) {
            toast({ title: 'Error', description: 'Please select a task category.', variant: 'destructive' });
            return;
        }
        onAddTask(taskName.trim(), difficulty, category);
        setTaskName('');
        setDifficulty(null);
        setCategory(null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Görev Oluştur</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-[425px]">
                <FuturisticBorder>
                  <div className='bg-background/90 backdrop-blur-sm p-1'>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-6">
                            <DialogTitle className="font-headline text-primary">Yeni Görev Ekle</DialogTitle>
                            <DialogDescription>
                                Yeni bir görev ekleyerek seviye atlamaya devam et.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 px-6 pb-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">
                                    Görev Adı
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        value={taskName}
                                        onChange={(e) => setTaskName(e.target.value)}
                                        placeholder="Örn: 10km koşu yap"
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={handleSuggest} disabled={isPending} aria-label="Suggest task with AI">
                                        <Wand2 className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Kategori</Label>
                                <Select onValueChange={(value: SkillCategory) => setCategory(value)} value={category ?? undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bir kategori seçin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {skillOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                             <div className="flex flex-col gap-2">
                                <Label>Zorluk</Label>
                                <RadioGroup 
                                    onValueChange={(value: 'easy' | 'hard') => setDifficulty(value)} 
                                    className="flex gap-4"
                                    value={difficulty ?? undefined}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="easy" id="r1" />
                                        <Label htmlFor="r1">Kolay (50 Altın)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="hard" id="r2" />
                                        <Label htmlFor="r2">Zor (200 Altın)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                             <Alert variant="destructive" className="border-amber-500/50 text-amber-200 [&>svg]:text-amber-400">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertDescription>
                                   Lütfen görev zorluğunu seçerken kendine karşı dürüst ol. Bu sistem senin gelişimini takip etmek için var.
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter className="p-6 pt-0">
                            <Button type="submit">Kaydet</Button>
                        </DialogFooter>
                    </form>
                  </div>
                </FuturisticBorder>
            </DialogContent>
        </Dialog>
    );
}

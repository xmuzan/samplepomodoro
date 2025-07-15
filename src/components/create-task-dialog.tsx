
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Wand2 } from 'lucide-react';
import { suggestTaskAction } from '@/app/tasks/actions';

interface CreateTaskDialogProps {
    onAddTask: (taskText: string) => void;
}

export function CreateTaskDialog({ onAddTask }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [taskName, setTaskName] = useState('');
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
            toast({
                title: 'Error',
                description: 'Task name cannot be empty.',
                variant: 'destructive',
            });
            return;
        }
        onAddTask(taskName.trim());
        setTaskName('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Görev Oluştur</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-primary/50 shadow-[0_0_25px_hsl(var(--primary)/0.4)]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-primary">Yeni Görev Ekle</DialogTitle>
                        <DialogDescription>
                            Yeni bir görev ekleyerek seviye atlamaya devam et.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                    </div>
                    <DialogFooter>
                        <Button type="submit">Kaydet</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

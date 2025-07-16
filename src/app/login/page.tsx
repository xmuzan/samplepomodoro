
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { login, register } from '@/lib/auth';

export default function LoginPage() {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);

    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const result = login(loginUsername, loginPassword);
        if (result.success) {
            window.dispatchEvent(new Event('storage')); // Notify layout to update
            router.push('/tasks');
        } else {
            toast({
                variant: 'destructive',
                title: 'Giriş Başarısız',
                description: result.message,
            });
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const result = register(registerUsername, registerPassword);
        if (result.success) {
            setRegistrationMessage(result.message);
            setRegisterUsername('');
            setRegisterPassword('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Kayıt Başarısız',
                description: result.message,
            });
        }
    };

    return (
        <div className="relative min-h-screen w-full">
             <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-20"
            >
                <source src="/sung.mp4" type="video/mp4" />
            </video>
            <div className="relative flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <Bot className="h-16 w-16 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                        <h1 className="mt-2 text-3xl font-headline text-primary text-glow">Sistem</h1>
                        <p className="text-muted-foreground">Seviye atlamak için giriş yap veya kayıt ol.</p>
                    </div>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <div className="rounded-lg border border-border/30 bg-background/50 p-6 backdrop-blur-md">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-username">Kullanıcı Adı</Label>
                                        <Input
                                            id="login-username"
                                            type="text"
                                            placeholder="fatihbey"
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Şifre</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Giriş Yap
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>
                        <TabsContent value="register">
                            <div className="rounded-lg border border-border/30 bg-background/50 p-6 backdrop-blur-md">
                                {registrationMessage ? (
                                    <Alert className="border-primary/50 text-primary-foreground [&>svg]:text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                        <AlertTitle>Kayıt Başarılı!</AlertTitle>
                                        <AlertDescription>
                                            {registrationMessage}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="register-username">Kullanıcı Adı</Label>
                                            <Input
                                                id="register-username"
                                                type="text"
                                                placeholder="Yeni kullanıcı adınız"
                                                value={registerUsername}
                                                onChange={(e) => setRegisterUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-password">Şifre</Label>
                                            <Input
                                                id="register-password"
                                                type="password"
                                                value={registerPassword}
                                                onChange={(e) => setRegisterPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Kayıt Ol
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

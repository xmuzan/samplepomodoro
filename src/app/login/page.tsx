
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
import { login } from '@/lib/auth';
import { registerUserAction, loginUserAction } from './actions';

export default function LoginPage() {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const result = await loginUserAction({ username: loginUsername, password: loginPassword });
            if (result.success && result.user) {
                 if (result.user.status === 'pending') {
                    toast({
                        variant: 'destructive',
                        title: 'Onay Bekleniyor',
                        description: 'Hesabınız henüz yönetici tarafından onaylanmadı.',
                    });
                } else {
                    login(result.user); // Save user to local storage
                    window.dispatchEvent(new Event('storage'));
                    router.push('/tasks');
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Giriş Başarısız',
                    description: result.message,
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Giriş sırasında bilinmeyen bir hata oluştu.';
            toast({
                variant: 'destructive',
                title: 'Giriş Hatası',
                description: errorMessage,
            });
        }
        setIsLoggingIn(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setRegistrationMessage(null);
        try {
            const result = await registerUserAction({ username: registerUsername, password: registerPassword });
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
        } catch (error) {
             console.error("Registration error:", error);
             const errorMessage = error instanceof Error ? error.message : 'Kayıt sırasında beklenmedik bir hata oluştu.';
             toast({
                variant: 'destructive',
                title: 'Kayıt Başarısız',
                description: errorMessage,
            });
        }
        setIsRegistering(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
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
                                        disabled={isLoggingIn}
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
                                        disabled={isLoggingIn}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                                    {isLoggingIn ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
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
                                            disabled={isRegistering}
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
                                            disabled={isRegistering}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isRegistering}>
                                        {isRegistering ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

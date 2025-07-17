'use client';

import { useState } from 'react';
import { useRouter }s from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { getTitleForLevel } from '@/lib/titles';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                username: username,
                level: 1,
                xp: 0,
                xpToNextLevel: 100,
                gold: 0,
                gems: 0,
                status: "active",
                title: getTitleForLevel(1).title,
                job: getTitleForLevel(1).job,
                baseStats: { str: 5, dex: 5, int: 5, agi: 5, luk: 5 },
                inventory: [],
                equipment: {},
                skills: {},
                achievements: [],
                createdAt: new Date(),
            });

            setSuccessMessage('Registration successful! You can now log in.');
        } catch (error) {
            console.error("Error signing up: ", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard'); // Redirect to a protected page after login
        } catch (error) {
            console.error("Error signing in: ", error);
            setError("Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-75">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Welcome to LevelUp Life</h1>
                    <p className="text-gray-400">Your journey to a better you starts here.</p>
                </div>
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                {successMessage && <Alert><AlertTitle>Success</AlertTitle><AlertDescription>{successMessage}</AlertDescription></Alert>}
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="relative">
                                <Label htmlFor="login-password">Password</Label>
                                <Input 
                                  id="login-password" 
                                  type={showPassword ? "text" : "password"}
                                  value={password} 
                                  onChange={(e) => setPassword(e.target.value)} 
                                  required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-6"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="register">
                         <form onSubmit={handleSignUp} className="space-y-4">
                             <div>
                                <Label htmlFor="register-username">Username</Label>
                                <Input id="register-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="relative">
                                <Label htmlFor="register-password">Password</Label>
                                <Input 
                                  id="register-password"
                                  type={showPassword ? "text" : "password"}
                                  value={password} 
                                  onChange={(e) => setPassword(e.target.value)} 
                                  required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-6"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                         </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

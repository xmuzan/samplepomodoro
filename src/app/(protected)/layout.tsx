
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/navbar';
import type { User } from '@/types';

// Middleware handles the redirection now. 
// This layout assumes a valid user is present.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('currentUser');
    
    // Although middleware is the primary guard, an extra check here is good practice.
    if (!sessionCookie?.value) {
        redirect('/login');
    }
    
    let user: User | null = null;
    try {
        const session = JSON.parse(sessionCookie.value);
        if (session.expiry && session.expiry > Date.now()) {
            user = session.user;
        }
    } catch (e) {
        user = null;
    }

    if (!user) {
        redirect('/login');
    }

    if (user.status === 'pending') {
      return (
        <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
            <Navbar />
            <main className="flex-1 p-4 pb-24 md:ml-20 md:pb-4 lg:ml-64 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary">Hesabınız Onay Bekliyor</h1>
                    <p className="text-muted-foreground mt-2">Yönetici onayından sonra tüm özelliklere erişebileceksiniz.</p>
                </div>
            </main>
        </div>
      );
    }
  
    return (
        <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
            <Navbar />
            {children}
        </div>
    );
}

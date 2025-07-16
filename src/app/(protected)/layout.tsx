
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/navbar';
import type { User } from '@/types';
import LoginPage from './login/page'; // We will render the login page directly

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('currentUser');
  
  let user: User | null = null;

  if (sessionCookie?.value) {
      try {
          const session = JSON.parse(sessionCookie.value);
          if (session.expiry > Date.now()) {
              user = session.user;
          }
      } catch (e) {
          console.error("Failed to parse session cookie:", e);
      }
  }

  // If there is a user, proceed as normal
  if (user) {
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
    
    // User is logged in and active, show the app with navbar.
    return (
      <div className="flex min-h-screen flex-col bg-transparent text-foreground md:flex-row">
          <Navbar />
          {children}
      </div>
    );
  }
  
  // If there is NO user, show the login page content WITHOUT the navbar.
  return <LoginPage />;
}

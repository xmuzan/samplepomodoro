
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('currentUser');

    if (sessionCookie) {
        redirect('/tasks');
    } else {
        redirect('/login');
    }
    
    // This return is technically unreachable but required by Next.js
    return null;
}

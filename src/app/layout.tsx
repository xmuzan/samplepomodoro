import type { Metadata } from 'next';
import './tasks.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Sistem',
  description: 'A Solo Leveling inspired life RPG to level up your skills.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed left-0 top-0 -z-10 h-full w-full object-cover opacity-30"
        >
          <source src="/sung.mp4" type="video/mp4" />
        </video>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "LevelUp Navigator",
  description: "Gamify your life, level up your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

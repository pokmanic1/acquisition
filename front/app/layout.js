import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face' });

export const metadata = {
  title: 'Acquisitions — User Management API',
  description: 'Frontend for the Acquisitions Express API: JWT auth, role-based access and user management.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-hair bg-paper">
            <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-mute">
              <span>Acquisitions API · Express 5 · PostgreSQL · Docker</span>
              <span>Built with Next.js & Tailwind CSS</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

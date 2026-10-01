import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'EnvGuard — Environment Variable Tracker & Drift Guard',
  description:
    'Self-hostable environment variable change tracker for teams. Detect added, updated, and removed variables, store masked audit logs, and regenerate .env.example stubs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#121318] text-[#e3e1e9] antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

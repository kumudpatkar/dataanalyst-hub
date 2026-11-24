
import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'DataAnalyst Hub | Your Analytics Reference Library',
  description:
    'Search Excel formulas, Python functions, SQL queries, Power BI DAX, statistics and data analytics concepts.',
  applicationName: 'DataAnalyst Hub',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'DA Hub',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1220',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}

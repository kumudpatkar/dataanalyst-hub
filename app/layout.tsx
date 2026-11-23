import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DataAnalyst Hub | Your Analytics Reference Library', description: 'Search Excel formulas, Python functions, SQL queries, Power BI DAX, statistics and data analytics concepts.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FameWars - Social Media Platform',
  description:
    'Where fame is the ultimate currency. Compete, create, and conquer the social arena.',
  keywords: ['social media', 'fame', 'battles', 'creator', 'community'],
  openGraph: {
    title: 'FameWars - Social Media Platform',
    description:
      'Where fame is the ultimate currency. Compete, create, and conquer the social arena.',
    type: 'website',
    siteName: 'FameWars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FameWars - Social Media Platform',
    description:
      'Where fame is the ultimate currency. Compete, create, and conquer the social arena.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

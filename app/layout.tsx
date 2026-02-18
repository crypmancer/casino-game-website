import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Casino',
  description: 'Casino',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/main.css" />
        <link rel="stylesheet" href="/css/dark.css" />
        <link rel="stylesheet" href="/css/ripple.css" />
        <link rel="stylesheet" href="/css/override.css" />
        <link rel="icon" sizes="64x64" href="/images/favicon.png" />
        <link rel="apple-touch-icon" sizes="64x64" href="/images/favicon.png" />
      </head>
      <body className="theme--dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

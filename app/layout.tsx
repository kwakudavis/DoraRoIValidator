import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DORA RoI Validator',
  description: 'Validate DORA Register of Information submissions before reporting.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

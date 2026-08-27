import type {Metadata, Viewport} from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'ZeroCaff - Wolność od Kofeiny',
  description: 'Aplikacja do walki z uzależnieniem od kofeiny z potrójnym pierścieniem czasu, analizą nawyków i kamieniami milowymi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ZeroCaff',
  },
  icons: {
    icon: [
      { url: '/icon-192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/icon-512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/apple-touch-icon.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  openGraph: {
    title: 'ZeroCaff - Wolność od Kofeiny',
    description: 'Aplikacja do walki z uzależnieniem od kofeiny z potrójnym pierścieniem czasu, analizą nawyków i kamieniami milowymi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeroCaff - Wolność od Kofeiny',
    description: 'Aplikacja do walki z uzależnieniem od kofeiny.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZeroCaff" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

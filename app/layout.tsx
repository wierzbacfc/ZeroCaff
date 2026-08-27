import type {Metadata, Viewport} from 'next';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ZeroCaff',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: `${basePath}/icon-192.jpg`, sizes: '192x192', type: 'image/jpeg' },
      { url: `${basePath}/icon-512.jpg`, sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: `${basePath}/apple-touch-icon.jpg`, sizes: '180x180', type: 'image/jpeg' },
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
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

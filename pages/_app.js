import '../src/index.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { ToastProvider } from '../src/ui/toast';
import Toasts from '../components/Toasts';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Avoid dev reload/404 issues caused by SW caching Next chunks.
    if (process.env.NODE_ENV !== 'production') return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return (
    <ToastProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes" />
        <meta name="description" content="Premium Gym Management System - IRON TEMPLE" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IRON TEMPLE" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="IRON TEMPLE" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><defs><linearGradient id='g'><stop offset='0%' style='stop-color:%23111827'/><stop offset='100%' style='stop-color:%23d4af37'/></linearGradient></defs><rect width='180' height='180' fill='url(%23g)' rx='30'/><text x='90' y='90' font-size='72' font-weight='bold' text-anchor='middle' dominant-baseline='central' fill='white' font-family='Arial'>IT</text></svg>" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23111827'/><text x='50' y='50' font-size='50' font-weight='bold' text-anchor='middle' dominant-baseline='central' fill='%23d4af37'>IT</text></svg>" type="image/svg+xml" />
      </Head>
      <Toasts />
      <Component {...pageProps} />
    </ToastProvider>
  );
}

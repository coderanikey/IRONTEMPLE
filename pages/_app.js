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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IRON TEMPLE" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </Head>
      <Toasts />
      <Component {...pageProps} />
    </ToastProvider>
  );
}

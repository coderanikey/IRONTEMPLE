import '../src/index.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { ToastProvider } from '../src/ui/toast';
import Toasts from '../components/Toasts';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // IMPORTANT: Never use the service worker in dev. It breaks Next.js HMR and can cause infinite reload loops.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => (k.startsWith('gym-v') ? caches.delete(k) : null))).catch(() => {});
      }
      return;
    }

    let updateTimer = null;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        updateTimer = window.setInterval(() => registration.update().catch(() => {}), 60_000);
      } catch {
        // ignore
      }
    })();

    return () => {
      if (updateTimer) window.clearInterval(updateTimer);
    };
  }, []);

  return (
    <ToastProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes, maximum-scale=5" />
        <meta name="description" content="Premium Gym Management System - IRON TEMPLE" />
        <meta name="theme-color" content="#111827" />
        <meta name="color-scheme" content="dark light" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IRON TEMPLE" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="IRON TEMPLE" />
        <meta name="msapplication-TileColor" content="#111827" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/Logo_gym.png" />
        <link rel="icon" href="/Logo_gym.png" type="image/png" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" as="style" />
      </Head>
      <Toasts />
      <Component {...pageProps} />
    </ToastProvider>
  );
}

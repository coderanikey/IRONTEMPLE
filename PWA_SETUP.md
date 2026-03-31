# PWA Setup Guide - IRON TEMPLE Gym Management System

## Progressive Web Application Features Implemented

### 1. Service Worker (`/public/sw.js`)
- **Caching Strategies**: 
  - Network First for API requests
  - Cache First for static assets
  - Navigation strategy for pages
- **Offline Support**: Full offline functionality with fallback pages
- **Cache Management**: Automatic cache cleanup and versioning
- **Background Sync**: Ready for background sync capabilities

### 2. Web App Manifest (`/public/manifest.json`)
- Defines app metadata and appearance
- PWA icons (192x192 and 512x512)
- App shortcuts for quick actions
- Display mode: Standalone (looks like native app)
- Dark theme with gradient colors

### 3. App Registration (`/pages/_app.js`)
- Enhanced service worker registration
- Update detection and notifications
- App lifecycle management
- Device capability detection

### 4. Meta Tags (`/pages/_document.js` & `/pages/_app.js`)
- PWA installation support
- Apple iOS support
- Windows/Android support
- Viewport optimization
- Theme color configuration

### 5. Responsive Design (`/src/index.css`)
- **Mobile (< 480px)**: Full mobile optimization
- **Tablet (641px - 1024px)**: Tablet-specific layout
- **Desktop (> 1025px)**: Full desktop experience
- **Touch Targets**: 44x44px minimum for mobile
- **Orientation Support**: Landscape and portrait handling
- **Accessibility**: Reduced motion support

## Installation & Testing

### For Production
```bash
npm run build
npm run start
```

Then visit `http://localhost:3000`

### For Development
```bash
npm run dev
```

**Note**: Service Worker only registers in production. In development, you can:
1. Build the app: `npm run build`
2. Start production server: `npm run start`
3. Open DevTools → Application → Service Workers to verify

## Install as PWA

### On Desktop (Chrome/Edge/Firefox)
1. Visit the app URL
2. Click the install icon in the address bar
3. Click "Install"
4. App opens in standalone mode

### On iOS
1. Open Safari
2. Visit the app URL
3. Tap Share → Add to Home Screen
4. App runs as standalone

### On Android
1. Open Chrome
2. Visit the app URL
3. Tap Menu (⋮) → Install app
4. Or tap install banner if shown
5. App runs as standalone

## Features Available Offline

The app remains functional offline with cached:
- ✅ UI Components
- ✅ Navigation
- ✅ Styles and fonts
- ✅ Icons and images
- ✅ Cached API responses

When offline:
- Local storage persists data
- API calls are cached on first load
- Offline fallback page shown if resource unavailable

## Responsive Breakpoints

| Device | Width | Features |
|--------|-------|----------|
| Mobile | < 480px | Single column, stacked buttons, touch-optimized |
| Small Tablet | 480px - 640px | 2-column grids, optimized spacing |
| Tablet | 641px - 1024px | Full tablet layout, 2-column forms |
| Desktop | > 1025px | Full multi-column, desktop optimizations |

## CSS Features

- **Fluid Typography**: Font sizes scale with viewport (`clamp()`)
- **Responsive Grids**: Auto-fit layouts that adapt
- **Touch Support**: 44x44px minimum buttons on touch devices
- **Dark Theme**: Built-in dark mode support
- **High DPI**: Optimized for retina displays
- **Accessibility**: Motion preferences respected

## Browser Support

| Browser | Support | PWA |
|---------|---------|-----|
| Chrome/Chromium | ✅ Full | ✅ Yes |
| Firefox | ✅ Full | ✅ Yes (partial) |
| Safari | ✅ Full | ✅ Yes (iOS 15+) |
| Edge | ✅ Full | ✅ Yes |
| Samsung Internet | ✅ Full | ✅ Yes |

## Performance Optimizations

- 📦 Cached assets reduce load time
- 🚀 Service Worker enables instant loading
- 🔄 Lazy font loading with preconnect
- 📱 Mobile-first responsive design
- 🎯 Minified production builds
- 🔒 No source maps in production

## Tips for Best Experience

1. **First Load**: Might take a moment to cache assets
2. **Updates**: Clear browser cache to test new versions
3. **Offline**: Try going offline (DevTools → Network → Offline)
4. **Mobile**: Test on actual devices for best experience
5. **PWA Install**: Install app for home screen icon and standalone mode

## Troubleshooting

### Service Worker not registering?
- Check browser supports Service Workers
- Verify app is served over HTTPS (or localhost)
- Check console for errors

### App not caching?
- Clear all caches and reload
- Check DevTools → Application → Cache Storage
- Verify service worker file exists at `/public/sw.js`

### Offline page not showing?
- Service Worker must be fully registered
- Network tab must be set to "Offline"
- Cached pages will load, others show offline fallback

## Configuration Files

- **`next.config.js`**: Next.js build optimization
- **`public/manifest.json`**: PWA metadata
- **`public/sw.js`**: Service Worker logic
- **`pages/_app.js`**: App-level PWA registration
- **`pages/_document.js`**: HTML document setup
- **`src/index.css`**: Responsive design & styles

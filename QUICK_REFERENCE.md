# IRON TEMPLE Gym - PWA Quick Reference

## 🎯 What Was Done

### 1. Progressive Web App (PWA) ✅
- Service Worker for offline support and caching
- Web App Manifest for installation
- Works on mobile, tablet, and desktop
- Install as native app on home screen

### 2. Responsive Design ✅
- Mobile-first responsive CSS
- Mobile: < 480px (1 column, full width)
- Tablet: 641px - 1024px (2 columns)
- Desktop: > 1025px (full layout)
- Landscape orientation support
- Touch-friendly buttons (44x44px minimum)

### 3. Professional Branding ✅
- Logo on navbar (every authenticated page)
- Logo on home/login page
- Logo as favicon (browser tab)
- Logo as PWA install icon
- Consistent gold & black color scheme

## 🚀 How to Run

```bash
# Development (Service Worker disabled)
npm run dev

# Production (Service Worker active) 
npm run build
npm run start

# Visit: http://localhost:3000
```

## 📱 Install as App

### Desktop
1. Visit http://localhost:3000
2. Click install icon in address bar
3. App opens in standalone window with logo

### Mobile (iOS)
1. Open Safari, visit the app
2. Tap Share → Add to Home Screen
3. App appears as home screen icon

### Mobile (Android)
1. Open Chrome, visit the app
2. Tap Menu → Install app
3. App appears as home screen icon

## 📂 Key Files

```
public/
  ├── logo.svg           ← Main logo (update with real image)
  ├── manifest.json      ← PWA metadata
  └── sw.js              ← Service Worker (caching logic)

pages/
  ├── _app.js            ← PWA registration & meta tags
  ├── _document.js       ← HTML setup
  └── ...

components/
  ├── TopBar.jsx         ← Logo + navbar on all pages
  └── LoginPage.jsx      ← Logo on home page

src/
  └── index.css          ← Responsive design & styles

next.config.js           ← Build optimization
```

## 🎨 Customize Logo

### Update the Logo SVG
Replace `/public/logo.svg` with your logo. To use the image you provided:

**Option 1: Use ImageMagick**
```bash
# Convert PNG to SVG (requires Potrace)
potrace logo.png -s -o logo.svg
```

**Option 2: Online Converter**
- Go to convertimage.com or cloudconvert.com
- Upload your PNG image
- Convert to SVG format
- Download and replace `/public/logo.svg`

**Option 3: Use Your PNG Directly**
If you want to use PNG instead of SVG:
1. Save your image as `public/logo.png`
2. Update references in:
   - `public/manifest.json` (change SVG to PNG)
   - `pages/_app.js` (change icon reference)
   - `pages/_document.js` (change favicon)
   - `components/TopBar.jsx` (change img src)

## 🔧 Customization

### Change Navbar Color
Edit `src/index.css`, find `.topbar` and change:
```css
.topbar {
  background: rgba(255, 255, 255, 0.7); /* Change this */
  ...
}
```

### Change Logo Size
Edit `components/TopBar.jsx`:
```jsx
<img src="/logo.svg" alt="IRON TEMPLE" 
     style={{ width: '50px', height: '50px' }} /> {/* Change size */}
```

### Change Navbar Badge Text
Edit `components/TopBar.jsx`:
```jsx
<div className="topbar-badge">YOUR TEXT HERE</div>
```

### Change Colors
Edit `src/index.css`, search for `:root`:
```css
:root {
  --primary: #111827;      /* Dark color */
  --accent: #d4af37;       /* Gold color */
  /* ...change other colors */
}
```

## ✨ Features

### Online Experience
- Full member management
- Payment tracking
- Real-time data sync
- API calls to backend
- Live notifications

### Offline Experience
- View cached pages
- Navigate app
- Access local storage data
- Cached payment/member info
- Auto-sync when online

## 📊 Build Sizes

- First Load JS: ~86 kB
- Shared Code: ~87 kB (cached after first load)
- Service Worker: Loaded only in production
- Total app: Fully functional offline

## 🐛 Debug

### Check Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Service Workers section
4. Should show "Active and Running"

### Check Caching
1. DevTools → Application tab
2. Cache Storage section
3. See `gym-v1-static`, `gym-v1-dynamic`, etc.

### Test Offline
1. DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Refresh page
4. Should still work with cached content

## 🎯 Next Steps

1. **Replace Logo**: Update `public/logo.svg` with your actual Iron Temple logo
2. **Test on Devices**: Install app on real phones/tablets
3. **Customize Colors**: Match your gym's branding colors
4. **Add More Pages**: Create more features (classes, trainers, etc.)
5. **Backend Integration**: Connect to your database
6. **Deploy**: Upload to production server (Vercel, AWS, etc.)

## 📞 Support

For issues:
1. Check browser console for errors (F12)
2. Look at DevTools Application tab
3. Check Service Worker registration
4. Verify all logo files exist in `public/` folder
5. Clear cache and rebuild if needed: `npm run build`

## 🎉 You're All Set!

Your IRON TEMPLE Gym Management System is:
- ✅ Progressive Web App ready
- ✅ Fully responsive
- ✅ Branded with logo
- ✅ Works offline
- ✅ Installable on home screen
- ✅ Production optimized

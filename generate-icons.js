// Simple Node.js script to generate placeholder icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#111827;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="160" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial, sans-serif">IT</text>
</svg>`;

// Write SVG (this is just for reference)
fs.writeFileSync(path.join(__dirname, 'public', 'icon.svg'), iconSvg);

console.log('Icon SVG created at public/icon.svg');
console.log('Note: For production PWA, you should generate proper PNG icons:');
console.log('- 192x192 pixels for icon-192.png');
console.log('- 512x512 pixels for icon-512.png');
console.log('You can use tools like:');
console.log('- https://www.favicon-generator.org/');
console.log('- https://www.canva.com/ (create a 512x512 design and export as PNG)');
console.log('- Or use image processing tools like ImageMagick or Pillow');

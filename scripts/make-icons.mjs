import fs from 'fs';

const lightPng = fs.readFileSync('public/images/logo/inveins-logo-light.png');
const base64 = `data:image/png;base64,${lightPng.toString('base64')}`;

// Create square 512x512 SVG with deep luxury black background and centered logo
const squareSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0c0c0b"/>
  <rect width="504" height="504" x="4" y="4" rx="96" fill="none" stroke="#262624" stroke-width="4"/>
  <image href="${base64}" x="36" y="167" width="440" height="178"/>
</svg>
`;

fs.writeFileSync('public/icon.svg', squareSvg);
fs.writeFileSync('public/favicon.svg', squareSvg);
console.log('Successfully generated public/icon.svg and public/favicon.svg');

# Zara Assistant

A deploy-ready AI assistant web application built with Next.js, TypeScript, Tailwind CSS, and modern React tools.

## Overview

This project serves as a foundation for an AI assistant UI with voice interaction, OCR support, and mobile-ready deployment.

## Key Features

- **React + Next.js 16** with App Router
- **TypeScript** for faster development and safer code
- **Tailwind CSS 4** for responsive styling
- **PWA support** with service worker and manifest
- **GitHub Pages deployment** ready
- **Android packaging support** via Capacitor
- **Speech recognition** and **text-to-speech** integration
- **OCR support** using Tesseract.js

## Requirements

- Node.js 18+ or later
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Build

```bash
npm run build:static
```

This command builds the project for static export.

## GitHub Pages Deployment

1. Build the static site:

```bash
npm run build:static
```

2. Deploy to GitHub Pages:

```bash
npm run deploy:gh-pages
```

3. If your repository is hosted under a path like `https://<username>.github.io/<repo-name>`, deploy with:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo-name> npm run deploy:gh-pages
```

## Android / Mobile Packaging

This project is PWA-ready and can be packaged as an Android app using Capacitor.

1. Build the static app:

```bash
npm run build:static
```

2. Copy assets to Capacitor:

```bash
npm run cap:copy
```

3. Add Android support:

```bash
npm run cap:add:android
```

4. Open Android Studio:

```bash
npm run cap:open:android
```

5. Rebuild after web updates:

```bash
npm run android:build
```

## Project Structure

```text
src/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable UI components
│   └── ui/              # Design system components
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions and helpers
```

## Notes

- This repository is configured as a static site. Dynamic API routes are not included in the static build.
- Voice and OCR features depend on browser/device support.
- For full Android native features, install Capacitor plugins after packaging.

## Deployment Status

- The project is already pushed to GitHub and deployed via GitHub Pages.
- The public URL should be available once GitHub completes the Pages deployment.

## Contact

For support or customization, open an issue on the repository or update the project files directly.

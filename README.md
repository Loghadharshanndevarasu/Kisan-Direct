# KisanDirect - Pure Loose Farm Produce Marketplace 🌱🚛

A direct farm-to-consumer unbranded loose produce marketplace platform built with React 19, TypeScript, Tailwind CSS, Express, and Vite.

---

## 🌟 Key Features

1. **Direct Farm-to-Consumer Loose Produce**
   - Direct sourcing from verified local farmers eliminating middleman markups.
   - Sourced freshly from regional warehouse hubs (Nashik Central Hub, Pune Grain & Vegetable Terminal, etc.).

2. **Live Google Map Address Picker (GPS Pinpoint)**
   - Interactive live map integration to pinpoint exact doorstep delivery addresses.
   - Automatic geocoding, locality lookup, and dynamic distance calculation (km) directly from the selected hub.

3. **Real-Time Delivery Route Tracking**
   - Live simulated EV delivery truck tracker with animated map markers, status milestones, and dynamic ETA updates.
   - Fixed dispatch behavior: cancelling an order immediately transitions to a calm cancelled state without blinking badges.

4. **3-Minute Doorstep Quality Inspection Guarantee**
   - When the delivery arrives, a **3-minute countdown timer (`03:00`)** starts.
   - Delivery partner waits at the doorstep while the customer performs a 3-step checklist (Produce Variety Verification, Moisture & Pest Check, Digital Scale Weight Verification).
   - Instant doorstep return flow: upload photo proof of defect or weight mismatch and hand back the package with zero payment required or instant 100% refund.

5. **Mobile Application (PWA) & Notifications**
   - Progressive Web App (PWA) enabled with `manifest.webmanifest`, service worker caching, and install prompts.
   - Installable on Android (via Chrome / APK builder) and iOS (Safari Add to Home Screen).
   - In-app and browser notifications for dispatch, out-for-delivery, and doorstep arrival.

6. **Farmer Provenance Transparency & Tax Reporting**
   - Batch traceability, soil test scorecards, and farm origin maps.
   - Automated GST and APMC Mandi cess compliance calculation with CSV export.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# Install dependencies
npm install

# Start the development server (runs Vite + Express backend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 🔗 Syncing with GitHub

To push this project to your GitHub account:

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Choose a repository name (e.g., `kisandirect-agri-marketplace`).
   - Keep it **public** or **private** (do not initialize with README or .gitignore since they are already provided here).

2. **Link and push from your terminal:**
   ```bash
   # Add your GitHub remote repository
   git remote add origin https://github.com/<your-username>/kisandirect-agri-marketplace.git

   # Set default branch to main
   git branch -M main

   # Push the code to GitHub
   git push -u origin main
   ```

*(If using a Personal Access Token / PAT or SSH keys, use your standard GitHub authentication).*

---

## 🌐 Deployed URLs
- **App Preview:** Live on Google Cloud Run through Google AI Studio

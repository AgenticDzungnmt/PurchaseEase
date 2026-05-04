# PurchaseEase

![PurchaseEase Logo](https://img.shields.io/badge/PurchaseEase-v1.0.0-0078D4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOSAzSDVjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnptLTUgMTRIN3YtMmg3djJ6bTMtNEg3di0yaDEwdjJ6bTAtNEg3VjdoMTB2MnoiLz48L3N2Zz4=)

> **Mobile purchase order management app with demo data mode**

## Features

- 📋 **Create & Manage Purchase Orders** — step-by-step form with vendor selection and line items
- 🔍 **Order Tracking** — filter by status (Draft, Open, In Review, Received) with search
- 📄 **Posted Invoices** — view all posted purchase invoices with detail view
- 🤖 **Document Scan (Coming Soon)** — AI-powered invoice scanning via Azure Document Intelligence
- 📊 **Dashboard** — summary cards and recent orders at a glance
- ⚙️ **Settings & Profile** — demo mode controls and app configuration
- 🔐 **Demo Login** — pre-configured credentials, no server needed

## Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Framework | React Native 0.80+ with TypeScript |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| HTTP Client | axios |
| Local Storage | @react-native-async-storage/async-storage |
| Date Picker | @react-native-community/datetimepicker |
| Icons | react-native-vector-icons (MaterialCommunityIcons) |
| Gestures | react-native-gesture-handler + react-native-reanimated |
| Data Layer | Local mock service (no real API) |

### Architecture Overview

```
src/
├── config/           # App configuration (appConfig.ts — gitignored)
├── services/         # API service layer
│   ├── mockData.ts   # Static seed data
│   └── bcApi.ts      # Service methods (returns mock data)
├── types/            # TypeScript interfaces
├── navigation/       # Navigator setup
├── screens/          # Screen components
└── components/       # Reusable UI components
```

---

## Demo Mode Guide

PurchaseEase ships with a **fully self-contained demo mode**. No server, no API keys, no network connection required.

### How the Mock Data Layer Works

All service calls go through `src/services/bcApi.ts`. In demo mode every method resolves from `src/services/mockData.ts` with a simulated async delay (300–600 ms) to mimic real API latency.

```ts
// src/services/bcApi.ts (simplified)
import { mockVendors } from './mockData';

export async function getVendors() {
  await delay(); // 300–600ms
  return mockVendors;
}
```

In-memory state is maintained for the session so creates, updates, and deletes persist until the app is restarted.

### How to Add or Modify Demo Data

Open `src/services/mockData.ts` and edit the exported arrays:

```ts
// Add a vendor
export const mockVendors: Vendor[] = [
  {
    id: 'v-new',
    number: 'V009',
    displayName: 'New Supplier Co.',
    addressLine1: '1 Supply Road',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    phoneNumber: '312-555-0100',
    email: 'orders@newsupplier.com',
    balance: 0,
    blocked: false,
    currencyCode: 'USD',
    paymentTermsId: 'NET30',
  },
  // ...existing vendors
];
```

### How to Swap Mock Service for a Real BC API

1. Create `src/services/realBcApi.ts` that calls your Business Central OData v4 endpoints.
2. Update `src/services/index.ts` to export from `realBcApi.ts` instead of `bcApi.ts`.
3. Populate `appConfig.ts` with your BC environment URL and credentials.

---

## Azure Document Intelligence (Future)

A placeholder screen exists at **Scan Document** in the Create tab. When ready to implement:

### Configuration

```ts
// src/config/appConfig.ts
export const appConfig = {
  adiEndpoint: 'https://<your-resource>.cognitiveservices.azure.com/',
  adiKey: '<your-key>',
  adiModelId: 'purchase-invoice-model', // custom trained model
};
```

### Custom Model Training

1. Label purchase invoices in [Azure AI Document Intelligence Studio](https://documentintelligence.ai.azure.com/studio).
2. Tag fields: `VendorName`, `InvoiceNumber`, `InvoiceDate`, `LineItems[].Description`, `LineItems[].Quantity`, `LineItems[].UnitCost`, `TotalAmount`.
3. Train and publish the model.
4. Replace the placeholder in `ScanDocumentScreen.tsx` with `AzureKeyCredential` + `DocumentAnalysisClient`.

---

## Local Development Setup

### Prerequisites

- Node.js 20 LTS
- React Native CLI (`npm install -g react-native-cli`)
- **iOS**: macOS + Xcode 15+ + CocoaPods (`sudo gem install cocoapods`)
- **Android**: Android Studio + JDK 17 + emulator configured

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/AgenticDzungnmt/PurchaseEase.git
cd PurchaseEase

# 2. Install JS dependencies
npm install

# 3. Copy config and fill in values
cp src/config/appConfig.example.ts src/config/appConfig.ts
# Edit appConfig.ts if you want to change demo credentials

# 4. iOS only — install native pods
cd ios && pod install && cd ..

# 5. Run
npx react-native run-ios      # iOS
npx react-native run-android  # Android
```

### App Config

`src/config/appConfig.ts` is gitignored. Copy from the example:

```ts
// src/config/appConfig.example.ts
export const appConfig = {
  demoUsername: 'YOUR_USERNAME',
  demoPassword: 'YOUR_PASSWORD',
  appEnvironmentName: 'YOUR_ENV_NAME',
  primaryColor: '#0078D4',
  appDisplayName: 'PurchaseEase',
};
```

---

## Screenshots

| Dashboard | Orders | Create Order |
|---|---|---|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

| Order Detail | Invoices | Settings |
|---|---|---|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

---

## License

MIT

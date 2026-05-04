# PurchaseEase

A React Native mobile app for purchase order management, built as a demo with mock Business Central data.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74.5 with TypeScript |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) |
| State | React hooks + AsyncStorage |
| Mock API | In-memory service layer with simulated delays |
| Styling | StyleSheet API with custom design system |

## Features

- **Login** — Demo credentials with AsyncStorage session persistence
- **Dashboard** — Summary cards, quick actions, recent orders list
- **Order List** — Search + filter by status (Draft/Open/In Review/Received)
- **Order Detail** — Full order view with actions (Submit, Edit, Receive & Invoice)
- **Create Order** — 4-step wizard: Vendor → Line Items → Details → Review
- **Edit Order** — Edit notes and line item quantities/costs
- **Posted Invoices** — Searchable invoice list with detail view
- **Document Scan** — Azure AI Document Intelligence placeholder UI
- **Settings** — User profile, demo data reset, logout

## Demo Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `demo1234` |
| Environment | `Demo` |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/AgenticDzungnmt/PurchaseEase.git
cd PurchaseEase

# Install dependencies
npm install

# iOS (requires macOS + Xcode)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Config

Copy `src/config/appConfig.example.ts` to `src/config/appConfig.ts` and fill in values (or use the defaults for demo mode).

## Project Structure

```
src/
  App.tsx               — Root component
  config/               — App configuration
  context/              — AuthContext (auth state management)
  navigation/           — All navigators
  screens/              — Screen components
  services/             — bcApi mock service + seed data
  theme/                — Colors, spacing, typography
  types/                — TypeScript interfaces & navigation types
  components/           — Reusable UI components
```

## GitHub Issues

This project was built issue-by-issue following a structured spec. All 12 issues are closed and merged to `main`.

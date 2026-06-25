# Site Materials

A simple mobile app for building lists of materials you need at a job site.
Built with **Expo / React Native**. All data is stored **on the device** — it
works fully offline, with no accounts and no internet required.

## Features

- **Multiple lists, one per site/job** — organize materials by project.
- **Quantity + unit per item** — e.g. `20 bags`, `5 sheets`, `100 ft`.
- **Check off ("got it")** — tap an item's box as you buy/load it; checked
  items sink to the bottom and are struck through.
- **Share / export** — send a list as plain text (SMS, email, etc.) or export
  a **PDF** via the system share sheet.

## Running it

```bash
npm install
npx expo start
```

Then open it on your phone:

1. Install **Expo Go** from the App Store / Play Store.
2. Scan the QR code shown in the terminal (iOS: Camera app; Android: Expo Go).

Or press `a` for an Android emulator / `i` for an iOS simulator if you have one
set up. `npm run android` / `npm run ios` do the same.

## Building an installable app

Cloud builds use **EAS Build** (an Expo account is required; it's free for this).
Config lives in `eas.json`; the app identifier is `com.kubiknyc.sitematerials`.

```bash
npm install -g eas-cli
eas login
eas build:configure        # one-time, links the project to your Expo account

# Installable Android APK (sideload onto a device):
eas build --profile preview --platform android

# Store builds:
eas build --profile production --platform android   # .aab for Play Store
eas build --profile production --platform ios        # needs an Apple Developer account
```

EAS runs the native build in the cloud and gives you a download link / QR code —
no local Android SDK or Xcode needed. For day-to-day development, `npx expo start`
with Expo Go (above) is faster and needs no build.

### Get it onto an iPhone with no computer (paid Apple Developer account)

Builds run in the cloud via the **iOS build (EAS)** GitHub Action, so you can
trigger everything from the GitHub website on your phone, then install through
Apple's **TestFlight** app.

One-time setup (all doable in a phone browser):

1. Create a free account at **expo.dev**.
2. On expo.dev, create an **access token** (Account → Settings → Access Tokens).
   In the GitHub repo, add it as a secret: **Settings → Secrets and variables →
   Actions → New repository secret**, named `EXPO_TOKEN`.
3. Give EAS your Apple signing credentials so it can build and upload without a
   Mac: in the Apple Developer portal create an **App Store Connect API key**,
   then add it under the Expo project's **Credentials → iOS** (EAS will then
   manage the distribution certificate, provisioning profile, and TestFlight
   upload automatically).

Each build:

1. GitHub repo → **Actions** tab → **iOS build (EAS)** → **Run workflow**
   (profile `production`, submit ✓).
2. Wait for it to finish (~10–20 min); it uploads to TestFlight.
3. Install **TestFlight** from the App Store, open it, and install **Site
   Materials**.

Prefer no TestFlight review wait? Run the workflow with profile `preview` for a
direct-install build — you'll register your device once (EAS provides a link)
and install the `.ipa` straight from the EAS build page.

## Tests

```bash
npm test
```

Unit tests (Jest) cover the pure logic — text/PDF formatting (`src/format.ts`)
and the list/item operations (`src/store/operations.ts`). These modules have no
React Native / Expo imports, so the suite runs fast in a plain node environment.

## How it's built

```text
app/
  _layout.tsx       Root stack navigator + state provider (expo-router)
  index.tsx         "My Sites" — all lists, create / open / delete
  list/[id].tsx     List detail — add items, check off, edit, share
src/
  types.ts          MaterialList / MaterialItem types
  format.ts         Pure text / HTML formatting (unit-tested)
  store/
    storage.ts      AsyncStorage read/write (single JSON blob)
    operations.ts   Pure list/item transforms (unit-tested)
    ListsProvider.tsx  React Context store; persists on every change
  share.ts          Plain-text + PDF (expo-print) export helpers
  components/
    QuantityStepper.tsx  +/- quantity control
  theme.ts          Colors / spacing (high contrast for outdoor use)
  __tests__/        Jest tests for format.ts and operations.ts
```

Data lives under the AsyncStorage key `@site-materials/lists`. Editing is
optimistic and saved immediately; there is no network layer.

## Not included yet (ideas for later)

- Cloud sync / accounts / sharing lists with coworkers by login
- Photos or barcodes per item, supplier catalogs, reusable templates

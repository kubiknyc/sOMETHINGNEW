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

## Tests

```bash
npm test
```

Unit tests (Jest) cover the pure logic — text/PDF formatting (`src/format.ts`)
and the list/item operations (`src/store/operations.ts`). These modules have no
React Native / Expo imports, so the suite runs fast in a plain node environment.

## How it's built

```
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

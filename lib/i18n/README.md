# i18n

This folder keeps the horoscope translation setup small and modular.

## Structure

- `horoscope.schema.ts` defines the shared message types.
- `locale.ts` loads dictionaries and provides small language helpers.
- `locale-context.tsx` exposes the horoscope UI language context.
- `locales/horoscope/en.ts` and `locales/horoscope/np.ts` contain the actual copy.

## Imports

Use `@/lib/i18n` for the main entrypoint when you need shared horoscope i18n helpers.

Use `@/lib/i18n/horoscope` when you only need horoscope-specific helpers such as the dictionary or storage helpers.

## Adding a locale

1. Add a new file under `locales/horoscope/`.
2. Export the locale bundle in `locale.ts`.
3. Update `HOROSCOPE_DICTIONARIES` so the new language is available to the app.
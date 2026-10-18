# Acorn

A weekly mission-and-reward app. An AI judge (Jev, via the TypeSafe API) scores each mission's difficulty and prices each reward from your monthly budget; you earn acorns by clearing missions and spend them on rewards.

Demo video: https://youtube.com/shorts/ydS4rhTu7JY

## Requirements

- Docker
- Node.js (CI uses 24) for Expo SDK 58
- A TypeSafe API key (issued from the console at https://docs.typesafe.ai)

## Run

```sh
cp .env.example .env          # set TYPESAFE_API_KEY (never commit .env)
docker compose up --build     # API server → http://localhost:8000
cd mobile && npm install
npx expo start --web          # app → http://localhost:8081
```

If port 8081 is taken, run the API with `ACORN_CORS_ORIGINS=http://localhost:8082 docker compose up -d` and the app with `npx expo start --web --port 8082`.

The app has "Next day" and "Next week" buttons at the bottom of the home screen, so you can try a whole week without waiting.

## Test

```sh
cd mobile && npm test                 # app unit tests
cd api && uv sync && uv run pytest    # API tests (a fake judge; no API key needed)
```

## Layout

- `mobile/` — Expo (React Native) app. Game rules are pure functions in `mobile/src/domain/`; every change to saved data goes through `mobile/src/storage/reducer.ts`.
- `api/` — FastAPI server that calls Jev and converts its judgements into acorns (`api/src/acorn_api/pricing.py`).
- `devpost/` — planning documents (scope, PRD, spec, build checklist) and `app-map.html`, a short guide to the code.

## License

MIT — see [LICENSE](LICENSE).

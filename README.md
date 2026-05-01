# DSA Interview Atlas (React + Node.js)

This web app reads `MAIN DSA QUESTIONS.js` and displays:
- Full problem statements (derived from each problem heading)
- Solution explanation (the `Steps:` comment)
- Complete code snippet for each problem
- Sample input/output (auto-evaluated from quick check blocks where available)

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express

## Run Locally

From `dsa-webapp`:

```bash
npm run dev
```

This starts:
- API server: `http://localhost:4000`
- React app: `http://localhost:5173`

The frontend calls `/api/problems`.
During local development, Vite proxies `/api` to `http://localhost:4000`.

## Build Frontend

```bash
npm run build
```

## Notes
- API endpoint: `GET /api/problems`
- Source parsed by backend: `data/MAIN DSA QUESTIONS.js`
- If you update your DSA file, refresh the UI to see updated parsed content.

## Deploy to Vercel

From `dsa-webapp`:

```bash
npx vercel
```

On first deploy:
- Choose this folder as project root (`dsa-webapp`)
- Confirm project settings

Then deploy to production:

```bash
npx vercel --prod
```

Vercel uses:
- Frontend static output from `client/dist`
- Serverless API route at `api/problems.js`

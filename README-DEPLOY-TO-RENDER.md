# Atkinson Group — Vapi Backend (Render)

## 1) Create Repo & Push
- Create a GitHub repo named `vapi-backend`
- Add these files
- Commit & push to `main`

## 2) Create Render Web Service
- On Render: New → Web Service
- Connect GitHub → select `vapi-backend`
- Environment: Node
- Build Command: `npm ci`
- Start Command: `npm start`
- Region: US
- Plan: Starter/Basic (avoid free sleeping)
- Auto-deploy: Yes

## 3) Environment Variables (Render → Web Service → Environment)

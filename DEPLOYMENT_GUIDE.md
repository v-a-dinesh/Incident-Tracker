# Deployment Guide - Render

## Quick Start

This guide walks you through deploying the Incident Tracker app to **Render**.

---

## Option 1: Deploy with render.yaml (Recommended)

### Prerequisites
- GitHub account with the repo pushed (✅ Already done)
- Render account (free tier available at https://render.com)

### Steps

1. **Sign in to Render**
   - Go to https://dashboard.render.com
   - Sign up or log in with GitHub

2. **Create New Service from render.yaml**
   - Click "New" → "Web Service"
   - Select "Deploy an existing repository"
   - Connect your GitHub account and select `v-a-dinesh/Incident-Tracker`
   - Under "Build and deploy settings", select "Build from render.yaml"

3. **Configure Services**
   - Render will auto-detect both backend and frontend services from `render.yaml`
   - Backend: Runs on internal port 5000
   - Frontend: Runs on internal port 3000, proxies `/api` to backend

4. **Deploy**
   - Click "Create Services"
   - Wait for both services to build and deploy (5-10 minutes)
   - Once "Live", your app is accessible at the frontend service's public URL

---

## Option 2: Manual Deploy (Individual Services)

### Deploy Backend

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect GitHub repo → select `v-a-dinesh/Incident-Tracker`
3. Fill in:
   - **Name:** `incident-tracker-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Click "Create Web Service"
5. Once deployed, copy the backend URL (e.g., `https://incident-tracker-backend.onrender.com`)

### Deploy Frontend

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect GitHub repo → select `v-a-dinesh/Incident-Tracker`
3. Fill in:
   - **Name:** `incident-tracker-frontend`
   - **Root Directory:** `frontend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`
4. Add Environment Variables:
   - `VITE_API_URL`: The backend service URL from step 5 above
5. Click "Create Web Service"
6. Access the frontend at the provided public URL

---

## Environment Configuration

### Backend needs:
- `NODE_ENV=production` (automatically set by Render)

### Frontend build needs:
- `VITE_API_URL` environment variable pointing to your backend

**To update frontend's API URL:**
1. In Render dashboard, go to frontend service
2. Environment → Add:
   - Key: `VITE_API_URL`
   - Value: `https://incident-tracker-backend.onrender.com`
3. Trigger a manual deploy

---

## Updating Vite Proxy (if needed for local dev)

Currently, `frontend/vite.config.js` has:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

In production, the frontend needs to know the backend URL. Update `frontend/src/api.js`:

```javascript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

Then use `${API_BASE}/incidents` in fetch calls.

---

## Testing Locally with Docker

Before deploying, test with Docker:

```bash
# Build and run both services
docker-compose up --build

# Backend will be at: http://localhost:5000
# Frontend will be at: http://localhost:3000
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check logs in Render dashboard. Ensure `npm install` succeeds locally first. |
| **404 on `/api` routes** | Verify backend URL in frontend env vars or vite.config.js proxy. |
| **Database not persisting** | Render free tier doesn't persist file storage. Consider upgrading or using a managed DB (PostgreSQL). |
| **Free tier services sleep** | Render free tier spins down after 15 min of inactivity. Consider upgrading to paid plan. |

---

## Important Notes

- **Free Tier Limitations:**
  - Services spin down after 15 minutes of inactivity
  - 0.5 GB RAM, 0.5 CPU
  - No persistent disk storage (database files are lost on restart)

- **Recommendations for Production:**
  1. Upgrade to Paid plan for always-on services
  2. Use PostgreSQL managed DB instead of SQLite
  3. Set up GitHub auto-deploy (already supported via render.yaml)
  4. Add monitoring and error logging (Sentry, LogRocket, etc.)

---

## Rendering Success

Once deployed, you should see:
- ✅ Backend service running at `https://incident-tracker-backend.onrender.com`
- ✅ Frontend service running at `https://incident-tracker-frontend.onrender.com`
- ✅ Links working and data displaying

**Congratulations! 🎉 Your Incident Tracker is live!**

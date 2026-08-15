# 🚀 HackTrack Deployment Guide

This guide explains how to deploy **HackTrack** to live hosting platforms for free.

---

## ⚡ Option 1: Deploy to Vercel (Recommended — 2 Minutes)

Vercel provides automatic HTTPS, global CDN, and continuous deployments.

### Method A: Deploy via GitHub (Easiest)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HackTrack"
   git branch -M main
   git remote add origin https://github.com/your-username/hacktrack.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **"Add New..."** > **"Project"**.
4. Import your `hacktrack` repository from GitHub.
5. In **Build and Output Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. *(Optional)* Add Environment Variables if using Supabase Cloud:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
7. Click **"Deploy"**.
8. Your site is live with a `https://hacktrack-xxx.vercel.app` URL!

---

### Method B: Deploy directly using Vercel CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy directly from the project directory
vercel

# 3. Deploy to production
vercel --prod
```

---

## 🌐 Option 2: Deploy to Netlify

1. Push your code to GitHub.
2. Log in to [netlify.com](https://netlify.com).
3. Click **"Add new site"** > **"Import an existing project"**.
4. Select GitHub and choose your repository.
5. Netlify will automatically detect:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy HackTrack"**.

---

## 💼 Copyright & Developer Information

- **Developer**: **Dhinesh Karthick D**
- **LinkedIn Profile**: [https://www.linkedin.com/in/dhineshkarthick16/](https://www.linkedin.com/in/dhineshkarthick16/)
- **Copyright**: © DK 2026. All rights reserved.

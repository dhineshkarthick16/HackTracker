# 🏆 HackTrack — Full-Stack Hackathon & Competition Tracking Dashboard

**HackTrack** is a full-stack, multi-user web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)** for developers and students to track hackathons, ideathons, coding challenges, dynamic rounds, registration countdowns, problem statements, and prize results.

---

## 🌐 Live Demo

- Production: [hack-tracker-lilac.vercel.app](https://hack-tracker-lilac.vercel.app/)
- Preview (branch): [hack-tracker-git-master-dk-04ab.vercel.app](https://hack-tracker-git-master-dk-04ab.vercel.app/)
- Preview (deployment): [hack-tracker-q4c3e9udf-dk-04ab.vercel.app](https://hack-tracker-q4c3e9udf-dk-04ab.vercel.app/)

---

## ✨ Features

- 🔐 **Multi-User Authentication & Strict Data Isolation**:
  - Secure Registration, Login, Session Persistence, and Protected Routes.
  - PostgreSQL Row Level Security (RLS) policies (`supabase_schema.sql`) ensuring User A can never see or modify User B's competitions.
  - Adaptive Storage Engine: Runs seamlessly against live Supabase PostgreSQL when `.env` is configured, or instantly in client-side partitioned multi-user mode with zero setup required.
- 📊 **Main Dashboard**:
  - 7 Key Metric Cards: Total Competitions, Ongoing, Completed, Wins, Finalists, Upcoming Deadlines, Total Registration Fees Paid (₹).
  - Urgent Deadlines Alert Banner with live countdown.
  - Recent competitions quick-view with interactive statuses and round progress bars.
- 📋 **Competitions Directory**:
  - Dual View modes: Table list view & Interactive Card grid view.
  - **Live Dynamic Search**: Search across competition names, organizers, and problem statements simultaneously.
  - **Multi-Category Filters**: Filter by Status (`Upcoming`, `Ongoing`, `Completed`), Result (`Winner`, `Runner-up`, `Finalist`, `Shortlisted`, `Participated`, `Lost`, etc.), and Payment (`Paid`, `Not Paid`, `Free / Not Required`).
  - **Flexible Sorting**: Latest Added (default), Oldest, Registration Deadline, Competition Name, Status, Result.
- ⏳ **IST Registration Deadline Countdowns**:
  - Live ticking timer down to days/hours/minutes/seconds formatted in **Asia/Kolkata (IST)**.
  - Auto-transitions to `⚠️ Registration closed` when the deadline passes.
- 🔄 **Dynamic Multi-Round Tracker**:
  - Add, delete, and reorder competition rounds with round dates and statuses (`Upcoming`, `Ongoing`, `Completed`, `Eliminated`).
  - Real-time round status toggle directly on the competition details page.
- 📝 **Dedicated Details View (`/competitions/:id`)**:
  - Single source of truth containing complete competition parameters.
  - Preserved multiline formatted Problem Statement viewer with 1-click clipboard copy.
  - Result showcase (Position, Prize in ₹, Judge notes) with celebratory particle confetti.
  - External links (`Website`, `GitHub Repository`, `LinkedIn Post`) opening in new browser tabs.
  - Creation and last updated timestamps.
- 📅 **Interactive Calendar View (`/calendar`)**:
  - Monthly calendar marking registration deadlines and round milestones with interactive detail popovers.
- 👤 **User Profile & Data Management**:
  - Profile statistics, quick 1-click multi-user testing account switchers (`User A: Alice` vs `User B: Bob`), JSON data export/**import** (merges an exported file back into your account), and sample demo data loader.
- 🗑️ **Safe Deletion Flow**:
  - Custom delete confirmation modal with cascade deletion of rounds.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Deployment**: Vercel ready (`vercel.json` included)

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase PostgreSQL Setup (Optional for Cloud DB)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase_schema.sql` from this repository and run the SQL query to create the tables (`profiles`, `competitions`, `rounds`), foreign keys with cascade delete, and Row Level Security policies.
4. Copy your **Project URL** and **Anon API Key** from *Project Settings > API*.
5. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
6. Restart the dev server (`npm run dev`). HackTrack will automatically detect Supabase and connect to your cloud PostgreSQL database!

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), click **New Project** and import the repo. Build settings (Vite) are auto-detected.
3. Go to **Project Settings → Environment Variables** and add:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   Apply to Production (and Preview if desired). These must match the values in your local `.env`.
4. Deploy (or **Redeploy** if the project already existed — env vars only take effect on a new build).
5. Open your deployed URL and check the Profile page confirms it's running against Supabase, not local mode.

**Note on the free Supabase tier:** projects auto-pause after 7 days with zero API activity. Data isn't lost, but the site will error until someone manually resumes the project from the Supabase dashboard.

**Migrating existing local data:** if you were using HackTrack in local mode (no `.env`/Supabase configured) before switching over, your old data lives only in that browser's `localStorage` and won't appear once Supabase is connected. Export it first (Profile → Export Data (JSON)) while still in local mode, then Import it (Profile → Import Data (JSON)) after logging into your Supabase-backed account.

---

## 🔒 Multi-User Security Verification

HackTrack enforces strict user isolation at the database layer (via RLS in Supabase) and application layer:
1. Sign in as **User A (Alice)** (`alice@hacktrack.io`).
2. Add a competition (e.g. *SIH*).
3. Sign in as **User B (Bob)** (`bob@hacktrack.io`).
4. User B's dashboard will show 0 competitions, and User B cannot view or edit User A's competition IDs.

---

## 👨‍💻 Developer & Copyright

- **Author**: **Dhinesh Karthick D**
- **LinkedIn**: [https://www.linkedin.com/in/dhineshkarthick16/](https://www.linkedin.com/in/dhineshkarthick16/)
- **Copyright**: © DK 2026. All rights reserved.
# LUMINA — Deploy Guide (Free Stack)
MongoDB Atlas + NextAuth + Groq + Vercel — 100% free

---

## Your 4 environment variables

MONGODB_URI       = mongodb+srv://lumina:PASSWORD@cluster0.xxxxx.mongodb.net/lumina?retryWrites=true&w=majority
NEXTAUTH_SECRET   = (run: openssl rand -base64 32)
NEXTAUTH_URL      = https://your-app.vercel.app
GROQ_API_KEY      = gsk_xxxxxxxxxxxxxxxx

---

## Step 1 — MongoDB Atlas (5 min)

1. mongodb.com/atlas → Try Free → sign up
2. Choose M0 Free tier → any region → create cluster
3. Left sidebar → Database Access → Add New Database User
   - Username: lumina
   - Password: click "Autogenerate Secure Password" → COPY IT
   - Role: Read and write to any database
4. Left sidebar → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   (Required for Vercel. Still secure because your DB needs username+password.)
5. Left sidebar → Database → Connect → Drivers → Node.js 5.5+
   Copy the string, replace <password> with yours, add /lumina before the ?:
   mongodb+srv://lumina:YOURPASSWORD@cluster0.xxxxx.mongodb.net/lumina?retryWrites=true&w=majority

---

## Step 2 — Groq (2 min)

1. console.groq.com → sign up
2. API Keys → Create API Key → name it "lumina"
3. Copy the key (starts with gsk_)
Free tier: 14,400 requests/day — more than enough.

---

## Step 3 — NEXTAUTH_SECRET (30 sec)

Run in terminal:
  openssl rand -base64 32

Copy the output. No terminal? Use: https://generate-secret.vercel.app/32

---

## Step 4 — GitHub (5 min)

cd lumina
git init
git add .
git commit -m "Lumina Phase 9"

Go to github.com → New repository → name: lumina → Create (no README)

git remote add origin https://github.com/YOUR_USERNAME/lumina.git
git branch -M main
git push -u origin main

---

## Step 5 — Vercel (5 min)

1. vercel.com → sign in with GitHub
2. Add New → Project → Import your lumina repo
3. Framework: Next.js (auto-detected)
4. Root Directory: lumina (if package.json is inside a lumina/ folder)
5. Environment Variables — add all 4:
   MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GROQ_API_KEY
6. Deploy — takes ~60 seconds

NOTE: For NEXTAUTH_URL, if you don't know your URL yet, deploy once first,
then copy the URL (e.g. https://lumina-abc123.vercel.app), update NEXTAUTH_URL
in Settings → Environment Variables, and redeploy.

---

## Troubleshooting

"MongoServerError: bad auth"
  → Wrong password in MONGODB_URI. Re-check you replaced <password> with your actual password.

Connection timeout / network error
  → You didn't whitelist 0.0.0.0/0 in Atlas → Network Access.

Login keeps redirecting to /auth/login (loop)
  → NEXTAUTH_URL doesn't match your actual Vercel URL. Update it and redeploy.

AI not responding (500 error)
  → Check Vercel → Functions logs. Usually GROQ_API_KEY is missing.

"NEXTAUTH_SECRET is not set"
  → Add it in Vercel environment variables.

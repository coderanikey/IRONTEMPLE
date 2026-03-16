# ⚡ Quick Start - IRON TEMPLE

## 🎯 3 Simple Steps

### 1️⃣ Get MongoDB URI (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create FREE cluster
3. Database Access → Create user (save password!)
4. Network Access → Allow from anywhere
5. Connect → Copy connection string
6. Replace `<password>` and `<dbname>` → Save it!

### 2️⃣ Setup Environment

Create `.env.local` file in root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iron_temple?retryWrites=true&w=majority
```

### 3️⃣ Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → Import repository
3. Add environment variable: `MONGODB_URI`
4. Deploy!

**That's it!** 🎉

---

## 📍 Schema Location

**MongoDB Schemas are in:**
- `models/Member.js` - Member schema
- `models/Payment.js` - Payment schema (includes paymentMethod: cash/online/card/upi)

**API Routes are in:**
- `pages/api/members/` - Member endpoints
- `pages/api/payments/` - Payment endpoints

Everything is in ONE Next.js app - no separate backend needed!

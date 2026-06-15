# Nucleus ⚛️

**Nucleus** is a next-generation gamified task marketplace and creator platform. It bridges the gap between content creators looking for authentic engagement and users looking to earn rewards by interacting with digital content. 

Whether you're a Creator wanting to boost a YouTube video, or a Viewer wanting to earn coins by watching content, Nucleus provides a seamless, secure, and optimized ecosystem.

---

## 🌟 Key Features

### For Viewers (Earners)
- **Task Marketplace**: Browse and complete tasks across YouTube, Instagram, Facebook, and Threads.
- **Secure Video Player**: In-app secure video player that ensures genuine watch-time and prevents skipping.
- **Gamification & Levels**: Earn achievement badges, build completion streaks, and level up to unlock better rewards.
- **Optimized Wallet**: Real-time coin balances and instant reward claims.
- **Optimistic UI**: Lightning-fast dashboard updates that feel instantaneous.

### For Creators (Advertisers)
- **Campaign Management**: Launch engagement campaigns (e.g., "Watch 30 seconds of this YouTube video").
- **Real-time Analytics**: Track campaign performance, click-through rates, and completion stats.
- **Niche Targeting**: Target viewers based on their specific interests and niches.
- **Wallet Funding**: Deposit fiat or platform coins to fund campaigns.

### For Admins
- **Global Dashboard**: View platform-wide statistics, active users, and total transactions.
- **User & Campaign Moderation**: Approve, pause, or reject campaigns and manage user accounts.
- **Withdrawal Processing**: Process viewer payout requests securely.

---

## 🛠 Tech Stack

Nucleus is built with modern, high-performance web technologies:

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Bundler**: Turbopack for ultra-fast development compilation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + custom CSS utility animations
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [SWR](https://swr.vercel.app/) with Optimistic UI caching
- **Backend/API**: Next.js Serverless API Routes
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (with advanced indexing for performance)
- **Authentication**: JWT-based Custom Auth / NextAuth

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and npm installed. You will also need a running PostgreSQL database.

### 1. Installation
Clone the repository and install the dependencies:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Environment Variables
Create a `.env` or `.env.local` file in the `frontend` root and add your configuration:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/nucleus"

# Authentication Secrets
JWT_SECRET="your_super_secret_jwt_string"
```

### 3. Database Setup
Push the Prisma schema to your PostgreSQL database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Running the Development Server
Start the Next.js development server with Turbopack enabled:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## ⚡ Performance Optimizations

Nucleus has been highly optimized to handle large amounts of data and concurrent users:
- **Database Indexing**: Critical `@@index` mappings on `Task`, `Campaign`, `Wallet`, and `Transaction` tables.
- **Parallel Fetching**: Backend APIs heavily utilize `Promise.all` to execute multiple distinct database queries concurrently.
- **Lazy Loading**: Heavy components like the `VideoModal` and Admin Modals are loaded asynchronously via `next/dynamic`.
- **Skeleton UIs**: Seamless layout scaffolding is rendered instantly before data hydration to eliminate blank screens.

---

## 🛡 Security

- **Anti-Cheat Verification**: Native YouTube integrations prevent fast-forwarding, skipping, or opening external browser tabs.
- **Server-Side Validation**: All campaign creations, rewards, and withdrawals are validated securely on the backend.
- **Role-Based Access Control (RBAC)**: Strict separation between Viewer, Creator, and Admin routes.

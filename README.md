<div align="center">

  <img src="public/logo.png" alt="ThePrepRoom Logo" width="160" />

  # ThePrepRoom 🎓
  
  **Know the drill. Before you face it.**  
  *Real placement experiences, interview questions, and prep insights from students who've been there.*

  [![Live Website](https://img.shields.io/badge/Live%20Platform-kkwagh.live-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white)](https://kkwagh.live)
  [![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma ORM](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
  [![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <a href="https://kkwagh.live"><strong>Explore Live Platform (kkwagh.live) »</strong></a>
    <br />
    <br />
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture--project-structure">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-roles--security">Security & Roles</a> •
    <a href="#-environment-variables">Configuration</a>
  </p>

</div>

---

## 🌐 Live Platform

**ThePrepRoom** is deployed in production and actively serving students at:

### 🔗 [https://kkwagh.live](https://kkwagh.live)

> Built to replace scattered WhatsApp messages, unorganized Google Drives, and word-of-mouth senior advice with a single, verified, searchable placement intelligence hub.

---

## 💡 What is ThePrepRoom?

Every placement season, engineering students face the same recurring hurdles:
- **Scattered Information**: Interview experiences get buried in WhatsApp groups, Telegram channels, and scattered docs.
- **Duplicate & Vague Questions**: The same coding and technical questions are re-asked across multiple rounds and companies under slightly different wordings without cross-company frequency tracking.
- **Unverified & Outdated Advice**: Advice from past years often loses context regarding OA platforms, cutoff difficulty, and round patterns.

**ThePrepRoom** provides a centralized, peer-to-peer campus placement archive featuring:
1. **195+ Verified Companies & Roles** cataloged with round difficulty, platform details (HackerRank, Codility, TestDome, Mettl), and hiring patterns.
2. **Canonical Question Deduplication Engine** that groups questions deterministically to track exact recurrence counts across hiring drives.
3. **Typo-Tolerant Omni-Search** powered by a custom Damerau-Levenshtein fuzzy matching engine that effortlessly handles misspellings and partial queries across companies, roles, and questions.
4. **Multi-Stage Moderation Queue** where experiences submitted by students are vetted by campus administrators before publishing.

---

## ✨ Key Features

### 🔍 1. Typo-Tolerant Universal Omni-Search
- Custom **Damerau-Levenshtein** fuzzy algorithm matching company names, job titles, rounds, and interview questions.
- Automatically handles character transpositions, deletions, and misspellings (e.g. searching `"arees"` matches `"Aress Software"`, `"barclays"` matches `"Barclays"`).
- Keyboard-accessible search dropdowns (`ModernSelect`) with real-time filtering and highlighting.

### 🧠 2. Canonical Question Intelligence & Deduplication
- Deterministic text normalization pipeline (case-folding, punctuation elimination, symbol stripping).
- Cross-company linking: discovers when distinct companies ask the exact same core concept or algorithm.
- Displays dynamic **"Asked in X companies"** badges and difficulty levels (Easy, Medium, Hard).

### 🎯 3. End-to-End Selection Round Breakdown
- Structured round classification:
  - 📝 **Online Assessments (OA)**: Platform (HackerRank, Codility, Mettl), question formats, timing, and topic distribution.
  - 💻 **Technical Rounds (Round 1 & 2)**: Core CS fundamentals, DSA, live system design, and coding challenges.
  - 🤝 **HR & Managerial Rounds**: Behavioral questions, cultural fit scenarios, and situational questions.
- Real outcome indicators: `Selected`, `Waitlisted`, `Rejected`, `Pending`.

### 🏢 4. Comprehensive 195+ Company Directory
- Pre-populated company directory spanning IT Services, Product Giants, FinTech, Core Engineering, and High-Growth Startups.
- Company profiles aggregate hiring difficulty, recent interview experiences, and common question sets.
- Strict governance: Only designated **Admins** can add or modify company records, ensuring directory purity while allowing students to contribute custom job roles.

### 🛡️ 5. Administrative Moderation Suite
- **Tri-State Approval Pipeline**: Experiences transition through `PENDING` ➔ `APPROVED` / `REJECTED`.
- **Flagging & Reports Queue**: Community reporting mechanism with administrative triage for spam, offensive content, or duplicates.
- **Audit Logs & Security**: Login attempt tracking, IP rate limiting, and 2FA recovery oversight.

### 🔐 6. Enterprise-Grade Security & 2FA (TOTP)
- Session management built with secure `jose` JWTs in `HttpOnly`, `SameSite=Lax` cookies.
- Cryptographic password hashing via `bcryptjs`.
- Two-Factor Authentication (TOTP) with QR code generation (`otplib` & `qrcode`) and emergency recovery codes for administrative accounts.

### 🔖 7. Student Revision & Bookmark Hub
- One-click bookmarking for experiences, specific interview questions, and target companies.
- Tailored preparation guides across **Operating Systems**, **Database Management Systems**, **Computer Networks**, and **Object-Oriented Programming**.
- Dedicated Online Assessment (OA) master guide detailing platform testing mechanics.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, Turbopack, React Server Components & Server Actions |
| **Frontend** | [React 19](https://react.dev/) | Concurrent rendering, modern hooks, zero hydration drift |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation CSS engine with high-contrast Obsidian dark theme |
| **Database & ORM** | [Prisma 6](https://www.prisma.io/) | Type-safe query engine with PostgreSQL (Neon Serverless) and SQLite support |
| **Database Engine** | [PostgreSQL (Neon)](https://neon.tech/) | Serverless cloud PostgreSQL with connection pooling & direct SSL endpoints |
| **Authentication** | [Jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Custom stateless JWT session cookies & salted password hashing |
| **2FA / MFA** | [otplib](https://github.com/yeojinj/otplib) & [qrcode](https://github.com/soldair/node-qrcode) | RFC 6238 TOTP authentication with scannable QR codes |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static typing throughout client, actions, and database queries |
| **Deployment** | [Vercel](https://vercel.com/) | Edge-optimized deployment serving [kkwagh.live](https://kkwagh.live) |

---

## 📂 Architecture & Project Structure

```text
thepreproom/
├── actions/                      # Next.js Server Actions (Mutations & Auth)
│   ├── admin.ts                  # Admin operations (approvals, company management)
│   ├── auth.ts                   # Login, signup, logout, session verification
│   ├── bookmarks.ts              # Saved items actions (toggle bookmarks)
│   ├── experiences.ts            # Experience submission wizard & editing
│   ├── profile.ts                # Student profile updates & placement tracking
│   └── totp.ts                   # Two-Factor Authentication setup & validation
├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                   # Authentication routes (/login, /register)
│   ├── about/                    # Mission statement & platform details
│   ├── admin/                    # Admin portal (moderation, companies, reports)
│   ├── bookmarks/                # Student bookmarked experiences & questions
│   ├── companies/                # Company directory & profile pages
│   ├── experiences/              # Community interview experience feed
│   ├── oa/                       # Online Assessment platform guide
│   ├── prepare/                  # Core CS & behavioral preparation hub
│   ├── profile/                  # User profile & placed status
│   ├── questions/                # Canonical question bank & frequency counters
│   ├── search/                   # Universal omni-search interface
│   ├── share/                    # Experience submission wizard
│   ├── layout.tsx                # Root layout with navbar & footer
│   └── page.tsx                  # Landing page with hero & top stories carousel
├── components/                   # Reusable UI Components
│   ├── experience-card.tsx       # Standardized interview experience card
│   ├── footer.tsx                # Site footer with newsletter & links
│   ├── modern-select.tsx         # Typo-tolerant searchable dropdown
│   ├── navbar.tsx                # Responsive top navigation & profile chip
│   ├── top-stories-carousel.tsx  # Landing page featured story slider
│   └── ...
├── lib/                          # Core Utilities & Business Logic
│   ├── auth.ts                   # JWT token generation, verification & cookies
│   ├── db.ts                     # Prisma client singleton
│   ├── fuzzy-search.ts           # Damerau-Levenshtein fuzzy search engine
│   ├── public-queries.ts         # High-performance cached database queries
│   └── question-dedup.ts         # Question text normalization & deduplication
├── prisma/                       # Database Definition & Migrations
│   ├── schema.prisma             # Primary schema file (PostgreSQL / SQLite)
│   └── seed.ts                   # Seed script with 195+ companies and roles
├── scripts/                      # Utility Scripts
│   └── switch-db.js              # Database provider switcher (postgres <-> sqlite)
└── public/                       # Static assets (logos, icons, favicons)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.18+` or `v20+` (LTS recommended)
- **npm** or **pnpm**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/VedKalantri/ThePrepRoom.git
cd ThePrepRoom
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Database connection (PostgreSQL for Neon / Supabase, or SQLite file)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Authentication secret (Generate a strong 32+ character random string)
AUTH_SECRET="your-super-secret-jwt-key-replace-in-production"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> **Offline Local Development (SQLite)**:  
> If you prefer developing locally without setting up PostgreSQL, switch to SQLite with a single command:
> ```bash
> npm run db:sqlite
> ```
> And set `DATABASE_URL="file:./dev.db"` in your `.env`.

### 5. Initialize the Database & Seed
```bash
# Push schema changes to database
npx prisma db push

# Seed companies, roles, and sample data
npm run seed
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint checks |
| `npm run seed` | Seeds companies, roles, and test users into the database |
| `npm run db:postgres` | Switches Prisma datasource to PostgreSQL (Vercel / Neon ready) |
| `npm run db:sqlite` | Switches Prisma datasource to SQLite (zero-config local dev) |
| `npm run db:push` | Pushes the current Prisma schema state directly to the database |

---

## 🔒 Roles & Permissions

ThePrepRoom enforces strict Role-Based Access Control (RBAC):

| Capability | Public / Guest | Student | Admin |
| :--- | :---: | :---: | :---: |
| Browse approved experiences & questions | ✅ | ✅ | ✅ |
| Search companies & view hiring stats | ✅ | ✅ | ✅ |
| Bookmark experiences, questions & companies | ❌ | ✅ | ✅ |
| Submit new interview experiences | ❌ | ✅ | ✅ |
| Add custom job roles under existing companies | ❌ | ✅ | ✅ |
| Report inappropriate content or spam | ❌ | ✅ | ✅ |
| Add new companies to directory | ❌ | ❌ | ✅ |
| Approve / Reject pending interview experiences | ❌ | ❌ | ✅ |
| Resolve or dismiss community flags | ❌ | ❌ | ✅ |
| Enable TOTP 2FA Security | ❌ | ❌ | ✅ |

---

## 🧪 Verification & Automated Testing

The codebase includes automated tests validating core business rules:
- **Canonical Normalization**: Text formatting, punctuation removal, case folding.
- **Deduplication Engine**: Identical questions link to single canonical records.
- **Privacy Enforcement**: Unapproved experiences (`PENDING`, `REJECTED`) are strictly inaccessible to public queries.
- **Data Integrity**: Enforces strict separation of `interviewYear` vs `graduationYear`.

Run the test verification suite:
```bash
npx tsx test-verify.ts
```

---

## 🤝 Contributing

Contributions from students, campus alumni, and developers are warmly welcomed!

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request** against `main`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ for campus placements and engineering students everywhere.</sub>
  <br />
  <strong><a href="https://kkwagh.live">kkwagh.live</a></strong>
</div>

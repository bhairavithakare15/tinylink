# 🔗 TinyLink - URL Shortener

A modern, full-stack URL shortener application built with Next.js 14, Prisma, and PostgreSQL. Create short links, track click statistics, and manage your URLs with a clean, responsive interface.

![TinyLink Dashboard](https://img.shields.io/badge/Status-Live-green) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## 🌐 Live Demo

**Production URL:** [https://your-app.vercel.app](https://your-app.vercel.app)

## ✨ Features

- **Create Short Links** - Generate short URLs with optional custom codes
- **Click Tracking** - Track total clicks and last clicked timestamp
- **Link Statistics** - View detailed stats for each shortened link
- **Search & Filter** - Find links quickly with search and sorting
- **Responsive Design** - Works perfectly on desktop and mobile
- **Real-time Validation** - Inline form validation with error messages
- **Toast Notifications** - Visual feedback for all actions

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Prisma** | Database ORM |
| **PostgreSQL** | Database (Neon) |
| **Tailwind CSS** | Styling |
| **Vercel** | Deployment |

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tinylink.git
cd tinylink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
npx prisma db push
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
tinylink/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── links/
│   │   │       ├── route.ts           # GET/POST /api/links
│   │   │       └── [code]/route.ts    # GET/DELETE /api/links/:code
│   │   ├── code/
│   │   │   └── [code]/page.tsx        # Stats page
│   │   ├── [code]/route.ts            # Redirect handler
│   │   ├── healthz/route.ts           # Health check
│   │   ├── page.tsx                   # Dashboard
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   └── lib/
│       ├── prisma.ts                  # Prisma client
│       └── utils.ts                   # Utility functions
├── .env.example                       # Environment template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Links API

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/api/links` | List all links | `200` |
| `POST` | `/api/links` | Create a new link | `201`, `400`, `409` |
| `GET` | `/api/links/:code` | Get link statistics | `200`, `404` |
| `DELETE` | `/api/links/:code` | Delete a link | `200`, `404` |

### Other Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthz` | Health check endpoint |
| `GET` | `/:code` | Redirect to target URL (302) |

### Create Link Request

```json
POST /api/links
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "code": "mycode1"  // optional, 6-8 alphanumeric characters
}
```

### Response Example

```json
{
  "id": "clxx123abc",
  "code": "mycode1",
  "targetUrl": "https://example.com/very-long-url",
  "clicks": 0,
  "lastClicked": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 📄 Pages

| Path | Description |
|------|-------------|
| `/` | Dashboard - Create, view, and manage links |
| `/code/:code` | Statistics page for a specific link |
| `/healthz` | System health check |
| `/:code` | Redirect to target URL |

## 🧪 Testing Checklist

- [x] `/healthz` returns `200` with `{"ok": true}`
- [x] Creating a link works with valid URL
- [x] Duplicate codes return `409` error
- [x] Redirect works and increments click count
- [x] Deletion removes link (returns `404` after)
- [x] UI is responsive on mobile
- [x] Form validation works correctly

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_BASE_URL`
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-neon-connection-string"
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
```

## 📊 Database Schema

```prisma
model Link {
  id          String    @id @default(cuid())
  code        String    @unique
  targetUrl   String
  clicks      Int       @default(0)
  lastClicked DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

---

Made with ❤️ using Next.js and Prisma
# ShiftTracker - Healthcare Worker Management System

A comprehensive Progressive Web Application (PWA) for healthcare organizations to manage worker shifts with location-based clock in/out functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Your Neon PostgreSQL database is configured

### Installation & Setup

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd healthcare-shift-tracker
   npm install
   \`\`\`

2. **Environment Setup**
   The `.env.local` file is configured with your Neon database:
   \`\`\`env
   DATABASE_URL="postgresql://neondb_owner:npg_QN8AGnKCi9kE@ep-delicate-bonus-advofx1k-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-2024-healthcare-shift-tracker"
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to your Neon database
   npm run db:push
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Register your first account to get started

## 🏥 Features

### For Healthcare Workers:
- **Location-based Clock In/Out** - GPS perimeter validation
- **Real-time Location Tracking** - High-accuracy GPS
- **Shift Notes** - Optional notes for clock in/out events
- **Shift History** - Complete history with duration calculations
- **Mobile-First Design** - Optimized for mobile devices

### For Managers:
- **Perimeter Management** - Set location and radius (up to 5km)
- **Real-time Staff Monitoring** - Live active staff dashboard
- **Comprehensive Analytics** - Charts and statistics
- **Staff Management** - Oversee all workers and shifts

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Ant Design
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT with secure cookies
- **PWA:** Service Workers, Web App Manifest

## 🚀 Getting Started

1. Run `npm install`
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)
6. Register your first account and start using the app!

---

Your healthcare shift tracking application is ready to use with your Neon database!

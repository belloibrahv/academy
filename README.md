# TechVaults Academy

A comprehensive student management system built with React, TypeScript, and Supabase.

## 🚀 Features

### Admin Features
- **Dashboard** - Overview of students, cohorts, and assignments
- **Cohort Management** - Create, edit, and manage student cohorts
- **Invite Link System** - Generate secure invite links for student registration
- **Assignment Management** - Create, edit, and manage assignments
- **Student Management** - View and manage student progress
- **Grading System** - Grade student submissions with feedback

### Student Features
- **Dashboard** - View assignments and progress
- **Assignment Submission** - Submit assignments with files and text
- **Progress Tracking** - Monitor completion status and grades
- **Secure Registration** - Register via invite links with email confirmation

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Package Manager:** pnpm
- **Deployment:** Render

## 📋 Prerequisites

- Node.js 18+ 
- pnpm
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/belloibrahv/academy.git
cd academy
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
VITE_COMPANY_EMAIL=academy@techvaults.com
```

### 4. Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components
│   ├── AssignmentForm.tsx
│   └── CohortForm.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAssignments.ts
│   ├── useCohorts.ts
│   ├── useInviteLinks.ts
│   └── useSubmissions.ts
├── lib/                # External library configurations
│   └── supabase.ts
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── student/        # Student pages
│   ├── Login.tsx
│   └── Register.tsx
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── database.types.ts
└── utils/              # Utility functions
    └── enrollmentHandler.ts
```

## 🔐 Authentication

The application uses Supabase Auth with email confirmation:
- Admin users can login directly
- Students register via invite links
- Email confirmation required for new accounts
- Automatic enrollment after email confirmation

## 🚀 Deployment

### Render Deployment
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy automatically

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email academy@techvaults.com or create an issue in the repository.

---

Built with ❤️ by TechVaults Team
# 🔐 Modern Authentication System with Admin Panel

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?style=for-the-badge&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

*Complete authentication platform with professional admin panel*

[Features](#-key-features) • [Admin Panel](#-administrative-panel) • [Installation](#-installation) • [Deploy](#-deploy-to-vercel)

</div>

---

## 🎯 **About the Project**

A **complete and modern authentication system** with professional admin panel. Built with security best practices, it offers complete management of users, products, and activity logs.

### ✨ **System Highlights**
- 🔐 **Hybrid Authentication** - OAuth (GitHub) + Local credentials
- 🛡️ **Complete Admin Panel** - User, product, and permission management
- 📧 **Email System** - Verification and recovery via EmailJS
- 🔒 **Advanced Security** - JWT, bcrypt, rate limiting, XSS protection
- 🎨 **Modern Interface** - Responsive design with dark/light mode
- ⚡ **Optimized Performance** - Next.js 15 App Router with TypeScript
- 📊 **Complete Analytics** - Real-time metrics, charts, and insights
- 🔐 **Security Logs** - Session tracking and suspicious event monitoring
- 💾 **Automated Backup** - Backup and restore system
- 📈 **Exportable Reports** - PDF, Excel, CSV, and JSON

---

## 🌟 **Key Features**

### 👤 **User Authentication**
- 🔑 **OAuth Login with GitHub** - Native and secure integration
- 📝 **Credential Registration** - Email and password with validation
- ✅ **Email Verification** - Secure links via EmailJS
- 🔐 **Persistent JWT Sessions** - NextAuth v5 with Prisma
- � **Password Recovery** - Secure temporary tokens

### 🛡️ **Administrative Panel**
- 👥 **User Management** - Complete CRUD with search and filters
- 🛍️ **Product Management** - Registration, inventory, categories, and images
- 👨‍💼 **Admin Management** - Permission control (SUPER_ADMIN, ADMIN, EDITOR)
- 📊 **Dashboard with Metrics** - Real-time charts and statistics
- 📋 **Activity Logs** - Complete tracking of administrative actions
- ⚙️ **Settings** - Email, security, appearance, and system
- 🔒 **JWT Authentication** - Secure HTTP-only cookies

### 👤 **Profile Management**
- 🖼️ **Avatar Upload** - Local images with optimization
- ✏️ **Data Editing** - Name, email, and personal information
- 🔑 **Password Change** - Secure modal with strong validation
- 🗑️ **Avatar Reset** - Return to default avatar

### 🎨 **User Experience**
- 🌙 **Dark/Light Mode** - Preference saved locally
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Intelligent Cache** - Service Worker for performance
- 🔔 **Visual Feedback** - Loading states and notifications
- ♿ **Accessibility** - WCAG compliant interface

### 📊 **Analytics & Metrics** ⭐ NEW
- 📈 **Interactive Dashboard** - Real-time charts with Recharts
- 👥 **User Metrics** - Total, new, verification rate
- 📊 **Growth Analysis** - Line and bar charts
- 💻 **Demographics** - Most used devices and browsers
- ⏱️ **Customizable Periods** - 7, 14, 30, or 90 days

### 🔒 **Session Logs & Security** ⭐ NEW
- 🔐 **Active Sessions** - View and revoke connected devices
- 📋 **Complete History** - Login, logout, and action logs
- 🚨 **Security Events** - Monitoring of suspicious activities
- 🌍 **Geolocation** - IP, country, city of each access
- 🔔 **Alerts** - Severity: LOW, MEDIUM, HIGH, CRITICAL

### 💾 **Backup & Restore** ⭐ NEW
- 📦 **Complete Backups** - Manual, Full, Incremental, Differential
- 🎯 **Table Selection** - Choose what to include in backup
- ⬇️ **Download** - Export backups in JSON
- 🔄 **Restore** - Recover data securely
- ⏰ **Scheduling** - Ready for automatic backups

### 📈 **Exportable Reports** ⭐ NEW
- 📄 **Multiple Formats** - CSV, Excel, JSON, PDF
- 📊 **Various Types** - Users, Analytics, Security, Sessions, Audit
- 🎨 **Visual Templates** - Intuitive and modern interface
- 📥 **Easy Download** - Ready-to-use reports
- ⏱️ **Asynchronous Generation** - Does not block the interface

---

## 🔐 **Administrative Panel**

### **Admin Features:**

#### 📊 **Dashboard**
- Real-time metrics (users, products, admins)
- Activity charts with Recharts
- Recent logs of administrative actions
- Cards with quick statistics

#### 👥 **User Management**
- Complete listing with pagination
- Search by name/email
- Filters by status and date
- Actions: Edit, Suspend, Delete
- Administrative password reset
- Complete profile view

#### 🛍️ **Product Management**
- Complete product CRUD
- Multiple image upload
- Stock control
- Categorization
- Status (Active, Inactive, Out of Stock)
- Advanced filters

#### 👨‍💼 **Administrator Management**
- Creation of new admins
- Permission control by role
- Status: Active, Suspended, Inactive
- Last login recorded
- Permission hierarchy

#### 📋 **Activity Logs**
- Record of all admin actions
- Filters by action type
- IP and User Agent tracking
- Data export
- Complete details of each action

#### ⚙️ **Settings**
- General site settings
- Email setup (SMTP)
- Security and authentication
- Appearance and themes
- Notifications

### **Access Permissions:**
- 🔴 **SUPER_ADMIN**: Full system access
- 🟡 **ADMIN**: User and product management
- 🟢 **EDITOR**: Product management only

---

## 🚀 **Project URLs**

### **Main Application:**
- **Homepage**: https://oauth-project-s41ntl0ph3r.vercel.app
- **Login**: https://oauth-project-s41ntl0ph3r.vercel.app/sign-in
- **Register**: https://oauth-project-s41ntl0ph3r.vercel.app/sign-up

### **Administrative Panel:**
- **Admin Login**: https://oauth-project-s41ntl0ph3r.vercel.app/admin/login
- **Initial Setup**: https://oauth-project-s41ntl0ph3r.vercel.app/admin/setup
- **Dashboard**: https://oauth-project-s41ntl0ph3r.vercel.app/admin

---

## 🛠️ **Instalação**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git
- PostgreSQL (or account on Neon/PlanetScale)

### **Step by Step**

```bash
# Clone the repository
git clone https://github.com/S41ntL0ph3r/oauth-project.git
cd oauth-project

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### **GitHub OAuth Configuration**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Configure:
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Add credentials in `.env.local`

### **Required Environment Variables**
```env
# Authentication
AUTH_SECRET="your-secret-key-64-characters"
ADMIN_JWT_SECRET="different-admin-key-64-characters"

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Base URL
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 **Deploy to Vercel**

### **Quick Setup:**

1. **Connect to GitHub** and configure variables in Vercel:
```bash
AUTH_SECRET="your-super-secret-key-64-characters"
ADMIN_JWT_SECRET="different-admin-key-64-characters"
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

2. **Configure GitHub OAuth:**
   - Callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

3. **Access `/admin/setup`** to create the first administrator

### **Recommended Database:**
- **Neon**: https://neon.tech (Free PostgreSQL)
- **PlanetScale**: https://planetscale.com (Free MySQL)

---

## 🔧 **Technologies**

### **Frontend**
- **Next.js 15.5.9** - React Framework with App Router
- **TypeScript 5.9** - Static typing
- **Tailwind CSS** - Responsive styling
- **Lucide React** - Modern icons
- **Recharts** - Charts and dashboards

### **Backend**
- **NextAuth v5** - Complete authentication
- **Prisma 6.16.3** - Type-safe ORM
- **PostgreSQL** - Production database
- **bcryptjs** - Password hashing (12 rounds)
- **jsonwebtoken** - JWT for admin panel

### **Security**
- **HTTP-only cookies** - Secure tokens
- **Rate limiting** - Brute force protection
- **XSS protection** - Security headers
- **Input validation** - Data sanitization
- **Role-based access** - Permission control

---

## 📁 **Project Structure**

```
oauth-project/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (auth)/          # Authentication pages
│   │   ├── 📁 (protected)/     # Protected pages (users)
│   │   ├── 📁 admin/           # Administrative panel
│   │   └── 📁 api/             # API routes
│   ├── 📁 components/          # Reusable components
│   │   ├── 📁 admin/           # Admin components
│   │   └── 📁 ui/              # UI components
│   ├── 📁 contexts/            # React contexts
│   ├── 📁 hooks/               # Custom hooks
│   └── 📁 lib/                 # Utilities and configurations
│       └── 📁 admin/           # Admin utilities
├── 📁 prisma/                  # Schema and migrations
└── 📁 public/                  # Static files
```

---

## 🚀 **Available Scripts**

```bash
npm run dev          # Development server
npm run build        # Production build  
npm run start        # Production server
npm run lint         # Code verification
npm run type-check   # TypeScript verification
```

---

## � **Deploy to Vercel**

### **Quick Setup:**

1. **Connect to GitHub** and configure variables in Vercel:
```bash
AUTH_SECRET="your-super-secret-key-64-characters"
ADMIN_JWT_SECRET="different-admin-key-64-characters"
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

2. **Configure GitHub OAuth:**
   - Callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

3. **Access `/admin/setup`** to create the first administrator

### **Recommended Database:**
- **Neon**: https://neon.tech (Free PostgreSQL)
- **PlanetScale**: https://planetscale.com (Free MySQL)

---

## 📈 **Future Roadmap**

- [ ] 📊 **Advanced charts and reports**
- [ ] 💾 **Data export** (CSV/PDF)
- [ ] 🔔 **Push notifications** for due dates
- [ ] 📱 **PWA** for mobile installation
- [ ] 🌐 **Multi-language** (i18n)
- [ ] 🏦 **Banking integration** via Open Banking
- [ ] 🤖 **AI for automatic categorization**
- [ ] 📱 **Native mobile app**

---

## 🤝 **Contributing**

Contributions are always welcome! If you have ideas to improve this project:

1. 🍴 Fork the project
2. 🌟 Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 👨‍💻 **Author**

**Gabriel Moreira**
- GitHub: [@S41ntL0ph3r](https://github.com/S41ntL0ph3r)
- Email: allmightmoreira@gmail.com

---

<div align="center">

**⭐ If this project helped you, consider giving it a star!**

*Developed for educational purposes and focused on improving programming skills in practice.*

</div>

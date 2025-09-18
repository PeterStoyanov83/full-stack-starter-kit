# AI Tools Management Platform - Full-Stack Development Environment

Advanced AI tools catalog with role-based access, 2FA security, and comprehensive admin panel.

**Last Updated**: September 2025
**Version**: 2.0.0 - Production Ready

## 🚀 Tech Stack & Features

- **Frontend**: Next.js + React + TypeScript (Port 8200)
- **Backend**: Laravel + PHP 8.2 + Nginx (Port 8201)
- **Database**: MySQL 8.0 (Port 8203)
- **Cache**: Redis 7 (Port 8204)
- **Development Tools**: Alpine container (Port 8205)

### 🔐 Security Features
- **Two-Factor Authentication (2FA)** - Google Authenticator support
- **Role-Based Access Control** - Owner, Frontend, Backend, PM, QA, Designer roles
- **JWT Authentication** - Laravel Sanctum tokens
- **Activity Logging** - Comprehensive audit trail
- **Profile Activation** - Mandatory 2FA for new users

### 🛠️ Management Features
- **Tool Approval Workflow** - Pending → Approved → Published
- **Admin Panel** - User management, system statistics, tool moderation
- **Redis Caching** - Performance optimization for categories and counts
- **Content Management** - Categories, tags, tool metadata
- **Export Functions** - Activity logs, user data (JSON/CSV)

## 📋 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-tools-management-platform
   ```

2. **Start the environment:**
   ```bash
   ./start.sh
   ```

3. **Setup Laravel backend:**
   ```bash
   ./laravel-setup.sh
   ```
   This script will:
   - Copy `.env.example` to `.env`
   - Install PHP dependencies
   - Generate application key
   - Run database migrations
   - Optionally seed the database

4. **Access your applications:**
   - **Frontend**: http://localhost:8200
   - **Backend API**: http://localhost:8201
   - **API Status**: http://localhost:8201/api/status
   - **Redis Stats**: http://localhost:8201/api/redis/stats

5. **Default Admin Account:**
   - Email: `admin@example.com`
   - Password: `password`
   - Role: Owner (full admin access)

### Important Notes
- The setup script automatically configures all necessary environment variables
- Database passwords are pre-configured to work with Docker containers
- No manual configuration needed - everything works out of the box!

6. **Stop the environment:**
   ```bash
   ./stop.sh
   ```

## 🎯 Key Features Overview

### User Roles & Permissions
- **Owner**: Full system access, user management, tool approval
- **Frontend/Backend/QA**: Tool creation, editing own tools
- **PM/Designer**: Tool creation, project management features

### Security Flow
1. **User Registration** → Inactive profile
2. **Mandatory 2FA Setup** → Google Authenticator required
3. **Profile Activation** → Full system access
4. **Activity Logging** → All actions tracked

### Tool Management Workflow
1. **Tool Creation** → Pending status (non-owners)
2. **Admin Review** → Approve/Reject with reasons
3. **Publication** → Active tools visible to all users
4. **Statistics** → Usage tracking and reporting

## 🔧 Management Scripts

- `./start.sh` - Start all services with auto-setup
- `./stop.sh` - Stop all services
- `./laravel-setup.sh` - Full Laravel initialization
- `./db-manage.sh` - Database management utilities

## 📁 Project Structure

```
vibecode-full-stack-starter-kit/
├── frontend/             # Next.js application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── package.json     # Frontend dependencies
│   └── next.config.js   # Next.js configuration
├── backend/             # Laravel application
│   ├── app/             # Application code
│   ├── public/          # Web root
│   ├── routes/          # API routes
│   ├── database/        # Migrations, seeders
│   ├── .env            # Laravel configuration
│   └── composer.json    # Backend dependencies
├── nginx/              # Nginx configuration
├── docker/             # Docker configurations
├── mysql/init/         # Database initialization
├── tools/              # Development utilities
├── Documentation/      # Project documentation
│   ├── DEVELOPMENT_LOG.md         # Development progress log
│   ├── TASK_COMPLETION_WORKFLOW.md # Task workflow documentation
│   ├── liquid_glass_prompt_template.md # Prompt engineering template
│   └── prompt.md                  # Project prompts and requirements
├── docker-compose.yml  # Container orchestration
├── CLAUDE.md          # Claude Code guidance
└── README.md          # This documentation
```

## 🐳 Docker Services

All services are isolated with unique names: `vibecode-full-stack-starter-kit_*`

- **frontend** - Next.js development server
- **backend** - Nginx reverse proxy
- **php_fpm** - PHP-FPM for Laravel
- **mysql** - MySQL 8.0 database
- **redis** - Redis cache server
- **tools** - Development utilities container

## 🔗 API Endpoints

### Public Endpoints
```bash
GET  /api/status                    # System health check
GET  /api/redis/stats              # Redis monitoring
GET  /api/categories               # List categories
GET  /api/tags                     # List tags
POST /api/login                    # User authentication
```

### Protected Endpoints (Requires Authentication)
```bash
# User Profile
GET  /api/user                     # Get current user
GET  /api/dashboard               # Dashboard data
POST /api/logout                  # User logout

# Tools Management
GET  /api/tools                   # List tools (with filters)
POST /api/tools                   # Create new tool
GET  /api/tools/{id}             # Get tool details
PUT  /api/tools/{id}             # Update tool
DELETE /api/tools/{id}           # Delete tool

# Two-Factor Authentication
GET  /api/2fa/status             # Get 2FA status
GET  /api/2fa/methods            # Available 2FA methods
POST /api/2fa/setup              # Setup 2FA method
POST /api/2fa/verify             # Verify and enable 2FA
POST /api/2fa/disable            # Disable 2FA
GET  /api/2fa/qr-code            # Get QR code for Google Authenticator
POST /api/2fa/backup-codes       # Generate backup codes

# Activity Logs
GET  /api/activity-logs/my-logs  # User's own activity
GET  /api/activity-logs/summary  # Activity summary
```

### Admin-Only Endpoints (Owner Role Required)
```bash
# Tool Approval
GET  /api/tools-pending          # Pending tools for review
POST /api/tools/{id}/approve     # Approve tool
POST /api/tools/{id}/reject      # Reject tool
GET  /api/tools/approval/stats   # Approval statistics

# User Management
GET  /api/users                  # List all users
POST /api/users                  # Create user
PUT  /api/users/{id}            # Update user
DELETE /api/users/{id}          # Delete user
GET  /api/admin/stats           # System statistics

# Activity Logs (Admin)
GET  /api/activity-logs         # All activity logs
GET  /api/activity-logs/critical # Critical activities
POST /api/activity-logs/export  # Export logs (JSON/CSV)
```

## 💻 Development Commands

### Frontend Development
```bash
# Access frontend container
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install package-name

# View frontend logs
docker compose logs frontend -f
```

### Backend Development
```bash
# Access PHP container
docker compose exec php_fpm sh

# Laravel Artisan commands
docker compose exec php_fpm php artisan --version
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan make:controller UserController
docker compose exec php_fpm php artisan make:model Product -m

# Composer commands
docker compose exec php_fpm composer install
docker compose exec php_fpm composer require laravel/sanctum

# View backend logs
docker compose logs backend -f
docker compose logs php_fpm -f
```

### Database Operations
```bash
# Connect to MySQL
./db-manage.sh connect

# Create backup
./db-manage.sh backup

# Connect to Redis
./db-manage.sh redis

# Direct MySQL access
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app
```

## 🔐 Database Configuration

**MySQL Credentials:**
- Host: mysql (internal) / localhost:8203 (external)
- Database: vibecode-full-stack-starter-kit_app
- Username: root
- Password: vibecode-full-stack-starter-kit_mysql_pass

**Redis Configuration:**
- Host: redis (internal) / localhost:8204 (external)  
- Password: vibecode-full-stack-starter-kit_redis_pass

## 🧪 Testing

### Backend Tests (Laravel PHPUnit)
```bash
# Run all tests
docker-compose exec php_fpm php artisan test

# Run specific test suite
docker-compose exec php_fpm php artisan test --testsuite=Feature
docker-compose exec php_fpm php artisan test --testsuite=Unit

# Run with coverage
docker-compose exec php_fpm vendor/bin/phpunit --coverage-html coverage

# Test specific functionality
docker-compose exec php_fpm php artisan test tests/Feature/TwoFactorAuthTest.php
docker-compose exec php_fpm php artisan test tests/Feature/ToolManagementTest.php
docker-compose exec php_fpm php artisan test tests/Feature/UserManagementTest.php
```

### Frontend Tests (Jest + React Testing Library)
```bash
# Run all tests
docker-compose exec frontend npm test

# Run tests in watch mode
docker-compose exec frontend npm test -- --watch

# Run with coverage
docker-compose exec frontend npm test -- --coverage

# Run specific test file
docker-compose exec frontend npm test AdminPanel.test.tsx
```

### Test Coverage
- **Authentication**: Login/logout, JWT tokens, role validation
- **Two-Factor Authentication**: Setup, verification, Google Authenticator
- **Tool Management**: CRUD operations, approval workflow, status filtering
- **User Management**: Admin operations, role assignments
- **Activity Logging**: Audit trail, filtering, export functions
- **Admin Panel**: UI components, form validation, data loading

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Check if ports 8200-8205 are available
   - Use `netstat -tulpn | grep :PORT` to check port usage

2. **Permission issues:**
   - Run `./laravel-setup.sh` to fix Laravel permissions

3. **Services not starting:**
   - Check Docker is running: `docker ps`
   - View logs: `docker compose logs`

### Useful Commands

```bash
# Check service status
docker compose ps

# View all logs
docker compose logs -f

# Restart specific service
docker compose restart frontend
docker compose restart backend

# Rebuild services
docker compose up -d --build

# Clean up (removes containers and volumes)
docker compose down -v
```

## 📊 Monitoring

- **Service Status**: `docker compose ps`
- **Resource Usage**: `docker stats`
- **Logs**: `docker compose logs -f [service_name]`

## 🔄 Updates

To update the environment:
1. Pull latest images: `docker compose pull`
2. Rebuild services: `docker compose up -d --build`

---

**Generated with create-fullstack-env.sh**  
**Project ID**: vibecode-full-stack-starter-kit  
**Created**: Thu Sep  4 01:37:12 PM EEST 2025

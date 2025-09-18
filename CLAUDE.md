# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise-grade AI Tools Management Platform with comprehensive security, role-based access control, and administrative features. Built with Next.js frontend, Laravel backend, and containerized services.

**Tech Stack:**
- Frontend: Next.js + React + TypeScript (Port 8200)
- Backend: Laravel 11 + PHP 8.2 + Nginx (Port 8201)
- Database: MySQL 8.0 (Port 8203)
- Cache: Redis 7 (Port 8204)
- Development Tools: Alpine container (Port 8205)

**Key Features:**
- Two-Factor Authentication (Google Authenticator)
- Role-Based Access Control (6 roles)
- Tool Approval Workflow
- Activity Logging & Audit Trail
- Redis Performance Caching
- Comprehensive Admin Panel
- Profile Activation System

## Essential Commands

**Environment Management:**
```bash
./start.sh                   # Start all Docker services
./stop.sh                    # Stop all services
./laravel-setup.sh          # Setup Laravel backend
./db-manage.sh              # Database management
```

**Backend Development (Laravel via Docker):**
```bash
docker-compose exec php_fpm composer install    # Install PHP dependencies
docker-compose exec php_fpm php artisan migrate # Run database migrations
docker-compose exec php_fpm php artisan db:seed # Seed database
docker-compose exec php_fpm php artisan test    # Run tests
docker-compose exec php_fpm php artisan cache:warm        # Warm up Redis cache
docker-compose exec php_fpm php artisan cache:clear-app   # Clear app cache
```

**Frontend Development (Next.js via Docker):**
```bash
docker-compose exec frontend npm install        # Install Node dependencies
docker-compose exec frontend npm run build     # Production build
docker-compose exec frontend npm run lint      # Run linting
```

**Docker Operations:**
```bash
docker-compose up -d        # Start services in background
docker-compose down         # Stop and remove containers
docker-compose logs -f      # Follow logs
docker-compose exec php_fpm bash   # Access PHP container
docker-compose exec frontend sh    # Access frontend container
docker-compose exec mysql mysql -u root -p  # Access MySQL directly
```

## Service Access

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:8201
- **API Status**: http://localhost:8201/api/status
- **MySQL**: localhost:8203 (user: root, password: root)
- **Redis**: localhost:8204

## Architecture

### Backend (Laravel)
- Located in `backend/` directory
- PHP 8.2 with Nginx server
- MySQL database with migrations
- RESTful API endpoints
- JWT authentication ready
- Docker containerized

### Frontend (Next.js)
- Located in `frontend/` directory
- TypeScript configuration
- React components
- API integration with backend
- Hot reload development
- Docker containerized

### Infrastructure
- `docker-compose.yml` - Multi-service orchestration
- `nginx/` - Web server configuration
- `mysql/` - Database initialization
- `tools/` - Development utilities

## Development Workflow

1. **Initial Setup:**
   - Run `./start.sh` to launch all services
   - Run `./laravel-setup.sh` for Laravel configuration
   - Access frontend at http://localhost:8200

2. **Backend Development:**
   - API endpoints in `backend/routes/api.php`
   - Controllers in `backend/app/Http/Controllers/`
   - Models in `backend/app/Models/`
   - Database migrations in `backend/database/migrations/`

3. **Frontend Development:**
   - Pages in `frontend/pages/` or `frontend/app/`
   - Components in `frontend/components/`
   - API calls typically in `frontend/lib/` or service files

4. **Database Management:**
   - Use `./db-manage.sh` for common database operations
   - Migrations: `docker-compose exec php_fpm php artisan migrate`
   - Seeding: `docker-compose exec php_fpm php artisan db:seed`

## Important Files

- `Documentation/DEVELOPMENT_LOG.md` - Development progress and decisions
- `Documentation/TASK_COMPLETION_WORKFLOW.md` - Task management workflow
- `Documentation/liquid_glass_prompt_template.md` - Prompt engineering template
- `Documentation/prompt.md` - Project prompts and requirements
- `backend/.env` - Environment configuration
- `docker-compose.yml` - Service definitions

## Testing

**Backend Testing:**
```bash
docker-compose exec php_fpm php artisan test                    # Run all tests
docker-compose exec php_fpm php artisan test --testsuite=Feature # Feature tests only
docker-compose exec php_fpm php artisan test --testsuite=Unit   # Unit tests only
docker-compose exec php_fpm vendor/bin/phpunit --coverage-html coverage # With coverage
```

**Frontend Testing:**
```bash
docker-compose exec frontend npm test                          # Run all tests
docker-compose exec frontend npm test -- --watch             # Watch mode
docker-compose exec frontend npm test -- --coverage          # With coverage
docker-compose exec frontend npm test AdminPanel.test.tsx    # Specific test file
```

**Test Coverage:**
- Authentication (login/logout, JWT tokens)
- Two-Factor Authentication (setup, verification, Google Authenticator)
- Tool Management (CRUD, approval workflow, status filtering)
- User Management (admin operations, role assignments)
- Activity Logging (audit trail, filtering, export)
- Admin Panel (UI components, form validation)
- API Integration (error handling, data loading)

## Troubleshooting

- **Services not starting**: Check `docker-compose logs`
- 
- **Database connection issues**: Verify MySQL container is healthy
- **Port conflicts**: Ensure ports 8200-8205 are available
- **Permission issues**: Check Docker daemon permissions 
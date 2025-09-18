# Claude Workflow Configuration - Vibecode Full-Stack Starter Kit

## Project Context
**Project**: Full-Stack Authentication System with Role-Based Access
**Tech Stack**: Laravel 12 + Next.js 15 + MySQL 8 + Redis 7 + Docker
**Languages**: English (development) + Bulgarian (UI messages)
**Environment**: Docker containerized development

## Success Criteria
✅ **Успешно стартирана система в Docker** - All containers operational
✅ **Работещ вход с всички роли** - Authentication working for all user roles
✅ **Next.js показва данни от Laravel backend** - Frontend displaying backend data

## Custom Claude Commands

### Development Commands
- `/status` - Check all Docker services and current progress
- `/seed-users` - Create database with test users and roles
- `/test-login [email]` - Test authentication with specific user account
- `/roles-check` - Verify role system functionality and permissions
- `/frontend-connect` - Set up Next.js ↔ Laravel API integration
- `/deploy-auth` - Complete authentication system deployment
- `/dev-log [message]` - Add entry to development progress log
- `/docker-logs [service]` - Check specific Docker container logs
- `/api-test [endpoint]` - Test specific Laravel API endpoint

### Specialized Commands
- `/bulgarian-ui` - Implement Bulgarian language UI elements
- `/role-dashboard` - Create role-specific dashboard content
- `/auth-middleware` - Configure Laravel authentication middleware
- `/next-auth` - Set up Next.js authentication context
- `/integration-test` - Run complete frontend-backend integration tests

## Specialized Subagents Configuration

### AuthAgent - Laravel Authentication System
**Purpose**: Handle all Laravel authentication, sessions, and security
**Responsibilities**:
- Laravel Sanctum installation and configuration
- Authentication routes and controllers
- Session management and token handling
- Security middleware implementation
- Password hashing and validation

**Tools Access**: Backend files, database, API testing
**Context**: Laravel security best practices, API authentication patterns

### RoleAgent - User Roles & Permissions System
**Purpose**: Implement role-based access control system
**Responsibilities**:
- User roles migration and database design
- Role-based middleware and guards
- Permission system architecture
- User seeding with specific roles
- Role validation and authorization

**Tools Access**: Database migrations, seeders, models, middleware
**Context**: Laravel authorization, role-based systems

### UIAgent - Next.js Frontend Development
**Purpose**: Build user interface and frontend components
**Responsibilities**:
- Next.js component architecture
- Authentication UI components
- Bulgarian language integration
- Layout and navigation systems
- Responsive design implementation

**Tools Access**: Frontend files, styling, components
**Context**: Next.js 15 app router, TypeScript, Tailwind CSS

### APIAgent - Laravel API Development
**Purpose**: Create and manage Laravel API endpoints
**Responsibilities**:
- RESTful API design and implementation
- API route configuration
- JSON response formatting
- Error handling and validation
- API documentation and testing

**Tools Access**: Laravel controllers, routes, middleware
**Context**: Laravel API development, JSON APIs, HTTP status codes

### TestAgent - Integration Testing & Verification
**Purpose**: Test complete system functionality
**Responsibilities**:
- Authentication flow testing
- Role-based access verification
- Frontend-backend integration testing
- Bulgarian text rendering validation
- Performance and security testing

**Tools Access**: All system components, testing tools
**Context**: Full-stack testing, integration testing, user acceptance testing

## Development Rules & Guidelines

### Code Standards
- **Laravel**: Follow Laravel conventions, use Eloquent ORM
- **Next.js**: Use TypeScript, app router, server/client components appropriately
- **Database**: Use migrations for schema changes, seeders for test data
- **API**: RESTful design, consistent JSON responses, proper HTTP status codes
- **Security**: Validate all inputs, use CSRF protection, sanitize outputs

### Bulgarian Language Integration
- **UI Messages**: All user-facing messages in Bulgarian
- **Greetings**: "Добре дошъл, [Name]! Ти си с роля: [Role]."
- **Error Messages**: Translate authentication errors to Bulgarian
- **Navigation**: Menu items and buttons in Bulgarian where appropriate

### Docker Development Workflow
- **Container Access**: Use `docker compose exec [service]` for command execution
- **Logs Monitoring**: Regular check of container logs for issues
- **Service Restart**: Restart services after configuration changes
- **Volume Management**: Ensure data persistence for database and uploads

### Testing Requirements
- **Authentication**: Test login/logout with all 3 seeded users
- **Roles**: Verify each role displays correct dashboard content
- **API Integration**: Confirm frontend receives and displays backend data
- **UI/UX**: Validate Bulgarian text renders correctly
- **Performance**: Check response times and container resource usage

## Required Test Users (Exact Specifications)
```
Name               Role      Email                     Password
Иван Иванов       owner     ivan@admin.local          password
Елена Петрова     frontend  elena@frontend.local     password
Петър Георгиев    backend   petar@backend.local      password
```

## File Organization Standards
```
/prompt.md                                    # This configuration file
/DEVELOPMENT_LOG.md                           # Daily progress tracking
/backend/
  ├── database/migrations/                    # Database schema changes
  ├── database/seeders/                       # Test data generation
  ├── routes/api.php                          # API endpoint definitions
  ├── app/Http/Controllers/                   # Business logic controllers
  ├── app/Models/                             # Database models
  └── app/Http/Middleware/                    # Authentication middleware
/frontend/
  ├── src/lib/                                # Utility functions
  ├── src/contexts/                           # React contexts
  ├── src/components/                         # Reusable components
  └── src/app/                                # Next.js pages and layouts
```

## Progress Tracking System
- **Daily Log Updates**: Record completed tasks, decisions made, issues resolved
- **Milestone Tracking**: Major feature completions and system integrations
- **Issue Documentation**: Problems encountered and solutions implemented
- **Code Change History**: Significant modifications and their impact
- **Testing Results**: Authentication tests, integration tests, user acceptance

## Emergency Procedures
- **Container Issues**: Check logs, restart services, verify ports
- **Database Problems**: Verify connection, check migrations, restore from backup
- **Authentication Failures**: Check API endpoints, validate credentials, review logs
- **Frontend Errors**: Check console errors, verify API calls, validate data flow

---

**Last Updated**: 2025-09-15
**Project Phase**: Initial Development - Authentication System Implementation
**Current Focus**: Laravel Sanctum + Next.js Authentication Integration
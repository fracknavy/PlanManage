# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Internationalization (i18n) support
- Multi-language support (Chinese, English)
- Real-time collaboration features
- Advanced analytics dashboard

### Changed
- Improved performance for large task lists
- Enhanced mobile responsiveness

### Fixed
- Minor UI inconsistencies

## [0.3.0] - 2024-06-13

### Added
- **Enterprise-grade optimizations**
  - Environment variable validation and security
  - API authentication middleware
  - React ErrorBoundary components
  - ESLint and Prettier configuration
  - Rate limiting for API endpoints
  - Health check endpoint
  - Docker support
  - CI/CD with GitHub Actions
  - Comprehensive testing setup (Vitest, Playwright)
  - Performance monitoring
  - Security enhancements (CSRF, XSS protection)
  - Caching utilities
  - Data export (CSV, JSON, iCal)
  - Task list pagination
  - Dark mode support
  - SEO optimization (sitemap, robots.txt, Open Graph)
  - Accessibility improvements (WCAG 2.1 AA)
  - PWA support
  - Audit logging
  - User avatar upload
  - Custom tags system
  - Password reset functionality
  - Email verification
  - Team collaboration features
  - WebSocket real-time sync
  - Mobile gesture support
  - API documentation
  - User manual
  - Developer documentation

### Changed
- Updated project documentation
- Improved code organization
- Enhanced error handling
- Optimized database queries

### Fixed
- User settings hardcoded values
- Environment variable security issues
- Database migration management

## [0.2.0] - 2024-06-13

### Added
- **Subtask functionality**
  - Subtask UI component
  - Subtask creation and editing
  - Subtask progress display
  - Subtask drag-and-drop sorting
- **Recurring tasks**
  - RRULE parsing logic
  - Recurring task creation UI
  - Automatic recurring task generation
  - Recurring task editing
- **Break time management**
  - Skip break functionality
  - Break countdown timer
  - Break end notification
  - Browser notification support

### Changed
- Updated task creation page
- Updated task editing page
- Updated task list page
- Updated schedule page

### Fixed
- Subtask display issues
- Recurring task generation bugs
- Break timer synchronization

## [0.1.1] - 2024-06-12

### Added
- Missing dependencies (next-auth, bcrypt)
- TypeScript type definitions
- Missing imports (RefreshCw, ListTodo)

### Changed
- Moved authOptions to separate file
- Updated project documentation

### Fixed
- Module not found errors
- TypeScript type errors
- Next.js route export limitations
- Missing import statements

## [0.1.0] - 2024-06-12

### Added
- **Initial project structure**
  - Next.js 14 App Router
  - TypeScript configuration
  - Tailwind CSS + shadcn/ui
  - Prisma ORM setup
  - Environment variables
- **Database schema**
  - User model
  - Task model
  - Schedule model
  - ScheduleItem model
  - LinkParse model
- **Authentication system**
  - NextAuth.js configuration
  - Login page
  - Registration page
  - API routes (/api/auth/*)
  - Route protection middleware
- **Task management**
  - Task list page with filters
  - Create task page
  - Edit task page
  - Delete task functionality
  - Complete task functionality
  - API routes (/api/tasks/*)
- **Schedule functionality**
  - Today view
  - Week view
  - Drag-and-drop sorting (dnd-kit)
  - Auto-generate schedule
  - API routes (/api/schedule/*)
- **Link parsing**
  - URL parsing functionality
  - Extract title, description, cover image
  - Parse history
  - One-click task creation
- **Settings page**
  - Work time settings
  - Break time settings
  - Default task weight settings
- **Auto-scheduling algorithm**
  - Weight calculation (weight, priority, due date)
  - Fixed task priority scheduling
  - Conflict detection
  - Auto-insert break time

---

## Version History

- **0.3.0** - Enterprise-grade optimizations and comprehensive feature set
- **0.2.0** - Subtask, recurring tasks, and break time management
- **0.1.1** - Bug fixes and dependency updates
- **0.1.0** - Initial release with core functionality

---

## Upcoming Features

### v0.4.0 (Planned)
- Advanced reporting and analytics
- Calendar integration (Google Calendar, Outlook)
- Mobile app (React Native)
- API rate limiting dashboard
- Multi-tenant support

### v0.5.0 (Planned)
- AI-powered task suggestions
- Natural language task creation
- Smart scheduling recommendations
- Integration with third-party services

---

*For more details, see the [README](README.md) and [documentation](docs/).*

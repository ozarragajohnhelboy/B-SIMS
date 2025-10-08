# B-SIMS (Barangay Smart Information Management System)

## Overview
A comprehensive barangay management system built with Django REST API backend and React.js frontend.

## Features
- **Resident Management**: Complete CRUD operations with QR code generation
- **Household Management**: Family-based grouping and management
- **Document Management**: Request tracking and PDF generation
- **Blotter System**: Incident reporting and case tracking
- **Reports & Analytics**: Comprehensive statistics dashboard
- **Settings**: System configuration and preferences
- **Real-time Clock**: Philippines timezone display

## Tech Stack
- **Backend**: Django + Django REST Framework + PostgreSQL
- **Frontend**: React.js + TailwindCSS
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (development) / PostgreSQL (production)

## Project Structure
```
bims_backend/          # Django backend
├── accounts/          # User authentication
├── residents/         # Resident management
├── core/             # System configuration
└── bims_backend/     # Main settings

bims_admin/           # React frontend
├── src/
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   └── services/     # API services
└── public/           # Static files
```

## Installation & Setup

### Backend Setup
1. Clone the repository
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create superuser: `python manage.py createsuperuser`
7. Start server: `python manage.py runserver`

### Frontend Setup
1. Navigate to frontend: `cd bims_admin`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Default Credentials
- **Username**: admin
- **Password**: admin123

## API Endpoints
- Authentication: `/api/auth/`
- Residents: `/api/residents/`
- Settings: `/api/core/`

## Phase Status
- ✅ **Phase 1**: System Foundation & Architecture
- ✅ **Phase 2**: Core Barangay Modules
- 🔄 **Phase 3**: Advanced Features (Coming Soon)

## Development Rules
- No comments or icons in code
- Well-organized project structure
- Professional design standards
- Enterprise-level architecture

## License
This project is proprietary software for barangay management systems.
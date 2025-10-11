# B-SMIS (Barangay Smart Information Management System)

## Project Structure

```
B-SMIS/
├── bims_backend/          # Django backend API
├── bims_admin/           # React frontend admin panel
├── static/              # Static files
│   ├── qr_codes/        # QR code images
│   ├── uploads/         # User uploads
│   └── logos/           # Custom logos
├── accounts/            # User authentication
├── residents/           # Resident management
├── financial/           # Financial management
├── projects/            # Project management
├── announcements/       # Announcement system
├── core/               # Core utilities
└── requirements.txt     # Python dependencies
```

## Features

- **Resident Management**: Complete resident database with household tracking
- **Financial Management**: Income, expenses, and transparency reporting
- **Project Management**: Community projects with photo documentation
- **Announcement System**: Public announcements and notifications
- **Document Management**: Document requests and QR code generation
- **User Management**: Role-based access control
- **Settings**: Customizable appearance and configuration

## Technology Stack

- **Backend**: Django REST Framework
- **Frontend**: React with Tailwind CSS
- **Database**: SQLite (development)
- **Authentication**: JWT tokens
- **File Storage**: Local file system

## Installation

1. Clone the repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install Node.js dependencies: `cd bims_admin && npm install`
4. Run migrations: `python manage.py migrate`
5. Start backend: `python manage.py runserver`
6. Start frontend: `cd bims_admin && npm start`

## Configuration

- Copy `env.example` to `.env` and configure environment variables
- Customize settings in `bims_backend/settings.py`
- Upload custom logos through the admin panel settings
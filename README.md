# Worksite Management Studio Online

A comprehensive web application for managing construction worksites, projects, and workers with real-time monitoring capabilities.

## Overview

Worksite Management Studio Online is a full-stack application designed to help construction companies efficiently manage their projects, worksites, and workforce. The application provides real-time tracking, resource allocation, and reporting capabilities to optimize construction operations.

## Features

- **User Authentication & Authorization**
  - Secure login/registration system
  - Role-based access control (Admin/Regular users)
  - Activity logging for user actions

- **Project Management**
  - Create, view, update, and delete construction projects
  - Track project status, timeline, and location
  - Filter and search projects by various criteria

- **Worker Management**
  - Maintain a database of all workers with personal and professional details
  - Track worker assignments across projects
  - Monitor worker qualifications and performance

- **Worksite Monitoring**
  - Interactive maps with geolocation features for worksites
  - Assign workers to specific worksites
  - Track worksite progress and status

- **Dashboard & Analytics**
  - Visual representation of key metrics
  - Worker distribution charts
  - Salary and age demographic analysis
  - Position distribution visualization

- **Admin Features**
  - User management capabilities
  - System-wide activity monitoring
  - Generate detailed reports

## Tech Stack

### Frontend
- React 19 with TypeScript
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Recharts for data visualization
- Leaflet for maps integration
- Vite as build tool

### Backend
- Go (Golang)
- Echo framework for API endpoints
- GORM for database operations
- PostgreSQL database
- JWT authentication

## Architecture

The application follows a modern client-server architecture:

- **Frontend**: Single-page application (SPA) built with React and TypeScript
- **Backend**: RESTful API built with Go/Echo framework
- **Database**: PostgreSQL for data persistence
- **Cache Layer**: For optimized performance
- **Security**: JWT-based authentication and middleware protection

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Go 1.18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Go dependencies:
   ```
   go mod download
   ```

3. Configure environment variables (create a `.env` file based on the structure below):
   ```
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=worksite_management_individual_entities
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```
   go run main.go
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Start the development server:
   ```
   pnpm dev
   ```

4. The application will be available at `http://localhost:5173`

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Workers**: `/api/workers`
- **Projects**: `/api/projects`
- **Admin**: `/api/admin/users`, `/api/admin/users/:id/activity`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Echo Framework](https://echo.labstack.com/)
- [GORM](https://gorm.io/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) 

# Architecture Overview

## Overview

Dorry Architect is a full-stack web application designed for architectural planning and project management. It allows architects to create, manage, and visualize building projects with features for environmental analysis, bill of quantities (BOQ) generation, and design collaboration. The application has a particular focus on Middle Eastern/Islamic architectural styling, as evidenced by the cultural style references in the schema.

The system follows a modern client-server architecture with a clear separation between frontend and backend components. It employs a React-based frontend with a Node.js/Express backend, connected to a PostgreSQL database using Drizzle ORM.

## System Architecture

The application follows a three-tier architecture:

1. **Client Tier**: A React-based single-page application with TypeScript, utilizing shadcn/ui components and Tailwind CSS for styling.
2. **Server Tier**: An Express.js server that handles API requests, authentication, and integrates with external services.
3. **Data Tier**: A PostgreSQL database managed through Drizzle ORM with a well-defined schema for projects, designs, users, and BOQs.

### Architectural Diagram

```
┌─────────────────┐      ┌────────────────────┐      ┌─────────────────┐
│                 │      │                    │      │                 │
│  React Frontend │<────>│  Express.js Server │<────>│  PostgreSQL DB  │
│   (SPA/Vite)    │      │                    │      │  (Drizzle ORM)  │
│                 │      │                    │      │                 │
└─────────────────┘      └────────────────────┘      └─────────────────┘
                                  ↑
                                  │
                         ┌────────┴───────┐
                         │                │
                         │ External APIs  │
                         │ - Weather API  │
                         │ - TTS Services │
                         │                │
                         └────────────────┘
```

## Key Components

### Frontend Architecture

1. **Client Application**
   - Built with React, TypeScript, and Vite for fast development and production builds
   - Uses wouter for lightweight client-side routing
   - Employs TanStack Query (react-query) for data fetching and state management
   - Implements internationalization support via i18next
   - Includes dark/light theme support via next-themes
   - Styled with Tailwind CSS and shadcn/ui component library

2. **Component Structure**
   - Uses a hierarchical component architecture:
     - `/components/ui`: Base UI components from shadcn/ui
     - `/components/project`: Project-specific components
     - `/components/chat`: Chat interface components
     - `/layouts`: Layout components like MainLayout
   - Pages are organized in the `/pages` directory following a route-based structure

3. **State Management**
   - React Context for global state (auth, theme)
   - TanStack Query for server state management
   - Custom hooks for shared functionality

### Backend Architecture

1. **Server Application**
   - Express.js-based RESTful API
   - TypeScript for type safety
   - Session-based authentication with Passport.js
   - API route organization in `server/routes.ts`

2. **Service Layer**
   - Weather service for environmental data
   - Pricing service for BOQ generation
   - Text-to-speech service for accessibility

3. **Data Access Layer**
   - Drizzle ORM for database operations
   - Storage interface abstraction for database operations
   - Session store for user sessions

### Database Schema

The database schema consists of four primary entities:

1. **Users**
   - User authentication and profile data
   - Role-based access control (architect role)

2. **Projects**
   - Core project information (name, description, location)
   - Technical specifications (land area, budget)
   - Cultural styles and project statuses

3. **Designs**
   - Versioned design data stored as JSON
   - Environmental analysis data
   - Links to project

4. **BOQs (Bill of Quantities)**
   - Material quantities and costs
   - Total project cost calculations
   - Budget tracking

## Data Flow

### Authentication Flow

1. User submits login credentials
2. Server validates credentials against stored password hash
3. On success, creates a session and returns user data
4. Client stores session cookie for subsequent authenticated requests
5. Protected routes check for valid session

### Project Creation and Management Flow

1. User creates a new project with metadata (location, budget, etc.)
2. Server stores project in database and associates with user
3. User can view and edit project details
4. Project designs are created and stored as versioned documents
5. Environmental data is fetched from external APIs based on project location
6. BOQs are generated based on design specifications

### Design Generation Flow

1. User requests design generation for a project
2. Server processes design request using project parameters
3. Environmental data is incorporated from weather services
4. Design data is stored with versioning support
5. BOQ is automatically generated based on the design
6. User can review and modify the generated design

## External Dependencies

### Frontend Dependencies

- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query
- **Routing**: wouter
- **Forms**: react-hook-form with zod validation
- **Internationalization**: i18next

### Backend Dependencies

- **Server Framework**: Express.js
- **Authentication**: Passport.js with local strategy
- **Database ORM**: Drizzle with PostgreSQL
- **API Integrations**:
  - Weather data services (WeatherAPI, OpenWeatherMap)
  - Text-to-speech services (configurable via environment variables)
  - Material pricing services (Mowarrid, Gleeds Report)

## Deployment Strategy

The application is configured for deployment on Replit with the following characteristics:

1. **Development Environment**
   - Uses Vite for fast development experience
   - Supports hot module replacement
   - Configured for TypeScript

2. **Production Build**
   - Vite builds the frontend static assets
   - esbuild compiles the server code
   - Static assets are served by the Express server

3. **Database**
   - Configured to work with PostgreSQL
   - Connection details set via environment variables
   - Uses Drizzle migrations for schema management

4. **Environment Configuration**
   - Development mode with enhanced logging
   - Production mode with optimized builds
   - Environment variables for API keys and secrets

5. **Scalability Considerations**
   - The architecture supports horizontal scaling with stateless server design
   - Session management via dedicated store enables scaling

## Security Considerations

1. **Authentication**
   - Password hashing using scrypt
   - Session-based authentication with secure cookies
   - CSRF protection through session management

2. **API Security**
   - Input validation with zod schemas
   - Error handling that prevents leaking sensitive information
   - Authentication middleware for protected routes

3. **Data Protection**
   - Environment variables for sensitive configuration
   - Secure password storage with salt
   - Timing-safe comparison for password verification
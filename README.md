# ProjektLabor

## User Profile Management

This application includes a complete user profile management system with the following features:

### Database Schema

User data is stored in the SQL Server database using ASP.NET Core Identity with a custom `ApplicationUser` entity:

```csharp
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; }      // User's full name
    public string ResumePath { get; set; }    // Path to uploaded resume
}
```

The database schema is managed with Entity Framework Core migrations.

### Backend API Endpoints

#### User Profile Endpoints

1. **GET /api/v1/users/me** - Get current user's profile
   - Authentication: Required (JWT Bearer token)
   - Response:
     ```json
     {
       "id": "string",
       "email": "string",
       "fullName": "string",
       "roles": ["string"]
     }
     ```

2. **PATCH /api/v1/users/me** - Update current user's profile
   - Authentication: Required (JWT Bearer token)
   - Request Body:
     ```json
     {
       "fullName": "string"
     }
     ```
   - Response:
     ```json
     {
       "id": "string",
       "email": "string",
       "fullName": "string"
     }
     ```

3. **POST /api/v1/users/change-password** - Change user's password
   - Authentication: Required (JWT Bearer token)
   - Request Body:
     ```json
     {
       "currentPassword": "string",
       "newPassword": "string"
     }
     ```
   - Response: 200 OK on success, 400 Bad Request with error details on failure

#### Admin Endpoints

4. **GET /api/v1/users** - List all users (Admin only)
   - Authentication: Required (Admin role)
   - Authorization Policy: AdminPolicy
   - Response:
     ```json
     {
       "items": [
         {
           "id": "string",
           "email": "string",
           "fullName": "string",
           "roles": ["string"]
         }
       ],
       "total": 0
     }
     ```

### Frontend UI Components

#### Profile Page (`/profile`)

The profile page provides a user-friendly interface for managing user information:

**Features:**
- Display user email (read-only)
- Edit full name with live validation
- View assigned roles
- Change password functionality in a separate card
- Loading states and error handling
- Success toast notifications on updates

**Components:**
1. **Profile Information Card**
   - Shows email address
   - Editable full name field
   - Save button with loading state
   - Displays user roles

2. **Change Password Card**
   - Current password input
   - New password input with validation (min 6 characters)
   - Submit button with loading state
   - Form clears on successful password change

#### Admin Users Page (`/admin/users`)

Admin users can view a list of all users in the system:

**Features:**
- Paginated table of all users
- Display email, full name, and roles for each user
- Loading states
- Error handling
- Accessible only to users with Admin role

### Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Role-Based Authorization**: Admin endpoints restricted to Admin role
- **Password Requirements**: 
  - Minimum 6 characters length
  - Configurable in `Program.cs`
- **Unique Email**: Email addresses must be unique across all users

### Technology Stack

**Backend:**
- ASP.NET Core 9.0
- Entity Framework Core
- ASP.NET Core Identity
- SQL Server
- JWT Bearer Authentication

**Frontend:**
- React 19
- TypeScript
- React Router
- React Hook Form
- TanStack Query (React Query)
- Axios
- React Hot Toast
- Tailwind CSS

### Getting Started

#### Backend Setup

1. Configure database connection in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=...;Database=...;..."
     }
   }
   ```

2. Run migrations:
   ```bash
   cd ProjektLabor/ProjektLabor
   dotnet ef database update
   ```

3. Run the backend:
   ```bash
   dotnet run
   ```

#### Frontend Setup

1. Install dependencies:
   ```bash
   cd ProjektLabor/Frontend
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
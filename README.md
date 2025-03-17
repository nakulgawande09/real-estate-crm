# Real Estate CRM

A comprehensive CRM system for real estate agents and brokers to manage properties, clients, and sales.

## Features

- Property management with detailed property listings
- Lead tracking and management system
- User authentication and role-based access control
- Dashboard with key performance metrics
- Responsive design for desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Icons**: React Icons

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd real-estate-crm
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/real-estate-crm

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here # Replace with a secure random string in production

# API Routes
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app/*` - App Router pages and API routes
- `src/components/*` - Reusable React components
- `src/lib/*` - Utility functions and libraries
- `src/models/*` - MongoDB/Mongoose models
- `public/*` - Static assets

## Setting Up Admin User

To set up the initial admin user, you'll need to run a script or manually insert a user into the MongoDB database:

```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "<hashed-password>", // Use bcrypt to hash the password
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Development

### Creating a New Model

1. Create a new file in the `src/models` directory
2. Define the Mongoose schema and model
3. Export the model

### Creating API Routes

API routes are located in `src/app/api/*` directory. Each route should export GET, POST, etc. handler functions.

## License

[MIT](LICENSE)

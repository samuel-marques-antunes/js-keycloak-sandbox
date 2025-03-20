# Keycloak Sandbox Project

This project provides a sandbox environment for experimenting with Keycloak authentication in a JavaScript application. It includes a Docker setup for Keycloak, a simple Node.js backend, and a basic HTML/JavaScript frontend.

## Prerequisites

- Docker
- Docker Compose
- Node.js
- npm

## Project Structure

- `/frontend`: Contains a simple HTML/JavaScript application that demonstrates Keycloak authentication
- `/backend`: Contains a Node.js Express application with Keycloak-protected endpoints
- `docker-compose.yml`: Configuration for the Keycloak Docker container

## Getting Started

### Environment Configuration

This project uses a `.env` file to manage environment variables. A sample `.env.example` file is provided as a template:

```
# Keycloak Configuration
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KC_DB=dev-file
KEYCLOAK_PORT=8080
```

To set up your environment:

1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Customize the values in the `.env` file as needed.

The `.env` file is excluded from version control for security reasons, while the `.env.example` file is committed as a template.

### Starting Keycloak

To start the Keycloak server, run the following command in the project directory:

```bash
docker-compose up -d
```

This will start Keycloak in detached mode. The server will be available at http://localhost:${KEYCLOAK_PORT} (default: http://localhost:8080).

### Stopping Keycloak

To stop the Keycloak server, run:

```bash
docker-compose down
```

To stop the server and remove the volumes (this will delete all data), run:

```bash
docker-compose down -v
```

## Accessing Keycloak Admin Console

Once Keycloak is running, you can access the admin console at http://localhost:${KEYCLOAK_PORT}/admin (default: http://localhost:8080/admin).

Default admin credentials:
- Username: admin
- Password: admin

## Keycloak Configuration

The Keycloak instance is configured using environment variables defined in the `.env` file:

- Admin user: `${KEYCLOAK_ADMIN}` (default: admin)
- Admin password: `${KEYCLOAK_ADMIN_PASSWORD}` (default: admin)
- Database: `${KC_DB}` (default: dev-file, suitable for development)
- Port: `${KEYCLOAK_PORT}` (default: 8080)

### Realm and Client Setup

After starting Keycloak, you need to:

1. Create a new realm named "proxym"
2. Create a new client named "my-app" with:
   - Client Protocol: openid-connect
   - Access Type: public
   - Valid Redirect URIs: http://localhost:63342/*
   - Web Origins: http://localhost:63342

## Data Persistence

Keycloak data is stored in a Docker volume named `keycloak_data`. This ensures that your configuration and user data persist even if the container is stopped or removed.

## Keycloak Client Configuration

The project includes separate `keycloak.json` files in both the frontend and backend directories. These files contain identical configuration for the Keycloak client:

- Realm: "proxym"
- Auth server URL: "http://localhost:8080/"
- Client ID (resource): "my-app"

## Running the Application

### Backend

To run the backend:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:3000 with the following endpoints:
- `/`: Public endpoint
- `/protected`: Protected endpoint requiring authentication
- `/protected-for-special-role`: Protected endpoint requiring the "realm:superuser" role

### Frontend

The frontend is a static HTML file that can be opened directly in a browser. It's configured to connect to the backend at http://localhost:3000 and to Keycloak at http://localhost:8080.

The frontend provides UI elements to:
- Login/logout with Keycloak
- Refresh tokens
- Get user info
- Call protected backend endpoints
- Display token information

## Security Considerations

The default configuration is suitable for development purposes only. For production use, consider:

1. Changing the admin credentials
2. Using a proper database (PostgreSQL, MySQL, etc.)
3. Setting up HTTPS
4. Configuring proper backup strategies
